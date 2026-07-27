import { Check, Copy } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { PROFILE_LINKS } from '../../data/navigation';

export const CopyEmailButton = () => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE_LINKS.emailAddress);
      setCopied(true);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = PROFILE_LINKS.email;
    }
  };

  return (
    <button type="button" onClick={() => { void copyEmail(); }} className="copy-email-button" aria-live="polite">
      {copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy email'}
    </button>
  );
};
