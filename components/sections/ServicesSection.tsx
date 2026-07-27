import { ArrowRight } from '@phosphor-icons/react';
import { SERVICES } from '../../data/services';
import { SectionHeading } from '../ui/SectionHeading';

export const ServicesSection = () => <section id="services" className="section-shell capabilities-section" aria-labelledby="services-heading"><SectionHeading number="05" label="capabilities" id="services-heading" title="What I can build and connect." comment="Capabilities describe deliverables. The stack describes the tools used to make them." /><div className="capability-list">{SERVICES.map((service) => <article key={service.id}><div><h3>{service.title}</h3><p>{service.description}</p></div><ul>{service.deliverables.map((item) => <li key={item}><ArrowRight size={12} />{item}</li>)}</ul></article>)}</div></section>;
