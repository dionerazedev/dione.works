import { useCallback, useEffect, useState } from 'react';
import { ArrowCounterClockwise, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import { BasketballCourt } from './BasketballCourt';
import { useBasketballPhysics, type GamePhase } from './useBasketballPhysics';

const STATUS_LABELS: Record<GamePhase, string> = {
  ready: 'ready',
  dragging: 'aiming',
  flying: 'in flight',
  made: 'made +1',
  missed: 'miss',
  resetting: 'resetting',
};

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
};

const playCue = (cue: 'rim' | 'made') => {
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = cue === 'made' ? 'sine' : 'triangle';
  oscillator.frequency.setValueAtTime(cue === 'made' ? 620 : 180, context.currentTime);
  if (cue === 'made') oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.08);
  gain.gain.setValueAtTime(cue === 'made' ? 0.025 : 0.018, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.11);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.12);
  oscillator.addEventListener('ended', () => void context.close(), { once: true });
};

export const SidebarPlayground = ({ soundEnabled, onToggleSound }: { soundEnabled: boolean; onToggleSound: () => void }) => {
  const reducedMotion = useReducedMotion();
  const onCue = useCallback((cue: 'rim' | 'made') => { if (soundEnabled) playCue(cue); }, [soundEnabled]);
  const game = useBasketballPhysics({ reducedMotion, onCue });

  return <section className="sidebar-playground" aria-labelledby="playground-label">
    <header className="playground-heading">
      <span id="playground-label" className="sidebar-micro-label">playground</span>
      <div>
        <strong>shootaround</strong>
        <span aria-live="polite">{STATUS_LABELS[game.phase]}</span>
      </div>
    </header>

    <BasketballCourt
      ball={game.ball}
      phase={game.phase}
      trajectory={game.trajectory}
      rimImpact={game.rimImpact}
      rimCollisions={game.rimCollisions}
      backboardCollisions={game.backboardCollisions}
      onPointerDown={game.beginDrag}
      onPointerMove={game.drag}
      onPointerUp={game.release}
      onPointerCancel={game.cancelDrag}
      onKeyDown={game.handleKeyDown}
    />

    <div className="playground-scoreboard">
      <span>drag / release</span>
      <dl>
        <div><dt>made</dt><dd>{String(game.madeShots).padStart(2, '0')}</dd></div>
        <div><dt>best</dt><dd>{String(game.bestScore).padStart(2, '0')}</dd></div>
      </dl>
    </div>

    <div className="playground-controls">
      <button type="button" onClick={game.reset} aria-label="Reset basketball" title="Reset ball"><ArrowCounterClockwise size={12} aria-hidden="true" />reset</button>
      <button type="button" onClick={onToggleSound} aria-label={`Turn playground sound ${soundEnabled ? 'off' : 'on'}`} aria-pressed={soundEnabled} title={`Sound ${soundEnabled ? 'on' : 'off'}`}>
        {soundEnabled ? <SpeakerHigh size={12} aria-hidden="true" /> : <SpeakerSlash size={12} aria-hidden="true" />}sound
      </button>
    </div>
  </section>;
};
