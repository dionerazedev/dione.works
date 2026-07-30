import type { PointerEvent as ReactPointerEvent } from 'react';
import { COURT, type BallFrame, type GamePhase, type Point } from './useBasketballPhysics';

export const TrajectoryGuide = ({ points }: { points: Point[] }) => (
  <g className="trajectory-guide" aria-hidden="true">
    {points.map((point, index) => <circle key={`${index}-${point.x.toFixed(1)}`} cx={point.x} cy={point.y} r={Math.max(0.65, 1.4 - index * 0.05)} />)}
  </g>
);

export const Basketball = ({ ball, isDragging, onPointerDown }: { ball: BallFrame; isDragging: boolean; onPointerDown: (event: ReactPointerEvent<SVGElement>) => void }) => (
  <g
    className={`playground-ball ${isDragging ? 'is-dragging' : ''}`}
    transform={`translate(${ball.x} ${ball.y}) rotate(${ball.rotation})`}
    onPointerDown={onPointerDown}
    aria-hidden="true"
  >
    <circle r={COURT.ballRadius} />
    <path d="M-5.2 0h10.4M0-5.2c-2.5 2.9-2.5 7.5 0 10.4M0-5.2c2.5 2.9 2.5 7.5 0 10.4" />
  </g>
);

export const Hoop = ({ phase, rimImpact }: { phase: GamePhase; rimImpact: number }) => (
  <g className={`playground-hoop ${phase === 'made' ? 'is-made' : ''}`} aria-hidden="true">
    <path className="playground-backboard" d={`M${COURT.backboardX} 16v39M${COURT.backboardX} 22h6`} />
    <g key={rimImpact} className={rimImpact > 0 ? 'playground-rim is-hit' : 'playground-rim'} data-impact={rimImpact}>
      <path d={`M${COURT.rimLeft} ${COURT.rimY}h${COURT.rimRight - COURT.rimLeft}`} />
      <circle cx={COURT.rimLeft} cy={COURT.rimY} r="1.6" />
      <circle cx={COURT.rimRight} cy={COURT.rimY} r="1.6" />
    </g>
    <g className="playground-net">
      <path d={`M${COURT.rimLeft + 2} ${COURT.rimY + 2}l4 17h15l4-17M${COURT.rimLeft + 6} ${COURT.rimY + 3}l4 14m7-14l-4 14M${COURT.rimLeft + 4} ${COURT.rimY + 9}h19`} />
    </g>
  </g>
);

type BasketballCourtProps = {
  ball: BallFrame;
  phase: GamePhase;
  trajectory: Point[];
  rimImpact: number;
  rimCollisions: number;
  backboardCollisions: number;
  onPointerDown: (event: ReactPointerEvent<SVGElement>) => void;
  onPointerMove: (event: ReactPointerEvent<SVGSVGElement>) => void;
  onPointerUp: (event: ReactPointerEvent<SVGSVGElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<SVGSVGElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<SVGSVGElement>) => void;
};

export const BasketballCourt = ({ ball, phase, trajectory, rimImpact, rimCollisions, backboardCollisions, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onKeyDown }: BasketballCourtProps) => (
  <svg
    className="basketball-court"
    viewBox={`0 0 ${COURT.width} ${COURT.height}`}
    role="application"
    tabIndex={0}
    aria-label="Shootaround. Drag the ball backward and release to shoot. Keyboard: arrow keys aim, Space or Enter shoots, R resets."
    data-rim-collisions={rimCollisions}
    data-backboard-collisions={backboardCollisions}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    onPointerCancel={onPointerCancel}
    onKeyDown={onKeyDown}
  >
    <defs>
      <pattern id="shootaround-dot-grid" width="9" height="9" patternUnits="userSpaceOnUse">
        <circle className="court-dot" cx="1" cy="1" r="0.55" />
      </pattern>
    </defs>
    <rect className="court-dot-grid" width={COURT.width} height={COURT.height} fill="url(#shootaround-dot-grid)" />
    <path className="court-floor" d={`M0 ${COURT.floor}h${COURT.width}`} />
    <TrajectoryGuide points={trajectory} />
    <Hoop phase={phase} rimImpact={rimImpact} />
    <Basketball ball={ball} isDragging={phase === 'dragging'} onPointerDown={onPointerDown} />
  </svg>
);
