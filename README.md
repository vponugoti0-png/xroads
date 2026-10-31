# X ROADS — friends edition (v2)
Static site: `index.html`, `style.css`, `game.js`, `heroes/`. No backend. Run: `python3 -m http.server 8080` and open http://localhost:8080.

## Hero images (swap in 10 seconds)
Drop a file named after the hero into `heroes/`:
`rebel`, `icon`, `tiger`, `heir`, `prince`, `lion` + `.png` (preferred, transparent cutout), `.jpg`, `.jpeg` or `.webp`.
e.g. `heroes/lion.png`. Square images (~256–512 px) look best. Reload the page. Missing files fall back automatically to a neon silhouette with the hero name.

## Scoring
Seats per banner: +1, +3 CENTER (+6 for Icon), +2 WHISTLE (edge scrape), +(combo−1) for chained bonus passes.
Share = banners×10 · Gross = seats · Overseas = best combo×5 · Loudest = whistles×5 · Total = sum.

## Powers
Rebel: widen next banner once (E/⚡) · Icon: double center · Tiger: 3 s slow-mo (E/⚡) · Heir: magnet to center · Prince: shield vs one banner hit · Lion: one revive.

## Ghost
House ghost = median of 5 simulated autopilot runs on the same banners (difficulty-based reaction noise), same physics. Pass-the-phone: P2 races P1's recorded run.
