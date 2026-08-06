import { motion } from 'framer-motion';
import { MapPin } from '@phosphor-icons/react';
import { ProjectImage } from '../ui/ProjectImage';
import { SectionHeading } from '../ui/SectionHeading';
import ScrollReveal from '../ScrollReveal';
import { sectionReveal } from './motion';

const FOCUS = [
  'Useful software over feature volume',
  'Ownership from interface to deployment',
  'Clear integrations and reliable workflows',
  'Learning through real product work',
];

export const AboutSection = () => (
  <section id="about" className="section-shell" aria-labelledby="about-heading">
    <SectionHeading
      number="05"
      label="about"
      id="about-heading"
      title="Building useful software across the full system."
      comment="Product thinking, implementation, and ownership."
    />
    <div className="about-layout">
      <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="about-copy">
        <ScrollReveal as="p" baseOpacity={1} baseRotation={0} blurStrength={4} rotationEnd="bottom 85%" wordAnimationEnd="bottom 85%">
          I’m a full-stack developer and AI automation engineer focused on turning product ideas and repetitive work into practical digital systems.
        </ScrollReveal>
        <ScrollReveal as="p" baseOpacity={1} baseRotation={0} blurStrength={4} rotationEnd="bottom 85%" wordAnimationEnd="bottom 85%">
          I enjoy working across interface design, application logic, databases, APIs, and workflow automation—especially when one person needs to understand and own the whole path from idea to deployment.
        </ScrollReveal>
        <ScrollReveal as="p" baseOpacity={1} baseRotation={0} blurStrength={4} rotationEnd="bottom 85%" wordAnimationEnd="bottom 85%">
          My independent work includes travel products, automation prototypes, and production websites. I’m open to startup collaboration, full-stack development, and automation projects.
        </ScrollReveal>
        <ScrollReveal as="p" containerClassName="about-location" baseOpacity={1} baseRotation={0} blurStrength={4} rotationEnd="bottom 85%" wordAnimationEnd="bottom 85%"><MapPin size={16} aria-hidden="true" />Based in the Philippines and available for remote opportunities.</ScrollReveal>
        <ul className="about-focus">{FOCUS.map((item) => <li key={item}>{item}</li>)}</ul>
      </motion.div>
      <motion.figure variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="about-portrait">
        <div className="halftone halftone-portrait" aria-hidden="true" />
        <ProjectImage src="/images/dione-profile.webp" alt="Dione Raze Oro" width={875} height={1200} />
        <figcaption>Davao City, Philippines · PHT</figcaption>
      </motion.figure>
    </div>
  </section>
);
