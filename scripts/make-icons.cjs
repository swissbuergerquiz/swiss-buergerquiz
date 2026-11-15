// Renders the app icon and splash screens from SVG with Playwright.
const { chromium } = require("playwright");
const fs = require("fs");
const tram = (fg, win, gold) => `
  <g>
    <path d="M512 210 L560 300 M512 210 L464 300" stroke="${fg}" stroke-width="18" stroke-linecap="round" fill="none"/>
    <rect x="430" y="292" width="164" height="22" rx="11" fill="${fg}"/>
    <rect x="170" y="320" width="684" height="360" rx="70" fill="${fg}"/>
    <rect x="215" y="370" width="150" height="130" rx="22" fill="${win}"/>
    <rect x="395" y="370" width="150" height="130" rx="22" fill="${win}"/>
    <rect x="575" y="370" width="150" height="130" rx="22" fill="${win}"/>
    <rect x="755" y="370" width="60" height="130" rx="18" fill="${gold}"/>
    <rect x="170" y="560" width="684" height="26" fill="${win}" opacity=".35"/>
    <circle cx="320" cy="705" r="52" fill="#13201a"/><circle cx="320" cy="705" r="20" fill="${fg}"/>
    <circle cx="704" cy="705" r="52" fill="#13201a"/><circle cx="704" cy="705" r="20" fill="${fg}"/>
    <path d="M800 150 l26 54 59 7 -44 40 12 58 -53 -29 -53 29 12 -58 -44 -40 59 -7z" fill="${gold}"/>
  </g>`;
const svg = (size, body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : ""}${body}</svg>`;
const scaled = (s, k, inner) => `<g transform="translate(${s/2 - 512*k} ${s/2 - 460*k}) scale(${k})">${inner}</g>`;
const jobs = {
  "icon-only.png": svg(1024, tram("#ffffff", "#0e7a45", "#f2c040"), "#0e7a45"),
  "icon-foreground.png": svg(1024, scaled(1024, 0.62, tram("#ffffff", "#0e7a45", "#f2c040")), null),
  "icon-background.png": svg(1024, "", "#0e7a45"),
  "splash.png": svg(2732, scaled(2732, 0.9, tram("#ffffff", "#0e7a45", "#f2c040")), "#0e7a45"),
  "splash-dark.png": svg(2732, scaled(2732, 0.9, tram("#38b874", "#0d1511", "#f2c040")), "#0d1511"),
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const [name, s] of Object.entries(jobs)) {
    const size = name.startsWith("splash") ? 2732 : 1024;
    await p.setViewportSize({ width: size, height: size });
    await p.setContent(`<html><body style="margin:0;background:transparent">${s}</body></html>`);
    await p.screenshot({ path: "assets/" + name, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  }
  await b.close();
  console.log(fs.readdirSync("assets").join(", "));
})();
