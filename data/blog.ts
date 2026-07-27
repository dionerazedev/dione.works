export type BlogPostStatus = 'draft' | 'published';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  status: BlogPostStatus;
  category?: string;
  date?: string;
  readingTime?: string;
  tags: string[];
  seo?: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  featuredImage?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  introduction?: string[];
  introductionQuote?: string;
  introductionClosingParagraphs?: string[];
  sections: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
    closingParagraphs?: string[];
    quote?: string;
    code?: string;
  }>;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-traveling-inspired-me-to-build-migo',
    title: 'How Traveling Inspired Me to Build Migo',
    description: 'At 16, I started traveling solo and documenting my life. Those experiences inspired me to build Migo—a travel platform for planning trips, sharing stories, and preserving memories.',
    status: 'published',
    category: 'Personal Journey',
    date: '2026-07-27',
    readingTime: '4 min read',
    tags: ['Personal Journey', 'Migo', 'Travel'],
    seo: {
      title: 'How Traveling Inspired Me to Build Migo | Dione Raze',
      description: 'At 16, Dione started traveling solo and documenting his life. Discover how exploring 20 Philippine provinces and six countries inspired him to build Migo.',
      openGraphTitle: 'How Traveling Inspired Me to Build Migo',
      openGraphDescription: 'A personal story about solo travel, documenting memories, and building Migo as a digital travel companion.',
    },
    featuredImage: {
      src: '/blog/how-traveling-inspired-me-to-build-migo.png',
      alt: 'Monochrome product mockup showing the Migo travel app on three smartphones surrounded by travel planning materials.',
      width: 1448,
      height: 1086,
    },
    introduction: [
      'At 16, I started traveling solo and documenting my life along the way.',
      'Travel quickly became more than visiting new places. It became a way for me to become more independent, meet different people, experience unfamiliar cultures, and create memories outside my comfort zone.',
      'I celebrated my 18th birthday in Siargao and my 19th birthday in El Nido. By 19, I had explored around 20 provinces across the Philippines and traveled to six countries.',
      'But the more I traveled, the more I noticed how scattered the whole experience was.',
      'My itinerary was stored in my notes. Expenses were tracked somewhere else. Photos were uploaded across different social platforms. Booking details were buried in emails and group chats. After each trip, there was no single place where I could easily look back at everything I had experienced.',
      'That made me ask:',
    ],
    introductionQuote: 'What if travelers had one place to plan their trips, share their experiences, connect with others, and preserve their memories?',
    introductionClosingParagraphs: ['That idea became Migo.'],
    sections: [
      {
        heading: 'The Problem I Wanted to Solve',
        paragraphs: [
          'Most travel apps focus on only one part of traveling.',
          'Some are made for booking flights and accommodations. Others focus on itineraries, maps, recommendations, or social media. Travelers often need to switch between several apps just to organize one trip.',
          'I wanted Migo to connect these experiences in one platform:',
        ],
        bullets: [
          'Plan trips and itineraries',
          'Store important travel information',
          'Discover new destinations',
          'Document places and experiences',
          'Share posts with other travelers',
          'Track visited provinces and countries',
          'Look back at completed trips and memories',
        ],
        closingParagraphs: [
          'Migo was not intended to be another booking platform. I wanted it to feel like a personal digital travel companion.',
        ],
      },
      {
        heading: 'Turning My Experiences Into Features',
        paragraphs: [
          'Many of Migo’s ideas came directly from problems I experienced while traveling.',
          'While planning trips, I wanted one organized place for schedules, attachments, checklists, weather information, and reminders.',
          'While exploring, I wanted destination recommendations and posts from real travelers instead of only generic search results.',
          'After returning home, I wanted something similar to a personal travel journal—a place that could show where I had been, the trips I completed, and the memories I documented.',
          'These experiences inspired features such as trip timelines, itinerary management, travel posts, destination discovery, check-ins, saved content, travel profiles, and trip recaps.',
        ],
      },
      {
        heading: 'Building More Than a Travel App',
        paragraphs: [
          'Migo also became one of the projects that helped me grow the most as a developer.',
          'Building it required me to work with authentication, databases, privacy controls, social interactions, notifications, responsive interfaces, and AI-assisted travel planning.',
          'It pushed me to think beyond individual screens and features. I had to understand how the entire experience connected—from creating a trip to documenting it after coming home.',
          'The project taught me that good products are not built by adding as many features as possible. They are built by understanding a real problem and designing a clear experience around it.',
        ],
      },
      {
        heading: 'Why Migo Matters to Me',
        paragraphs: [
          'Migo combines two things I genuinely enjoy: travel and technology.',
          'It is not simply a project I created to fill my portfolio. It came from a lifestyle and a problem I personally understood.',
          'Every trip I took gave me new ideas. Every frustration showed me something that could be improved. Because I was building something I would personally use, the product felt more meaningful and intentional.',
        ],
      },
      {
        heading: 'What Comes Next',
        paragraphs: [
          'Migo is still evolving.',
          'I want to continue improving its trip-planning tools, social features, destination discovery, personal travel recaps, and AI capabilities.',
          'Travel inspired me to build Migo, but the project also taught me something important:',
        ],
        quote: 'Some of the best product ideas begin with a problem you repeatedly experience in your own life—and the curiosity to build a better solution.',
      },
    ],
  },
  {
    slug: 'my-journey-to-ai-automation-developer',
    title: 'My Journey From Computer Science Student to Self-Taught AI Automation Developer',
    description: 'I started as a Computer Science student with a strong interest in technology, but I quickly realized that I learned best by building real projects.',
    status: 'published',
    category: 'Personal Journey',
    date: '2026-07-27',
    readingTime: '4 min read',
    tags: ['Personal Journey', 'AI Automation', 'Full-Stack'],
    featuredImage: {
      src: '/blog/self-taught-ai-developer.jpg',
      alt: 'Monochrome workspace representing a self-taught AI automation developer.',
      width: 1448,
      height: 1086,
    },
    introduction: [
      'I started as a Computer Science student with a strong interest in technology, but I quickly realized that I learned best by building real projects.',
      'Instead of waiting until graduation to begin creating, I started teaching myself web development, artificial intelligence, and business automation. I spent hours experimenting with tools like React, Next.js, TypeScript, Supabase, n8n, Make, OpenAI, and Claude.',
      'Eventually, I decided to step away from college and focus fully on developing practical skills, building my portfolio, and pursuing freelance opportunities.',
    ],
    sections: [
      {
        heading: 'Learning Through Real Projects',
        paragraphs: [
          'Most of my progress came from solving problems through projects rather than only watching tutorials.',
          'I have worked on projects such as:',
        ],
        bullets: [
          'AI booking and voice receptionist systems',
          'Business workflow automations using n8n',
          'Full-stack dashboards and internal tools',
          'Customer intelligence and analytics platforms',
          'Travel and social applications',
          'Shopify and e-commerce projects',
        ],
        closingParagraphs: [
          'Building these systems taught me more than just writing code. I learned how to understand business problems, design workflows, connect APIs, manage databases, handle errors, and create interfaces that people can actually use.',
        ],
      },
      {
        heading: 'From “Vibe Coding” to Understanding Systems',
        paragraphs: [
          'At first, I relied heavily on AI tools to help me build. Some people call this “vibe coding,” but I did not want to stop at simply generating code.',
          'I began studying how each part worked: authentication, databases, APIs, webhooks, security rules, frontend state, deployment, and automation logic.',
          'AI helped me move faster, but curiosity helped me understand what I was building.',
        ],
      },
      {
        heading: 'The Challenges',
        paragraphs: [
          'Being self-taught is not always easy.',
          'There were times when projects broke, integrations failed, or I felt like I was not experienced enough. Without a traditional roadmap, I had to decide what to learn and how to improve on my own.',
          'But every difficult bug and unfinished project taught me something. I became more comfortable with uncertainty and learned that progress often comes from repeatedly building, failing, fixing, and trying again.',
        ],
      },
      {
        heading: 'Where I Am Today',
        paragraphs: [
          'Today, I describe myself as an AI Automation and Full-Stack Developer.',
          'I focus on creating websites, applications, AI agents, dashboards, and automated workflows that help businesses operate more efficiently.',
          'I am still learning, and I do not pretend to know everything. But I am confident in my ability to research, adapt, and turn an idea into a working solution.',
        ],
      },
      {
        heading: 'What Comes Next',
        paragraphs: [
          'My goal is to continue building useful products, working with real clients, and improving as a developer.',
          'Leaving the traditional path was a difficult decision, but it pushed me to take responsibility for my own growth. My journey is still at the beginning, and this blog will document the projects, lessons, mistakes, and progress along the way.',
        ],
      },
    ],
  },
];

export const PUBLISHED_BLOG_POSTS = BLOG_POSTS.filter((post) => post.status === 'published');
export const BLOG_POSTS_BY_SLUG = Object.fromEntries(BLOG_POSTS.map((post) => [post.slug, post])) as Record<string, BlogPost>;

export const formatBlogDate = (date: string) => new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(`${date}T00:00:00Z`));

export const formatBlogMonthYear = (date: string) => new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(`${date}T00:00:00Z`));
