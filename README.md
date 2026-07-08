# AURA - Premium Web Music Player (Next.js & Tailwind CSS)

A premium, immersive music streaming interface built with Next.js, styled like **shadcn/ui** with **Tailwind CSS**, and utilizing the **Web Audio API** for visualizer spectrums, time domain oscilloscopes, multi-band equalizer adjustments, and procedural synthwave beat synthesis.

---

## Technical Features

1. **Turntable Vinyl Animation**: Centered turntable featuring a 3D glass shine, concentric vinyl grooves, dynamic record spin loops, and a physical pivoting tonearm needle that positions onto the record during active plays.
2. **Interactive Audio Visualizer Canvas**: Real-time rendering modes (Classic Frequency Bars, Circular Spectrum, Oscilloscope Waveform, Flowing Energy Particles) responding directly to the playing audio node.
3. **Equalizer (EQ) Settings Panel**: 5-band cascading peaking filters (60Hz, 230Hz, 910Hz, 4kHz, 14kHz) allowing customized frequency decibel scales (+/-12dB) or pre-configured equalizer presets (Bass Boost, Vocal Boost, Electronic, Normal).
4. **Scrolling Synchronized Lyrics**: Time-aligned scrolling panel keeping the active lyric line highlighted and vertically centered. Interactive line clicks automatically scrub playback to that specific part of the song.
5. **Procedural Web Audio Synthesizer**: Offbeat hi-hat, rolling bass arpeggios, sawtooth wave leads, and resonant lowpass sweeps computed entirely offline on the client side using Web Audio API nodes.

---

## Local Verification & Build Tests

To review, run, or build this application locally, ensure you have **Node.js (v18+)** installed:

### Install dependencies
```bash
npm install
```

### Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Create build files for testing
```bash
npm run build
```

---

## Deployment to Vercel (Step-by-Step)

Vercel provides native, out-of-the-box support for Next.js App Router projects. There is **zero configuration** required!

### Option 1: Vercel Git Integration (Recommended)
1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "feat: premium nextjs music player"
   ```
2. Create a new repository on your GitHub, GitLab, or Bitbucket account.
3. Link your local project to your remote repository and push:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```
4. Log in to [Vercel](https://vercel.com).
5. Click **"Add New"** > **"Project"**.
6. Import your newly pushed Git repository.
7. Click **"Deploy"** (Vercel automatically detects Next.js, installs npm packages, compiles TypeScript, and provides a live production link!).

### Option 2: Deploying via Vercel CLI
If you have the Vercel CLI installed, simply run this in your root folder:
```bash
vercel
```
Follow the interactive prompts to link and deploy your application.
