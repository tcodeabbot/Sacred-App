export const scriptures = [
  {
    id: '1',
    text: 'Be still, and know that I am God.',
    reference: 'Psalm 46:10',
  },
  {
    id: '2',
    text: 'The Lord is my shepherd; I shall not want.',
    reference: 'Psalm 23:1',
  },
  {
    id: '3',
    text: 'Cast all your anxiety on him because he cares for you.',
    reference: '1 Peter 5:7',
  },
  {
    id: '4',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    reference: 'Matthew 11:28',
  },
  {
    id: '5',
    text: 'Trust in the Lord with all your heart and lean not on your own understanding.',
    reference: 'Proverbs 3:5',
  },
  {
    id: '6',
    text: 'I can do all things through Christ who strengthens me.',
    reference: 'Philippians 4:13',
  },
];

export const prayerCategories = ['All', 'Morning', 'Evening', 'Gratitude', 'Peace'];

export const prayers = [
  {
    id: '1',
    title: 'Morning Offering',
    description: 'Start your day with intention and gratitude',
    duration: 2,
    category: 'Morning',
    gradient: 'amber' as const,
  },
  {
    id: '2',
    title: 'Evening Reflection',
    description: 'Review your day with God',
    duration: 3,
    category: 'Evening',
    gradient: 'purple' as const,
  },
  {
    id: '3',
    title: 'Gratitude Prayer',
    description: 'Thank God for His blessings',
    duration: 2,
    category: 'Gratitude',
    gradient: 'teal' as const,
  },
  {
    id: '4',
    title: 'Prayer for Peace',
    description: 'Find calm in God\'s presence',
    duration: 2,
    category: 'Peace',
    gradient: 'blue' as const,
  },
  {
    id: '5',
    title: 'Daily Surrender',
    description: 'Give your worries to God',
    duration: 3,
    category: 'Morning',
    gradient: 'pink' as const,
  },
];

export const blockedApps = [
  { id: 'instagram', name: 'Instagram', icon: '📷', gradient: ['#E4405F', '#833AB4'] },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', gradient: ['#00f2ea', '#ff0050'] },
  { id: 'twitter', name: 'Twitter', icon: '🐦', gradient: ['#1DA1F2', '#0d8bd9'] },
  { id: 'youtube', name: 'YouTube', icon: '▶️', gradient: ['#FF0000', '#cc0000'] },
  { id: 'reddit', name: 'Reddit', icon: '🔴', gradient: ['#FF4500', '#cc3700'] },
  { id: 'facebook', name: 'Facebook', icon: '👤', gradient: ['#1877F2', '#0d5abd'] },
];
