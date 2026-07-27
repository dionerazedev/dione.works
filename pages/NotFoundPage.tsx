import { ArrowLeft } from '@phosphor-icons/react';
import { Link, useLocation } from 'react-router-dom';
import { EditorCanvas } from '../components/ui/EditorCanvas';
import { useRouteMetadata } from '../components/ui/useRouteMetadata';

export const NotFoundPage = ({ embedded = false }: { embedded?: boolean }) => {
  const location = useLocation();
  useRouteMetadata({
    title: 'Page Not Found | Dione Raze Oro',
    description: 'The requested portfolio page could not be found.',
    canonicalPath: location.pathname,
    noIndex: true,
  });
  const content = <section className="not-found"><p className="section-index">404 — not found</p><h1>This file is not in the workspace.</h1><p>The route may have moved, or the project slug does not exist.</p><Link to="/" className="button button-primary"><ArrowLeft size={14} />Return home</Link></section>;
  return embedded ? content : <EditorCanvas>{content}</EditorCanvas>;
};
