// Checks every question in every language for missing text or duplicate answers. Run: node scripts/check-questions.mjs
import { FED } from "../src/data/federal.js";
import { CANTONS, CUSTOM } from "../src/data/cantons.js";
import { buildPool } from "../src/questions.js";
const errs=[]; const ids=new Set();
for (const e of [...FED,...CUSTOM]) {
  if (ids.has(e.id)) errs.push("dup id "+e.id); ids.add(e.id);
  for (const l of ["de","fr","it","en"]) {
    const t=e[l]; if(!t||t.length!==6||t.some(x=>!x)) { errs.push(`${e.id} ${l} bad tuple`); continue; }
    if (new Set(t.slice(1,5)).size!==4) errs.push(`${e.id} ${l} duplicate answers`);
  }
}
for (const k of new Set(CUSTOM.map(c=>c.k))) if(!CANTONS.find(c=>c.k===k)) errs.push("unknown canton "+k);
let total=0;
for (const c of CANTONS) for (const l of ["de","fr","it"]) for (let r=0;r<20;r++) {
  const p=buildPool(l,c.k); total=p.length;
  for (const q of p) { if (q.a.length!==4 || new Set(q.a).size!==4 || q.a.some(a=>a===undefined||a==="undefined")) errs.push(`${c.k} ${l} ${q.id}: ${q.a.join(" | ")}`);
    if (!q.q||!q.x||!q.enQ||!q.enX) errs.push(`${c.k} ${l} ${q.id} missing text`); }
}
console.log("federal:",FED.length,"custom:",CUSTOM.length,"cantons:",CANTONS.length,"sum NR:",CANTONS.reduce((s,c)=>s+c.nr,0),"sum SR:",CANTONS.reduce((s,c)=>s+c.sr,0));
console.log("per-canton counts:",CANTONS.map(c=>c.k+":"+buildPool("de",c.k).filter(q=>q.cat==="canton").length).join(" "));
const e=[...new Set(errs)]; console.log(e.slice(0,20).join("\n")||"No errors found."); if (e.length) process.exit(1);
