export interface LyricLine {
  time: number;
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  url: string;
  cover: string;
  color: string;
  colorSec: string;
  lyrics: LyricLine[];
}

export const trackList: Track[] = [
  {
    id: "track-1",
    title: "Stardust Memory",
    artist: "Aether Grid",
    album: "Cosmic Odyssey",
    genre: "Synthwave",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    color: "#a855f7",      /* Purple */
    colorSec: "#06b6d4",   /* Cyan */
    lyrics: [
      { time: 0, text: "⚡ [Intro - Synthesizer Arpeggio]" },
      { time: 12, text: "Fading signals in the deep blue night" },
      { time: 18, text: "We drift through orbits out of sight" },
      { time: 24, text: "The stardust memories start to glow" },
      { time: 30, text: "In rivers of light where the neon flows" },
      { time: 37, text: "⚡ [Synthesizer Solo Interlude]" },
      { time: 48, text: "Hold onto the frequencies we share" },
      { time: 54, text: "Floating away in the cosmic air" },
      { time: 60, text: "Gravity loses its silent hold" },
      { time: 66, text: "As the mysteries of the grid unfold" },
      { time: 72, text: "🎵 [Instrumental Outro]" }
    ]
  },
  {
    id: "track-2",
    title: "Neon Horizon",
    artist: "Retro Dynamic",
    album: "Outrun 1988",
    genre: "Synthwave",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1515462277126-270d878326e5?w=400&auto=format&fit=crop&q=80",
    color: "#ec4899",      /* Pink */
    colorSec: "#eab308",   /* Yellow */
    lyrics: [
      { time: 0, text: "🔥 [Intro - Retrowave Beat Kick]" },
      { time: 8, text: "Driving fast on the highway line" },
      { time: 14, text: "Chasing the sun at the end of time" },
      { time: 20, text: "Gridlines flashing in pink and red" },
      { time: 26, text: "Leaving behind everything they said" },
      { time: 32, text: "Oh, we run to the neon horizon" },
      { time: 38, text: "Under the shade of the cyber sun" },
      { time: 44, text: "No speed limits, no looking back" },
      { time: 50, text: "Leaving our tracks on the digital track" },
      { time: 56, text: "🎸 [Synthesizer Chorus Drop]" }
    ]
  },
  {
    id: "track-3",
    title: "Rainy Coffee Shop",
    artist: "Lofi Dreamer",
    album: "Muted Coffee",
    genre: "Chill",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&auto=format&fit=crop&q=80",
    color: "#3b82f6",      /* Blue */
    colorSec: "#f97316",   /* Orange */
    lyrics: [
      { time: 0, text: "🌧️ [Rainfall Ambient Intro]" },
      { time: 10, text: "Raindrops tapping on the window glass" },
      { time: 17, text: "Watching the crowded streets slowly pass" },
      { time: 24, text: "Warm cup of coffee held in my hands" },
      { time: 31, text: "Lost in the rhythms of jazz-hop bands" },
      { time: 38, text: "Soft keys drifting, the room is warm" },
      { time: 45, text: "Safe and cozy inside the storm" },
      { time: 52, text: "Time stands still as the records turn" },
      { time: 59, text: "Nothing to do and no lessons to learn" },
      { time: 66, text: "☕ [Lofi Rhodes Saxophone Outro]" }
    ]
  },
  {
    id: "track-4",
    title: "Whispers in the Wind",
    artist: "Acoustic Ember",
    album: "Rustic Echoes",
    genre: "Classical",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&auto=format&fit=crop&q=80",
    color: "#10b981",      /* Emerald */
    colorSec: "#84cc16",   /* Lime */
    lyrics: [
      { time: 0, text: "🍃 [Soft Classical Guitar Plucking]" },
      { time: 14, text: "Morning dew on the meadow green" },
      { time: 21, text: "Quiet moments, a peaceful scene" },
      { time: 28, text: "Leaves are dancing in gentle air" },
      { time: 35, text: "Carrying whispers from here to there" },
      { time: 42, text: "Wind in the skies, sing your melody" },
      { time: 49, text: "Songs of the earth, wild and free" },
      { time: 56, text: "Paths we walk beneath ancient trees" },
      { time: 63, text: "Set our hearts at complete ease" },
      { time: 70, text: "🍃 [Violin Chord Outro]" }
    ]
  }
];
