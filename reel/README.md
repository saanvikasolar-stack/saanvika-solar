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
