import { ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { PUBLISHED_BLOG_POSTS, formatBlogMonthYear } from '../../data/blog';

const publicationTime = (date?: string) => date ? Date.parse(`${date}T00:00:00Z`) : 0;

const latestPosts = [...PUBLISHED_BLOG_POSTS]
  .sort((first, second) => publicationTime(second.date) - publicationTime(first.date))
  .slice(0, 3);

export const BlogPreviewSection = () => <section id="blog-preview" className="section-shell blog-preview-section" aria-labelledby="blog-preview-heading"><header className="blog-preview-header"><h2 id="blog-preview-heading" className="section-index">01 — blog</h2><Link to="/blog" className="section-action">All posts <ArrowRight size={12} aria-hidden="true" /></Link></header><ul className="blog-preview-list">{latestPosts.map((post) => <li key={post.slug}><Link to={`/blog/${post.slug}`} className="blog-preview-row"><div className="blog-preview-copy"><h3>{post.title}</h3><p>{post.description}</p></div><div className="blog-preview-meta">{post.date && <time dateTime={post.date}>{formatBlogMonthYear(post.date)}</time>}<ArrowRight size={13} aria-hidden="true" /></div></Link></li>)}</ul></section>;
