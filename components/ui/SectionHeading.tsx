import ScrollReveal from '../ScrollReveal';

export const SectionHeading = ({ number, label, title, comment, id }: { number: string; label: string; title: string; comment?: string; id: string }) => (
  <header className="section-heading">
    <p className="section-index">{number} — {label}</p>
    <ScrollReveal as="h2" id={id} baseOpacity={1} baseRotation={0} blurStrength={5} rotationEnd="bottom 85%" wordAnimationEnd="bottom 85%">{title}</ScrollReveal>
    {comment && (
      <ScrollReveal as="p" baseOpacity={1} baseRotation={0} blurStrength={4} containerClassName="section-comment" rotationEnd="bottom 85%" wordAnimationEnd="bottom 85%">{comment}</ScrollReveal>
    )}
  </header>
);
