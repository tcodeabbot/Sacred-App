export const scriptures = [
  {
    id: '1',
    text: 'Be still, and know that I am God.',
    reference: 'Psalm 46:10',
    whyToday: 'In a world of constant noise, God invites us to find Him in stillness.',
    theme: 'peace',
  },
  {
    id: '2',
    text: 'The Lord is my shepherd; I shall not want.',
    reference: 'Psalm 23:1',
    whyToday: 'God provides everything we need. Rest in His care today.',
    theme: 'provision',
  },
  {
    id: '3',
    text: 'Cast all your anxiety on him because he cares for you.',
    reference: '1 Peter 5:7',
    whyToday: 'Your worries are too heavy to carry alone. Give them to God.',
    theme: 'anxiety',
  },
  {
    id: '4',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    reference: 'Matthew 11:28',
    whyToday: 'Feeling overwhelmed? Jesus offers true rest for your soul.',
    theme: 'rest',
  },
  {
    id: '5',
    text: 'Trust in the Lord with all your heart and lean not on your own understanding.',
    reference: 'Proverbs 3:5',
    whyToday: 'When life doesn\'t make sense, trust God\'s wisdom over your own.',
    theme: 'trust',
  },
  {
    id: '6',
    text: 'I can do all things through Christ who strengthens me.',
    reference: 'Philippians 4:13',
    whyToday: 'Whatever challenges today brings, you have divine strength.',
    theme: 'strength',
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
  { id: 'instagram', name: 'Instagram', icon: 'camera-outline', gradient: ['#E4405F', '#833AB4'] as const },
  { id: 'tiktok', name: 'TikTok', icon: 'musical-notes-outline', gradient: ['#00f2ea', '#ff0050'] as const },
  { id: 'twitter', name: 'Twitter', icon: 'logo-twitter', gradient: ['#1DA1F2', '#0d8bd9'] as const },
  { id: 'youtube', name: 'YouTube', icon: 'logo-youtube', gradient: ['#FF0000', '#cc0000'] as const },
  { id: 'reddit', name: 'Reddit', icon: 'logo-reddit', gradient: ['#FF4500', '#cc3700'] as const },
  { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', gradient: ['#1877F2', '#0d5abd'] as const },
];

// Prayer tags for categorizing pause intents
export const prayerTags = [
  'stress',
  'gratitude',
  'focus',
  'anxiety',
  'joy',
  'peace',
  'strength',
  'guidance',
];

// Dynamic encouragement messages based on prayer progress
export const encouragementMessages = {
  0: "Start your day with prayer",
  10: "You're off to a great start!",
  25: "Keep the momentum going!",
  50: "Halfway there, keep going!",
  75: "Almost there!",
  90: "So close to your goal!",
  100: "Goal achieved! Well done!",
  110: "Above and beyond! Amazing!",
};

// Get encouragement message based on progress percentage
export const getEncouragement = (current: number, goal: number): string => {
  const progress = Math.min((current / goal) * 100, 150);

  if (progress === 0) return encouragementMessages[0];
  if (progress < 25) return encouragementMessages[10];
  if (progress < 50) return encouragementMessages[25];
  if (progress < 75) return encouragementMessages[50];
  if (progress < 90) return encouragementMessages[75];
  if (progress < 100) return encouragementMessages[90];
  if (progress === 100) return encouragementMessages[100];
  return encouragementMessages[110];
};

// Curated scripture sets for scripture-led prayer
export const scriptureSets = [
  {
    id: 'peace',
    title: 'Finding Peace',
    duration: 3,
    gradient: 'teal' as const,
    scriptures: [
      scriptures[0], // Psalm 46:10
      scriptures[2], // 1 Peter 5:7
      scriptures[3], // Matthew 11:28
    ],
  },
  {
    id: 'strength',
    title: 'Divine Strength',
    duration: 3,
    gradient: 'purple' as const,
    scriptures: [
      scriptures[5], // Philippians 4:13
      scriptures[4], // Proverbs 3:5
      scriptures[1], // Psalm 23:1
    ],
  },
  {
    id: 'anxiety',
    title: 'Overcoming Anxiety',
    duration: 3,
    gradient: 'blue' as const,
    scriptures: [
      scriptures[2], // 1 Peter 5:7
      scriptures[3], // Matthew 11:28
      scriptures[0], // Psalm 46:10
    ],
  },
  {
    id: 'trust',
    title: 'Trusting God',
    duration: 3,
    gradient: 'amber' as const,
    scriptures: [
      scriptures[4], // Proverbs 3:5
      scriptures[1], // Psalm 23:1
      scriptures[5], // Philippians 4:13
    ],
  },
];
