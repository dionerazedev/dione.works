import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { ProjectImage } from '../types/project';
import { ImageLightbox } from './projects/ImageLightbox';
import { BlogPreviewSection } from './sections/BlogPreviewSection';
import { ContactSection } from './sections/ContactSection';
import { CurrentWorkSection } from './sections/CurrentWorkSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { FeaturedProjectsSection } from './sections/FeaturedProjectsSection';
import { HeroSection } from './sections/HeroSection';
import { ServicesSection } from './sections/ServicesSection';
import { StatsSection } from './sections/StatsSection';
import { EditorCanvas } from './ui/EditorCanvas';
import { useRouteMetadata } from './ui/useRouteMetadata';

export const MainContent = () => {
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null);
  useRouteMetadata({ title: 'Dione Raze | AI Automation + Full-Stack', description: 'Dione Raze builds practical web products, intelligent workflows, and modern business tools.', canonicalPath: '/' });
  useEffect(() => {
    if (!location.hash) return;
    const frame = requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [location.hash]);
  return <EditorCanvas><HeroSection /><StatsSection /><BlogPreviewSection /><FeaturedProjectsSection onPreview={setSelectedImage} /><CurrentWorkSection /><ExperienceSection /><ServicesSection /><ContactSection /><ImageLightbox image={selectedImage} isOpen={selectedImage !== null} onClose={() => setSelectedImage(null)} /></EditorCanvas>;
};
