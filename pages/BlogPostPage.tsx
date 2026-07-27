import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { Link, useParams } from 'react-router-dom';
import { BLOG_POSTS, BLOG_POSTS_BY_SLUG, formatBlogDate } from '../data/blog';
import { useRouteMetadata } from '../components/ui/useRouteMetadata';
import { NotFoundPage } from './NotFoundPage';

export const BlogPostPage = () => {
  const { slug = '' } = useParams();
  const post = BLOG_POSTS_BY_SLUG[slug];
  const canonicalPath = `/blog/${slug}`;
  const pageTitle = post?.seo?.title ?? (post ? `${post.title} | Dione Raze` : 'Post not found | Dione Raze');
  const pageDescription = post?.seo?.description ?? post?.description ?? 'The requested note could not be found.';
  const structuredData = post?.status === 'published' ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: pageDescription,
    datePublished: post.date,
    image: post.featuredImage ? `https://dioneraze.com${post.featuredImage.src}` : undefined,
    author: { '@type': 'Person', name: 'Dione Raze Oro' },
    mainEntityOfPage: `https://dioneraze.com${canonicalPath}`,
  } : undefined;
  useRouteMetadata({ title: pageTitle, description: pageDescription, canonicalPath, image: post?.featuredImage?.src, openGraphTitle: post?.seo?.openGraphTitle, openGraphDescription: post?.seo?.openGraphDescription, structuredData, noIndex: post?.status !== 'published' });
  if (!post) return <NotFoundPage embedded />;
  const index = BLOG_POSTS.findIndex((item) => item.slug === post.slug);
  const previous = BLOG_POSTS[index - 1];
  const next = BLOG_POSTS[index + 1];
  return <article className="reading-page blog-article"><Link to="/blog" className="back-link"><ArrowLeft size={13} />Back to Blog</Link><header className="article-header"><div className="post-meta">{post.status === 'draft' && <span>Draft</span>}{post.category && <span>{post.category}</span>}{post.date && <time dateTime={post.date}>{formatBlogDate(post.date)}</time>}{post.readingTime && <span>{post.readingTime}</span>}</div><h1>{post.title}</h1>{!post.introduction && <p>{post.description}</p>}<div className="tag-row">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></header>{post.featuredImage && <figure className="article-featured-image"><img src={post.featuredImage.src} alt={post.featuredImage.alt} width={post.featuredImage.width} height={post.featuredImage.height} decoding="async" fetchPriority="high" /></figure>}{post.status === 'draft' && <div className="editorial-notice"><strong>Working draft</strong><p>This note is intentionally visible as a draft and is not represented as a published article.</p></div>}<div className="article-body">{post.introduction && <div className="article-introduction">{post.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{post.introductionQuote && <blockquote>{post.introductionQuote}</blockquote>}{post.introductionClosingParagraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}{post.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}{section.closingParagraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.quote && <blockquote>{section.quote}</blockquote>}{section.code && <pre><code>{section.code}</code></pre>}</section>)}</div><nav className="article-pagination" aria-label="Article navigation">{previous ? <Link to={`/blog/${previous.slug}`}><ArrowLeft size={12} /><span><small>Previous</small>{previous.title}</span></Link> : <span />}{next && <Link to={`/blog/${next.slug}`}><span><small>Next</small>{next.title}</span><ArrowRight size={12} /></Link>}</nav></article>;
};
