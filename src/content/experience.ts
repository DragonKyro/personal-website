/** Timeline on the home page, newest first. Everything here is PLACEHOLDER. */

export interface TimelineItem {
  period: string;
  title: string;
  org: string;
  href?: string;
  location?: string;
  summary: string;
  tags?: string[];
}

export const experience: TimelineItem[] = [
  {
    period: '2024 — Now',
    title: 'Software Engineer',
    org: 'Company Name',
    location: 'City, ST',
    summary:
      'What the team does, what you own, and the result. Lead with a number if you have one — “cut p95 latency 40%” reads faster than a paragraph.',
    tags: ['TypeScript', 'Go', 'Postgres'],
  },
  {
    period: '2023 — 2024',
    title: 'Previous Role',
    org: 'Company Name',
    location: 'City, ST',
    summary: 'One or two lines on scope and impact. Older roles can be shorter.',
    tags: ['Python', 'AWS'],
  },
  {
    period: 'Summer 2022',
    title: 'Software Engineering Intern',
    org: 'Company Name',
    summary: 'The project you shipped and who used it.',
    tags: ['Java'],
  },
  {
    period: '2019 — 2023',
    title: 'B.S. Electrical Engineering & Computer Sciences',
    org: 'University Name',
    summary: 'Clubs, teaching, research — e.g. course staff, Tau Beta Pi, the ISAACS project.',
  },
];
