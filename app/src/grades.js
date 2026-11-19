// Colour grades for Sunset Cover Studio. Each grade is a set of stops for the
// warm wash laid over the panels, the caption colours and the frame colour.
// The palettes are original: warm dusk tones, never a game's own artwork.

export const GRADES = {
  sunset: {
    label: 'Sunset',
    // top -> bottom wash over the whole cover
    wash: [
      [0.0, 'rgba(255, 176, 66, 0.10)'],
      [0.45, 'rgba(255, 122, 61, 0.16)'],
      [0.8, 'rgba(255, 77, 141, 0.22)'],
      [1.0, 'rgba(90, 40, 140, 0.28)'],
    ],
    title: '#fff6e8',
    titleShadow: '#ff5e3a',
    subtitle: '#ffd9a0',
    frame: '#ff7a3d',
  },
  neon: {
    label: 'Neon',
    wash: [
      [0.0, 'rgba(45, 212, 191, 0.14)'],
      [0.45, 'rgba(56, 189, 248, 0.12)'],
      [0.8, 'rgba(217, 70, 239, 0.20)'],
      [1.0, 'rgba(12, 10, 40, 0.34)'],
    ],
    title: '#e8fbff',
    titleShadow: '#22d3ee',
    subtitle: '#f0abfc',
    frame: '#2dd4bf',
  },
  vice: {
    label: 'Vice',
    wash: [
      [0.0, 'rgba(255, 214, 90, 0.10)'],
      [0.4, 'rgba(255, 77, 141, 0.18)'],
      [0.75, 'rgba(139, 92, 246, 0.24)'],
      [1.0, 'rgba(40, 10, 70, 0.32)'],
    ],
    title: '#fff0f6',
    titleShadow: '#ff4d8d',
    subtitle: '#e9d5ff',
    frame: '#ff4d8d',
  },
  dusk: {
    label: 'Dusk',
    wash: [
      [0.0, 'rgba(30, 58, 138, 0.22)'],
      [0.5, 'rgba(124, 58, 237, 0.14)'],
      [0.85, 'rgba(249, 115, 22, 0.22)'],
      [1.0, 'rgba(20, 8, 20, 0.36)'],
    ],
    title: '#fdf6e3',
    titleShadow: '#f97316',
    subtitle: '#c7d2fe',
    frame: '#818cf8',
  },
  candy: {
    label: 'Candy',
    wash: [
      [0.0, 'rgba(255, 77, 141, 0.16)'],
      [0.45, 'rgba(236, 72, 153, 0.18)'],
      [0.8, 'rgba(34, 211, 238, 0.16)'],
      [1.0, 'rgba(30, 10, 60, 0.30)'],
    ],
    title: '#ffffff',
    titleShadow: '#ec4899',
    subtitle: '#a5f3fc',
    frame: '#ec4899',
  },
};

export const GRADE_NAMES = Object.keys(GRADES);
