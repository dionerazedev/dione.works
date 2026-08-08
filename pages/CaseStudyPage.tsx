import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, GithubLogo, PlayCircle } from '@phosphor-icons/react';
import { Link, useParams } from 'react-router-dom';
import { ALL_PROJECTS, PROJECTS_BY_SLUG } from '../data/projects';
import type { ProjectData, ProjectImage as ProjectImageData, ProjectProofCard } from '../types/project';
import { ImageLightbox } from '../components/projects/ImageLightbox';
import { ProjectStatusBadge } from '../components/projects/ProjectStatusBadge';
import { ProjectImage } from '../components/ui/ProjectImage';
import { EditorCanvas } from '../components/ui/EditorCanvas';
import { useRouteMetadata } from '../components/ui/useRouteMetadata';
import { NotFoundPage } from './NotFoundPage';

const asItems = (value?: string | string[]) => Array.isArray(value) ? value : value ? [value] : [];
const hasEnhancedCaseStudy = (project: ProjectData) => Boolean(project.caseStudyMetrics?.length || project.architectureNodes?.length || project.buildGroups?.length || project.proofCards?.length || project.reliabilityItems?.length || project.impactSummary || project.outcomeFlow?.length);

const CaseStudyMetrics = ({ project }: { project: ProjectData }) => project.caseStudyMetrics?.length ? (
  <section className="case-study-metrics" aria-label={`${project.title} project metrics`}>
    {project.caseStudyMetrics.map((metric) => <article key={`${metric.value}-${metric.label}`}><strong>{metric.value}</strong><span>{metric.label}</span>{metric.note && <small>{metric.note}</small>}</article>)}
  </section>
) : null;

const FlowSteps = ({ steps }: { steps: string[] }) => <ol className="case-study-flow">{steps.map((step) => <li key={step}>{step}</li>)}</ol>;

const ProofVisual = ({ card, onPreview }: { card: ProjectProofCard; onPreview: (image: ProjectImageData) => void }) => {
  if (card.type === 'flow' && card.steps?.length) return <FlowSteps steps={card.steps} />;
  if (card.type === 'schema' && card.image) {
    const image = card.image;

    return (
      <>
        <button type="button" className="schema-image-button" onClick={() => onPreview(image)} aria-label={`Enlarge ${image.label ?? card.title}`}>
          <ProjectImage src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" />
        </button>
        {card.imageCaption && <small className="schema-image-caption">{card.imageCaption}</small>}
      </>
    );
  }

  return null;
};

