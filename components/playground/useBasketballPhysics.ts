import { useCallback, useEffect, useRef, useState } from 'react';

export type Point = { x: number; y: number };
export type BallFrame = Point & { rotation: number };
export type GamePhase = 'ready' | 'dragging' | 'flying' | 'made' | 'missed' | 'resetting';

export const COURT = {
  width: 204,
  height: 126,
  floor: 119,
  ballRadius: 5.5,
  start: { x: 32, y: 103 },
  gravity: 260,
  rimY: 39,
  rimLeft: 156,
  rimRight: 181,
  backboardX: 190,
} as const;

const BEST_SCORE_KEY = 'dione-shootaround-best';
const DEFAULT_KEYBOARD_VELOCITY = { x: 118, y: -205 };
const MAX_PULL = 44;

const length = (point: Point) => Math.hypot(point.x, point.y);
const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));

const projectedPoints = (origin: Point, velocity: Point) => {
  const points: Point[] = [];
  for (let step = 1; step <= 15; step += 1) {
    const time = step * 0.075;
    const point = {
      x: origin.x + velocity.x * time,
      y: origin.y + velocity.y * time + 0.5 * COURT.gravity * time * time,
    };
    if (point.x < 0 || point.x > COURT.width || point.y > COURT.floor) break;
    points.push(point);
  }
  return points;
};

const pullVelocity = (pull: Point) => {
  const power = length(pull);
  return {
    x: pull.x * 7,
    y: pull.y * 9 - power * 5,
  };
};

type BasketballPhysicsOptions = {
  reducedMotion: boolean;
  onCue?: (cue: 'rim' | 'made') => void;
};

