# Saanvika Solar · Instagram Reels

`Saanvika_BillShock_Reel_v1.mp4` — 42 s, 1080×1920, 30 fps, silent track (add trending audio on Instagram).
`Saanvika_BillShock_Reel_v1_cover.jpg` — hook frame for the cover.
`Saanvika_BillShock_Reel_caption_and_VO.md` — caption, hashtags, Telugu voice-over script with timings, posting checklist.

## Re-render

```bash
cd reel/src
node cap.js test 2.4,12,30          # quick frames -> test/
for r in "0 315" "315 630" "630 945" "945 1260"; do set -- $r; node cap.js run $1 $2 & done; wait
ffmpeg -framerate 30 -i frames/%05d.jpg -f lavfi -i anullsrc=r=48000:cl=stereo \
  -vf "fade=t=out:st=41.2:d=0.8,format=yuv420p" -c:v libx264 -crf 18 -c:a aac -shortest -movflags +faststart -t 42 out.mp4
```

Edit copy, timings and colours in `reel.html` (every animation delay is the scene time in seconds).
Photos in `img/h*_hi.jpg` are AI-generated (Canva); regenerate and drop in replacements with the same names.

## Venky Mama Ep. 1 (comedy reel, v1)

`Saanvika_VenkyMama_Ep1_v1.mp4` — 30.5 s with synthesized SFX; `_muted.mp4` for trending-audio-only posting; `_cover.jpg`; caption + notes in `Saanvika_VenkyMama_Ep1_caption_and_notes.md`.

Source: `src/venky.html` (timeline), `src/shots/s01..s12.jpg` (AI stills, consistent characters), `src/sfx/` (SFX synthesized by `gen_sfx.py`, cue list in `mix_sfx.py`), `src/final_concept.json` (full shot list + image prompts).

```bash
cd reel/src && python3 sfx/gen_sfx.py && python3 mix_sfx.py 30.5 sfx_mix.wav
for r in "0 229" "229 458" "458 687" "687 915"; do set -- $r; REEL=venky.html node cap.js run $1 $2 & done; wait
ffmpeg -framerate 30 -i frames/%05d.jpg -i sfx_mix.wav -vf "fade=t=out:st=29.9:d=0.6,format=yuv420p" -c:v libx264 -crf 18 -c:a aac -shortest -movflags +faststart -t 30.5 out.mp4
```