const EnhancedCaseStudy = ({ project, solutions, sectionIndex, onPreview }: { project: ProjectData; solutions: string[]; sectionIndex: (number: number | null, label: string) => string; onPreview: (image: ProjectImageData) => void }) => (
  <>
    {(project.problem || solutions.length > 0) && <section className="case-study-split-section"><p className="section-index">{sectionIndex(1, 'problem / solution')}</p><h2>One travel context instead of scattered tools</h2><div className="problem-solution-grid">{project.problem && <article><h3>Problem</h3><p>{project.problem}</p></article>}{solutions.length > 0 && <article><h3>Solution</h3><ul>{solutions.map((item) => <li key={item}>{item}</li>)}</ul></article>}</div></section>}

    {project.architectureNodes?.length ? <section className="case-study-architecture"><p className="section-index">{sectionIndex(2, 'system architecture')}</p><h2>System architecture</h2><div className="architecture-flow">{project.architectureNodes.map((node) => <article key={node.label}><span>{node.label}</span><strong>{node.title}</strong><p>{node.description}</p></article>)}</div>{project.architectureNotes?.length ? <ul className="architecture-notes">{project.architectureNotes.map((note) => <li key={note}>{note}</li>)}</ul> : null}</section> : null}

    {project.buildGroups?.length ? <section><p className="section-index">{sectionIndex(3, 'what i built')}</p><h2>What I built</h2><div className="build-group-grid">{project.buildGroups.map((group) => <article key={group.title}><h3>{group.title}</h3><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div></section> : null}

    {project.proofCards?.length ? <section><p className="section-index">{sectionIndex(4, 'engineering proof')}</p><h2>Backend and architecture proof</h2><div className="proof-grid">{project.proofCards.map((card) => <article key={card.title} className={card.type === 'schema' ? 'proof-card proof-card-primary' : 'proof-card'}><h3>{card.title}</h3><ProofVisual card={card} onPreview={onPreview} /><p>{card.caption}</p>{card.bullets?.length ? <ul>{card.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}</article>)}</div></section> : null}

    {project.reliabilityItems?.length ? <section><p className="section-index">{sectionIndex(5, 'reliability')}</p><h2>Built beyond the happy path</h2><p>Production-style states were handled as part of the product experience, not treated as afterthoughts.</p><ul className="reliability-grid">{project.reliabilityItems.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}

    {(project.impactSummary || project.measuredResults?.length) ? <section className="impact-section"><p className="section-index">{sectionIndex(6, 'impact')}</p><h2>Measured project result</h2>{project.impactComparison?.length ? <div className="impact-comparison">{project.impactComparison.map((item) => <article key={item.label}><span>{item.label}</span><strong>{item.value}</strong></article>)}</div> : null}<div className="impact-result"><strong>40%</strong><p>{project.impactSummary ?? project.measuredResults?.[0]}</p></div></section> : null}

    {(project.outcome || project.outcomeFlow?.length) ? <section className="outcome-section"><p className="section-index">{sectionIndex(7, 'outcome')}</p><h2>End-to-end ownership</h2>{project.outcome && <p>{project.outcome}</p>}{project.outcomeFlow?.length ? <FlowSteps steps={project.outcomeFlow} /> : null}<div className="case-study-actions">{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="button button-primary">Open live product <ArrowUpRight size={14} /></a>}{project.sourceUrl && <a href={project.sourceUrl} target="_blank" rel="noreferrer" className="button button-secondary"><GithubLogo size={15} />View source</a>}</div></section> : null}
  </>
);

const ProjectScreensGallery = ({ images, isMigo, onPreview }: { images: ProjectImageData[]; isMigo: boolean; onPreview: (image: ProjectImageData) => void }) => {
  if (images.length <= 1) return null;

  if (isMigo) {
    return (
      <section className="case-study-gallery is-migo-gallery" aria-labelledby="gallery-heading">
        <div>
          <p className="section-index">Gallery</p>
          <h2 id="gallery-heading">Project screens</h2>
        </div>
        <div className="migo-screen-gallery">
          <div className="migo-screen-grid">
            {images.slice(0, 4).map((image) => (
              <button key={image.src} type="button" onClick={() => onPreview(image)} aria-label={`Enlarge ${image.label ?? image.alt}`}>
                <ProjectImage src={image.src} alt={image.alt} width={image.width} height={image.height} />
                {image.label && <span>{image.label}</span>}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="case-study-gallery" aria-labelledby="gallery-heading">
      <div>
        <p className="section-index">Gallery</p>
        <h2 id="gallery-heading">Project screens</h2>
      </div>
      <div className="case-study-gallery-grid">
        {images.map((image) => (
          <button key={image.src} type="button" onClick={() => onPreview(image)} aria-label={`Enlarge ${image.label ?? image.alt}`}>
            <ProjectImage src={image.src} alt={image.alt} width={image.width} height={image.height} />
          </button>
        ))}
      </div>
    </section>
  );
};

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
  const enhancedCaseStudy = hasEnhancedCaseStudy(project);
  const useMigoGallery = project.slug === 'migo';
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
  const showHeroDeploymentStatus = !(project.slug === 'migo' && project.status === 'Live Product');

  return (
    <EditorCanvas>
      <article className="case-study-page">
        <header className="case-study-hero">
          <Link to="/#featured-work" className="back-link"><ArrowLeft size={14} />Back to selected work</Link>
          <div className="case-study-kicker"><ProjectStatusBadge status={project.status} />{showHeroDeploymentStatus && <span>{project.deploymentStatus}</span>}</div>
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

        <CaseStudyMetrics project={project} />

        {!enhancedCaseStudy && <button type="button" className="case-study-cover" onClick={() => setSelectedImage(gallery[0])} aria-label={`Enlarge ${gallery[0].label ?? project.title} image`}>
          <ProjectImage src={gallery[0].src} alt={gallery[0].alt} width={gallery[0].width} height={gallery[0].height} loading="eager" />
        </button>}

        <dl className="case-study-meta">
          {project.role && <div><dt>Role</dt><dd>{project.role}</dd></div>}
          {project.timeline && <div><dt>Timeline</dt><dd>{project.timeline}</dd></div>}
          <div><dt>Status</dt><dd>{project.status}</dd></div>
          <div><dt>Technologies</dt><dd>{project.stack?.join(' · ')}</dd></div>
        </dl>

        <div className={enhancedCaseStudy ? 'case-study-body has-enhanced-case-study' : 'case-study-body'}>
          {enhancedCaseStudy ? <EnhancedCaseStudy project={project} solutions={solutions} sectionIndex={sectionIndex} onPreview={setSelectedImage} /> : project.caseStudySections?.length ? project.caseStudySections.map((section, index) => <section key={section.label}><p className="section-index">{sectionIndex(index + 1, section.label)}</p><h2>{section.title}</h2>{section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.items?.length ? <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}</section>) : <>
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

        <ProjectScreensGallery images={gallery} isMigo={useMigoGallery} onPreview={setSelectedImage} />
        <nav className="project-pagination" aria-label="Project navigation">
          {previousProject ? <Link to={`/work/${previousProject.slug}`}><ArrowLeft size={14} /><span><small>Previous project</small>{previousProject.title}</span></Link> : <span />}
          {nextProject ? <Link to={`/work/${nextProject.slug}`}><span><small>Next project</small>{nextProject.title}</span><ArrowRight size={14} /></Link> : <span />}
        </nav>
      </article>
      <ImageLightbox image={selectedImage} isOpen={selectedImage !== null} onClose={() => setSelectedImage(null)} />
    </EditorCanvas>
  );
};
