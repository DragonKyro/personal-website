import type { CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { hostedApps } from '../content/apps';
import { type Project, projects } from '../content/projects';
import { BASE, site } from '../content/site';
import { useSpotlight, useTilt } from '../lib/motion';
import { AppIcon } from './AppIcon';
import { GitHubIcon, Reveal, SectionHeading } from './ui';
import './sections.css';

export function Work() {
  const groupRef = useSpotlight<HTMLDivElement>();
  return (
    <section id="work" className="section">
      <div className="container">
        <SectionHeading
          index="02"
          label="Work"
          title="Selected work"
          description="A few things I’ve built — some for fun, some for class, all for learning something."
          action={
            <a className="link-arrow" href={`https://github.com/${site.githubUser}`}>
              Everything on GitHub <ArrowUpRight />
            </a>
          }
        />
        <div className="bento spotlight-group" ref={groupRef}>
          {projects.map((project, i) => (
            <Reveal key={project.title} delay={(i % 3) * 90} className="bento__item">
              <ProjectCard project={project} featured={i === 0} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, featured }: { project: Project; featured: boolean }) {
  const ref = useTilt<HTMLElement>(featured ? 2.5 : 4);
  const primary = project.live ?? project.source;
  const image = project.image && (/^https?:/.test(project.image) ? project.image : `${BASE}${project.image}`);

  return (
    <article ref={ref} className={`project spotlight ${featured ? 'project--featured' : ''}`} data-spotlight>
      <div className="project__cover">
        {image ? <img src={image} alt="" loading="lazy" /> : <Cover cover={project.cover} />}
      </div>
      <div className="project__body">
        <div className="project__meta">
          <span className="project__year">{project.year}</span>
          {project.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="project__title">
          {primary ? (
            <a href={primary} className="stretched-link">
              {project.title}
            </a>
          ) : (
            project.title
          )}
        </h3>
        <p className="project__summary">{project.summary}</p>
        <div className="project__links">
          {project.live && (
            <a href={project.live} className="link-arrow">
              Open <ArrowUpRight />
            </a>
          )}
          {project.source && (
            <a href={project.source} className="link-arrow">
              <GitHubIcon /> Source
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function Cover({ cover }: { cover: Project['cover'] }) {
  if (cover === 'launchpad') {
    const apps = hostedApps.filter((a) => !a.hidden && a.status !== 'offline').slice(0, 12);
    return (
      <div className="cover cover--launchpad">
        <div className="cover__icons">
          {apps.map((app, i) => (
            <span key={app.repo} className="cover__icon" style={{ '--i': i } as CSSProperties}>
              <AppIcon icon={app.icon} glyph={app.glyph} hue={app.hue} size={52} />
            </span>
          ))}
        </div>
      </div>
    );
  }
  const { icon: Icon, hue } = cover;
  return (
    <div className="cover cover--glyph" style={{ '--hue': hue } as CSSProperties}>
      <Icon className="cover__bg-icon" strokeWidth={1} aria-hidden />
      <AppIcon icon={Icon} hue={hue} size={56} className="cover__badge" />
    </div>
  );
}
