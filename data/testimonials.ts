export interface TestimonialData {
  text: string;
  name: string;
  role: string;
  company?: string;
  sourceUrl?: string;
  avatar?: string;
  isVerified: boolean;
}

// Add verified client feedback here later only after the wording, attribution, and source have been confirmed.
export const TESTIMONIALS: TestimonialData[] = [];
