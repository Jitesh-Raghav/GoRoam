# GoRoam — the product film

A motion-graphics product film for GoRoam, made in [Remotion](https://remotion.dev) (React, rendered frame by frame) with voice, sound design and score by [ElevenLabs](https://elevenlabs.io).

| Cut | Size | Length | Use |
| --- | --- | --- | --- |
| `Film-16x9` | 1920×1080 | ~60s | Landing page, YouTube, LinkedIn |
| `Film-9x16` | 1080×1920 | ~60s | Reels, TikTok, Shorts (burned-in captions) |
| `Teaser-16x9` / `Teaser-9x16` | | ~20s | Ads, stories |
| `Preview-16x9` | 1280×720 | ~10s | Silent autoplay loop on the landing page |

The film reuses the app's own design system and drawing code, so it looks like GoRoam rather than a template. That includes the colour tokens, Instrument Serif, Fraunces and Geist, the logo, the trip data from `src/data/packages/japan-5-days.json`, and the world-wonders panorama from `src/components/scenes`.

## Story

1. **Cold open:** a gold flight path draws itself around *"Every great trip starts with a feeling."*
2. **The problem:** 23 tabs, a spreadsheet and a group chat pile up, then implode.
3. **Just say it:** one sentence typed into the planner; chips appear as it's understood.
4. **The build:** the logo-loader thinks, then five real days assemble, with costs, budget and times of day highlighted as the narrator names them.
5. **The map:** Day 1 in Tokyo; pins drop on the real stops and the route draws itself.
6. **Local guide:** phrases, food, events and tips fan out (a swipeable deck in vertical).
7. **Book it. Share it. Go.:** prefilled bookings, a share link, the crew joins.
8. **Finale:** the wonders rise like a pop-up book and the logo assembles itself.

## Make it

```bash
cd video
npm install
cp .env.example .env          # add ELEVENLABS_API_KEY
npm run audio                 # voiceover, 15 sound effects, score (cached)
npm run studio                # preview and scrub every cut
npm run render:all            # 4 MP4s in out/, loudness-normalised, landing assets → ../public/video
```

- **No key yet?** Everything renders silently on estimated timings, so you can preview the picture now.
- **Another voice:** `npm run voices` lists your account's voices. Set `ELEVENLABS_VOICE_ID` in `.env`, then run `npm run audio`. The default is a warm storyteller narrator (George, falling back to Brian or Daniel).
- **Music:** on a paid ElevenLabs plan, Eleven Music composes a full-length score timed to the cut. On the free plan, `npm run audio` builds the score from three shorter cues made with the sound-effects model instead: an intro, a seamless looping bed and a finale swell, crossfaded at the scene cuts. For the best result, drop a licensed track at `public/audio/music-film.mp3` (and `music-teaser.mp3`) and run `npm run audio`; your file always wins.
- **Voices:** listing voices needs an API key with the `voices_read` permission. Without it, the default narrator is used.
- **Memory:** renders use 3 parallel workers, which fits an 8 GB machine. On a bigger machine, `REMOTION_CONCURRENCY=6 npm run render:all` is faster. If a render dies with exit code `3221225773`, Windows ran out of memory; close apps or lower the concurrency.
- **Change a line:** edit `src/script.ts`, then run `npm run audio`. Only that line is regenerated, and the whole cut re-times itself around the new read. Captions and sound cues stay synced to the actual words.
- **Mix-only changes** (music, levels, SFX): `npm run remix` re-renders just the soundtracks and swaps them into the existing videos. It takes a few minutes instead of a full render.
- `npm run timeline` prints where every beat lands.

## How it's built

- `src/script.ts` is the single source of truth: every scene's line, pacing and transition.
- `src/timeline.ts` turns the script plus the real voiceover durations into frame ranges. It's shared with the audio script.
- `src/scenes/*` holds one file per scene. Each scene exports its own sound cues, so SFX stay locked to the motion.
- `src/audio/Soundtrack.tsx` handles the mix: VO at full, music ducked to about -18 dB under the voice, a lift for the finale, and SFX as accents. `scripts/finish.ts` normalises the result to -14 LUFS.
- Everything is driven by `useCurrentFrame()`, so renders are deterministic and frame-exact.

Remotion is free for individuals and companies of up to three people; larger teams need a [company licence](https://remotion.dev/license).