export const useBasketballPhysics = ({ reducedMotion, onCue }: BasketballPhysicsOptions) => {
  const [ball, setBall] = useState<BallFrame>({ ...COURT.start, rotation: 0 });
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [trajectory, setTrajectory] = useState<Point[]>([]);
  const [madeShots, setMadeShots] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [rimImpact, setRimImpact] = useState(0);
  const [rimCollisions, setRimCollisions] = useState(0);
  const [backboardCollisions, setBackboardCollisions] = useState(0);
  const [keyboardVelocity, setKeyboardVelocity] = useState(DEFAULT_KEYBOARD_VELOCITY);

  const phaseRef = useRef<GamePhase>('ready');
  const ballRef = useRef<BallFrame>({ ...COURT.start, rotation: 0 });
  const velocityRef = useRef<Point>({ x: 0, y: 0 });
  const pointerRef = useRef<number | null>(null);
  const pullRef = useRef<Point>({ x: 0, y: 0 });
  const shotScoredRef = useRef(false);
  const attemptElapsedRef = useRef(0);
  const phaseStartedRef = useRef(0);
  const resetFromRef = useRef<BallFrame>({ ...COURT.start, rotation: 0 });
  const lastRimCueRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  const changePhase = useCallback((next: GamePhase, now = performance.now()) => {
    phaseRef.current = next;
    phaseStartedRef.current = now;
    setPhase(next);
  }, []);

  const updateBall = useCallback((next: BallFrame) => {
    ballRef.current = next;
    setBall(next);
  }, []);

  const startReset = useCallback((now = performance.now()) => {
    resetFromRef.current = { ...ballRef.current };
    setTrajectory([]);
    changePhase('resetting', now);
  }, [changePhase]);

  const finishReset = useCallback(() => {
    const start = { ...COURT.start, rotation: 0 };
    velocityRef.current = { x: 0, y: 0 };
    shotScoredRef.current = false;
    attemptElapsedRef.current = 0;
    pullRef.current = { x: 0, y: 0 };
    setKeyboardVelocity(DEFAULT_KEYBOARD_VELOCITY);
    updateBall(start);
    changePhase('ready');
  }, [changePhase, updateBall]);

  useEffect(() => {
    let frame: number | null = null;
    try {
      const stored = Number.parseInt(window.localStorage.getItem(BEST_SCORE_KEY) ?? '0', 10);
      if (Number.isFinite(stored) && stored > 0) frame = requestAnimationFrame(() => setBestScore(stored));
    } catch { /* Storage can be unavailable in privacy modes. */ }
    return () => { if (frame !== null) cancelAnimationFrame(frame); };
  }, []);

  const recordScore = useCallback(() => {
    setMadeShots((current) => {
      const next = current + 1;
      setBestScore((best) => {
        const nextBest = Math.max(best, next);
        try { window.localStorage.setItem(BEST_SCORE_KEY, String(nextBest)); } catch { /* Storage can be unavailable. */ }
        return nextBest;
      });
      return next;
    });
    onCue?.('made');
  }, [onCue]);

  useEffect(() => {
    const collideWithRim = (position: BallFrame, velocity: Point, rimX: number, now: number) => {
      const dx = position.x - rimX;
      const dy = position.y - COURT.rimY;
      const minimumDistance = COURT.ballRadius + 1.65;
      const distance = Math.hypot(dx, dy);
      if (distance >= minimumDistance || distance === 0) return false;
      const nx = dx / distance;
      const ny = dy / distance;
      const approach = velocity.x * nx + velocity.y * ny;
      position.x = rimX + nx * minimumDistance;
      position.y = COURT.rimY + ny * minimumDistance;
      if (approach < 0) {
        velocity.x -= 1.72 * approach * nx;
        velocity.y -= 1.72 * approach * ny;
        velocity.x *= 0.82;
        velocity.y *= 0.82;
        if (now - lastRimCueRef.current > 90) {
          lastRimCueRef.current = now;
          setRimImpact((value) => value + 1);
          setRimCollisions((value) => value + 1);
          onCue?.('rim');
        }
      }
      return true;
    };

    const animate = (now: number) => {
      const previous = lastFrameRef.current ?? now;
      const delta = Math.min((now - previous) / 1000, 0.034);
      lastFrameRef.current = now;
      const currentPhase = phaseRef.current;

      if (currentPhase === 'flying' || currentPhase === 'made') {
        const position = { ...ballRef.current };
        const velocity = velocityRef.current;
        const substeps = Math.max(1, Math.ceil(delta / 0.008));
        const stepTime = delta / substeps;

        for (let step = 0; step < substeps; step += 1) {
          const previousY = position.y;
          velocity.y += COURT.gravity * stepTime;
          position.x += velocity.x * stepTime;
          position.y += velocity.y * stepTime;
          position.rotation += velocity.x * stepTime * 1.8;

          if (!shotScoredRef.current
            && velocity.y > 0
            && previousY <= COURT.rimY
            && position.y > COURT.rimY
            && position.x > COURT.rimLeft + 7
            && position.x < COURT.rimRight - 7) {
            shotScoredRef.current = true;
            recordScore();
            changePhase('made', now);
          }

          collideWithRim(position, velocity, COURT.rimLeft, now);
          collideWithRim(position, velocity, COURT.rimRight, now);

          if (position.x + COURT.ballRadius > COURT.backboardX
            && position.x - COURT.ballRadius < COURT.backboardX + 2
            && position.y > 15
            && position.y < 54
            && velocity.x > 0) {
            position.x = COURT.backboardX - COURT.ballRadius;
            velocity.x *= -0.72;
            velocity.y *= 0.94;
            setRimImpact((value) => value + 1);
            setBackboardCollisions((value) => value + 1);
            onCue?.('rim');
          }

          if (position.x < COURT.ballRadius) {
            position.x = COURT.ballRadius;
            velocity.x = Math.abs(velocity.x) * 0.72;
          } else if (position.x > COURT.width - COURT.ballRadius) {
            position.x = COURT.width - COURT.ballRadius;
            velocity.x = -Math.abs(velocity.x) * 0.72;
          }

          if (position.y < COURT.ballRadius) {
            position.y = COURT.ballRadius;
            velocity.y = Math.abs(velocity.y) * 0.72;
          }

          if (position.y > COURT.floor - COURT.ballRadius) {
            position.y = COURT.floor - COURT.ballRadius;
            velocity.y = -Math.abs(velocity.y) * 0.58;
            velocity.x *= 0.78;
            if (Math.abs(velocity.y) < 22) velocity.y = 0;
          }
        }

        attemptElapsedRef.current += delta;
        updateBall(position);
        if (currentPhase === 'made' && now - phaseStartedRef.current > (reducedMotion ? 80 : 720)) {
          startReset(now);
        } else if (currentPhase === 'flying'
          && ((position.y >= COURT.floor - COURT.ballRadius - 0.1 && Math.abs(velocity.y) < 1)
            || attemptElapsedRef.current > 5.5)) {
          changePhase('missed', now);
        }
      } else if (currentPhase === 'missed' && now - phaseStartedRef.current > (reducedMotion ? 40 : 320)) {
        startReset(now);
      } else if (currentPhase === 'resetting') {
        if (reducedMotion) {
          finishReset();
        } else {
          const progress = clamp((now - phaseStartedRef.current) / 360, 0, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const from = resetFromRef.current;
          updateBall({
            x: from.x + (COURT.start.x - from.x) * eased,
            y: from.y + (COURT.start.y - from.y) * eased,
            rotation: from.rotation * (1 - eased),
          });
          if (progress >= 1) finishReset();
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastFrameRef.current = null;
    };
  }, [changePhase, finishReset, onCue, recordScore, reducedMotion, startReset, updateBall]);

  const pointFromPointer = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * COURT.width,
      y: ((event.clientY - bounds.top) / bounds.height) * COURT.height,
    };
  }, []);

  const beginDrag = useCallback((event: React.PointerEvent<SVGElement>) => {
    if (phaseRef.current !== 'ready') return;
    event.preventDefault();
    pointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    changePhase('dragging');
  }, [changePhase]);

  const drag = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    if (phaseRef.current !== 'dragging' || pointerRef.current !== event.pointerId) return;
    event.preventDefault();
    const point = pointFromPointer(event);
    const rawPull = { x: COURT.start.x - point.x, y: COURT.start.y - point.y };
    const rawLength = length(rawPull);
    const scale = rawLength > MAX_PULL ? MAX_PULL / rawLength : 1;
    const pull = { x: rawPull.x * scale, y: rawPull.y * scale };
    pullRef.current = pull;
    const next = {
      x: clamp(COURT.start.x - pull.x, COURT.ballRadius, COURT.width - COURT.ballRadius),
      y: clamp(COURT.start.y - pull.y, COURT.ballRadius, COURT.floor - COURT.ballRadius),
      rotation: pull.x * -2,
    };
    updateBall(next);
    setTrajectory(projectedPoints(next, pullVelocity(pull)));
  }, [pointFromPointer, updateBall]);

  const launch = useCallback((velocity: Point) => {
    if (length(velocity) < 36) {
      startReset();
      return;
    }
    velocityRef.current = velocity;
    shotScoredRef.current = false;
    attemptElapsedRef.current = 0;
    setTrajectory([]);
    changePhase('flying');
  }, [changePhase, startReset]);

  const release = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    if (phaseRef.current !== 'dragging' || pointerRef.current !== event.pointerId) return;
    pointerRef.current = null;
    launch(pullVelocity(pullRef.current));
  }, [launch]);

  const cancelDrag = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    if (phaseRef.current !== 'dragging' || pointerRef.current !== event.pointerId) return;
    pointerRef.current = null;
    startReset();
  }, [startReset]);

  const aimWithKeyboard = useCallback((nextVelocity: Point) => {
    setKeyboardVelocity(nextVelocity);
    setTrajectory(projectedPoints(COURT.start, nextVelocity));
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<SVGSVGElement>) => {
    if (event.key.toLowerCase() === 'r') {
      event.preventDefault();
      startReset();
      return;
    }
    if (phaseRef.current !== 'ready') return;
    let next = keyboardVelocity;
    if (event.key === 'ArrowLeft') next = { ...next, x: clamp(next.x - 8, 70, 220) };
    else if (event.key === 'ArrowRight') next = { ...next, x: clamp(next.x + 8, 70, 220) };
    else if (event.key === 'ArrowUp') next = { ...next, y: clamp(next.y - 8, -340, -130) };
    else if (event.key === 'ArrowDown') next = { ...next, y: clamp(next.y + 8, -340, -130) };
    else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      launch(keyboardVelocity);
      return;
    } else return;
    event.preventDefault();
    aimWithKeyboard(next);
  }, [aimWithKeyboard, keyboardVelocity, launch, startReset]);

  const reset = useCallback(() => {
    pointerRef.current = null;
    startReset();
  }, [startReset]);

  return {
    ball,
    phase,
    trajectory,
    madeShots,
    bestScore,
    rimImpact,
    rimCollisions,
    backboardCollisions,
    beginDrag,
    drag,
    release,
    cancelDrag,
    handleKeyDown,
    reset,
  };
};
