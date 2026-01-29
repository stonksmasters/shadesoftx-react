export type ServiceCategory = 'residential' | 'commercial' | 'both';

export type Service = {
  id: string;
  title: string;
  category: ServiceCategory;
  description: string;
  link?: string; // optional route or external URL to a detail page
};

export const SERVICES: Service[] = [
  // Residential services (from static site leads)
  {
    id: 'home-window-tint',
    title: 'Home Window Tinting',
    category: 'residential',
    description:
      'Protect your interior, lower your energy bills, and experience total comfort in every room of your home.',
    link: '/services/home-window-tint',
  },
  {
    id: 'safety-film',
    title: 'Safety & Security Film',
    category: 'residential',
    description:
      'Shatter-resistant security film to protect your home from break-ins, severe weather, and accidental impact.',
    link: '/services/safety-film',
  },
  {
    id: 'shade-structures',
    title: 'Shade Structures',
    category: 'residential',
    description:
      "Custom outdoor shade structures that expand living space and provide relief from intense summer sun.",
    link: '/services/shade-structures',
  },
  {
    id: 'smart-tint',
    title: 'SmartTint (Residential)',
    category: 'residential',
    description:
      'Transform any window from clear to private instantly with switchable smart glass technology for the home.',
    link: '/services/smart-tint',
  },
  {
    id: 'window-shutters',
    title: 'Window Shutters',
    category: 'residential',
    description:
      'Premium plantation shutters that add timeless elegance and superior light control to your home.',
    link: '/services/window-shutters',
  },
  {
    id: 'storm-shutters',
    title: 'Storm Shutters',
    category: 'residential',
    description:
      'Heavy-duty protection against severe weather, intruders, and wind-borne debris for your home.',
    link: '/services/storm-shutters',
  },
  {
    id: 'window-cleaning',
    title: 'Window Cleaning',
    category: 'residential',
    description:
      'Professional window cleaning services that restore clarity and curb appeal to your home.',
    link: '/services/window-cleaning',
  },
  {
    id: 'window-shades',
    title: 'Window Shades',
    category: 'residential',
    description:
      'Elegant, custom window shades that provide light control, privacy, and energy efficiency.',
    link: '/services/window-shades',
  },
  {
    id: 'patio-awnings',
    title: 'Patio Awnings',
    category: 'residential',
    description:
      'Retractable and fixed awnings that reduce heat, protect furniture, and extend your outdoor living season.',
    link: '/services/patio-awnings',
  },

  // Commercial services (from static site leads)
  {
    id: 'commercial-smart-tint',
    title: 'SmartTint (Commercial)',
    category: 'commercial',
    description:
      'Transform conference rooms and offices with switchable privacy glass that changes from clear to opaque instantly.',
    link: '/services/commercial-smart-tint',
  },
  {
    id: 'commercial-glazing',
    title: 'Commercial Glazing',
    category: 'commercial',
    description:
      'From storefront replacements to large-scale glass installations—structural integrity and modern aesthetics for businesses.',
    link: '/services/commercial-glazing',
  },
  {
    id: 'commercial-roller-shades',
    title: 'Commercial Roller Shades',
    category: 'commercial',
    description:
      'Durable, commercial-grade roller shades (including motorized options) to control sunlight and privacy in commercial spaces.',
    link: '/services/commercial-roller-shades',
  },
  {
    id: 'patio-screens',
    title: 'Patio Screens (Commercial)',
    category: 'commercial',
    description:
      'Motorized retractable screens that create bug-free outdoor dining and event spaces for businesses.',
    link: '/services/commercial-patio-screens',
  },
  // Add more entries as you need (e.g., commercial-sun-control) following the pattern above
];