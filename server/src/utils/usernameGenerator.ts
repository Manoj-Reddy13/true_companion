const ADJECTIVES = [
  'Silent',
  'Quiet',
  'Hope',
  'Gentle',
  'Kind',
  'Calm',
  'Peaceful',
  'Wandering',
  'Moon',
  'Serene',
  'Brave',
  'Soft',
  'Hidden',
  'Misty',
  'Starlight',
  'Warm',
  'Patient',
  'Thoughtful',
  'Humble',
  'Echo',
  'Amber',
  'Silver',
  'Ocean',
  'Restful',
];

const NOUNS = [
  'Soul',
  'Seeker',
  'Walker',
  'Heart',
  'Echo',
  'Haven',
  'Voyager',
  'Listener',
  'Spirit',
  'Traveler',
  'Companion',
  'Light',
  'Harbor',
  'Dreamer',
  'Cloud',
  'Breeze',
  'Anchor',
  'Pathfinder',
  'Shadow',
  'River',
];

export function generateAnonymousUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(10 + Math.random() * 990);
  return `${adj}${noun}_${num}`;
}
