import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, GithubLogo, PlayCircle } from '@phosphor-icons/react';
import { Link, useParams } from 'react-router-dom';
import { ALL_PROJECTS, PROJECTS_BY_SLUG } from '../data/projects';
import type { ProjectImage as ProjectImageData } from '../types/project';
import { ImageLightbox } from '../components/projects/ImageLightbox';
import { ProjectStatusBadge } from '../components/projects/ProjectStatusBadge';
import { ProjectImage } from '../components/ui/ProjectImage';
import { EditorCanvas } from '../components/ui/EditorCanvas';
import { useRouteMetadata } from '../components/ui/useRouteMetadata';
import { NotFoundPage } from './NotFoundPage';

const asItems = (value?: string | string[]) => Array.isArray(value) ? value : value ? [value] : [];

export const CaseStudyPage = () => {
  const { slug = '' } = useParams();
  const project = PROJECTS_BY_SLUG[slug];
  const [selectedImage, setSelectedImage] = useState<ProjectImageData | null>(null);
  const structuredData = useMemo(() => project ? ({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: `https://dioneraze.com/work/${project.slug}`,
    creator: { '@type': 'Person', name: 'Dione Raze Oro' },
    image: `https://dioneraze.com${project.imageUrl}`,
    keywords: project.stack?.join(', '),
  }) : undefined, [project]);

  useRouteMetadata({
    title: project ? `${project.title} Case Study | Dione Raze Oro` : 'Project Not Found | Dione Raze Oro',
    description: project?.description ?? 'The requested portfolio project could not be found.',
    canonicalPath: project ? `/work/${project.slug}` : `/work/${slug}`,
    image: project?.imageUrl,
    structuredData,
  });

  if (!project) return <NotFoundPage embedded />;

  const projectIndex = ALL_PROJECTS.findIndex((item) => item.slug === project.slug);
  const previousProject = projectIndex > 0 ? ALL_PROJECTS[projectIndex - 1] : null;
  const nextProject = projectIndex < ALL_PROJECTS.length - 1 ? ALL_PROJECTS[projectIndex + 1] : null;

  const gallery = project.images?.length ? project.images : [{
    src: project.imageUrl,
    alt: project.imageAlt,
    width: project.imageWidth,
    height: project.imageHeight,
    label: project.title,
    kind: 'workflow' as const,
  }];
  const solutions = asItems(project.solution);
  const optionalSections = [
    { label: 'target users', title: 'Who the project is for', items: project.targetUsers },
    { label: 'goals', title: 'What the project set out to do', items: project.goals },
    { label: 'features', title: 'Product features', items: project.features },
    { label: 'user flow', title: 'How the flow works', items: project.userFlow },
    { label: 'architecture', title: 'System architecture', items: project.architecture },
    { label: 'database', title: 'Database structure', items: project.databaseNotes },
    { label: 'integrations', title: 'API and service integrations', items: project.integrations },
    { label: 'process', title: 'Development process', items: project.process },
    { label: 'challenges', title: 'Challenges and solutions', items: project.challenges },
    { label: 'lessons', title: 'Lessons learned', items: project.lessons },
    { label: 'future', title: 'Future improvements', items: project.futureImprovements },
  ].filter((section) => section.items?.length);
  let nextSectionNumber = 1;
  const problemNumber = project.problem ? nextSectionNumber++ : null;
  const solutionNumber = solutions.length > 0 ? nextSectionNumber++ : null;
  const capabilitiesNumber = project.technicalCapabilities?.length ? nextSectionNumber++ : null;
  const numberedOptionalSections = optionalSections.map((section) => ({ ...section, number: nextSectionNumber++ }));
  const measuredResultsNumber = project.measuredResults?.length ? nextSectionNumber++ : null;
  const expectedBenefitsNumber = project.expectedBenefits?.length ? nextSectionNumber++ : null;
  const outcomeNumber = project.outcome ? nextSectionNumber++ : null;
  const sectionIndex = (number: number | null, label: string) => `${String(number).padStart(2, '0')} — ${label}`;

  return (
    <EditorCanvas>
      <article className="case-study-page">
        <header className="case-study-hero">
          <Link to="/#featured-work" className="back-link"><ArrowLeft size={14} />Back to selected work</Link>
          <div className="case-study-kicker"><ProjectStatusBadge status={project.status} /><span>{project.deploymentStatus}</span></div>
          <p className="eyebrow">{project.label ?? project.category}</p>
          <h1>{project.title}</h1>
          <p className="case-study-lede">{project.description}</p>
          <div className="case-study-actions">
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="button button-primary">Open project <ArrowUpRight size={14} /></a>}
            {project.sourceUrl && <a href={project.sourceUrl} target="_blank" rel="noreferrer" className="button button-secondary"><GithubLogo size={15} />View source</a>}
            {project.videoUrl && <a href={project.videoUrl} target="_blank" rel="noreferrer" className="button button-secondary"><PlayCircle size={15} />Watch walkthrough</a>}
            {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer" className="button button-secondary">Open demo <ArrowUpRight size={14} /></a>}
          </div>
          {project.demoPassword && <p className="case-study-demo-note">Demo password: <code>{project.demoPassword}</code></p>}
        </header>

        <button type="button" className="case-study-cover" onClick={() => setSelectedImage(gallery[0])} aria-label={`Enlarge ${gallery[0].label ?? project.title} image`}>
          <ProjectImage src={gallery[0].src} alt={gallery[0].alt} width={gallery[0].width} height={gallery[0].height} loading="eager" />
        </button>

        <dl className="case-study-meta">
          {project.role && <div><dt>Role</dt><dd>{project.role}</dd></div>}
          {project.timeline && <div><dt>Timeline</dt><dd>{project.timeline}</dd></div>}
          <div><dt>Status</dt><dd>{project.status}</dd></div>
          <div><dt>Technologies</dt><dd>{project.stack?.join(' · ')}</dd></div>
        </dl>

        <div className="case-study-body">
          {project.caseStudySections?.length ? project.caseStudySections.map((section, index) => <section key={section.label}><p className="section-index">{sectionIndex(index + 1, section.label)}</p><h2>{section.title}</h2>{section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.items?.length ? <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}</section>) : <>
            {project.problem && <section><p className="section-index">{sectionIndex(problemNumber, 'problem')}</p><h2>What needed to be solved</h2><p>{project.problem}</p></section>}
            {solutions.length > 0 && <section><p className="section-index">{sectionIndex(solutionNumber, 'solution')}</p><h2>How the system responds</h2><ul>{solutions.map((item) => <li key={item}>{item}</li>)}</ul></section>}
            {project.technicalCapabilities?.length ? <section><p className="section-index">{sectionIndex(capabilitiesNumber, 'main features')}</p><h2>Technical capabilities</h2><ul className="case-study-grid-list">{project.technicalCapabilities.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
            {numberedOptionalSections.map((section) => <section key={section.label}><p className="section-index">{sectionIndex(section.number, section.label)}</p><h2>{section.title}</h2><ul>{section.items?.map((item) => <li key={item}>{item}</li>)}</ul></section>)}
            {project.measuredResults?.length ? <section><p className="section-index">{sectionIndex(measuredResultsNumber, 'tested result')}</p><h2>What was observed</h2><ul>{project.measuredResults.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
            {project.expectedBenefits?.length ? <section><p className="section-index">{sectionIndex(expectedBenefitsNumber, 'expected benefits')}</p><h2>What the workflow is designed to improve</h2><ul>{project.expectedBenefits.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
            {project.outcome && <section><p className="section-index">{sectionIndex(outcomeNumber, 'current outcome')}</p><h2>Where the project stands</h2><p>{project.outcome}</p></section>}
          </>}
          {project.disclosure && <aside className="case-study-disclosure"><strong>Project disclosure</strong><p>{project.disclosure}</p></aside>}
        </div>

        {gallery.length > 1 && <section className="case-study-gallery" aria-labelledby="gallery-heading"><div><p className="section-index">Gallery</p><h2 id="gallery-heading">Project screens</h2></div><div>{gallery.map((image) => <button key={image.src} type="button" onClick={() => setSelectedImage(image)} aria-label={`Enlarge ${image.label ?? image.alt}`}><ProjectImage src={image.src} alt={image.alt} width={image.width} height={image.height} /></button>)}</div></section>}
        <nav className="project-pagination" aria-label="Project navigation">
          {previousProject ? <Link to={`/work/${previousProject.slug}`}><ArrowLeft size={14} /><span><small>Previous project</small>{previousProject.title}</span></Link> : <span />}
          {nextProject ? <Link to={`/work/${nextProject.slug}`}><span><small>Next project</small>{nextProject.title}</span><ArrowRight size={14} /></Link> : <span />}
        </nav>
      </article>
      <ImageLightbox image={selectedImage} isOpen={selectedImage !== null} onClose={() => setSelectedImage(null)} />
    </EditorCanvas>
  );
};
