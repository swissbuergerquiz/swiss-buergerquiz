// Checks questions for missing translations, duplicates and format errors.
//   node scripts/check-questions.mjs          check everything
//   node scripts/check-questions.mjs ZH       check one canton file only (src/data/cantons/ZH.js)
//   node scripts/check-questions.mjs FED      check the federal questions only
import { FED } from "../src/data/federal.js";
import FED2 from "../src/data/federal-extra.js";
import { CANTONS } from "../src/data/cantons.js";
import { buildPool } from "../src/questions.js";

const arg = (process.argv[2] || "").toUpperCase();
const LANGS = ["de", "fr", "it", "en"];
const errs = [], warns = [];

function checkEntries(list, label, expectK) {
  const ids = new Set(), texts = new Set();
  for (const e of list) {
    const where = `${label} ${e.id || "(no id)"}`;
    if (!e.id) errs.push(`${where}: missing id`);
    if (ids.has(e.id)) errs.push(`${where}: duplicate id`); ids.add(e.id);
    if (expectK && e.k !== expectK) errs.push(`${where}: k must be "${expectK}"`);
    if (!expectK && !["pol", "geo", "hist"].includes(e.c)) errs.push(`${where}: c must be pol, geo or hist`);
    if (expectK && !e.src) warns.push(`${where}: no src (source URL)`);
    for (const l of LANGS) {
      const t = e[l];
      if (!Array.isArray(t) || t.length !== 6) { errs.push(`${where} [${l}]: needs exactly 6 strings [question, correct, wrong, wrong, wrong, explanation]`); continue; }
      t.forEach((x, i) => { if (typeof x !== "string" || !x.trim() || x === "undefined") errs.push(`${where} [${l}]: field ${i} empty or not a string`); });
      if (new Set(t.slice(1, 5).map(s => String(s).trim().toLowerCase())).size !== 4) errs.push(`${where} [${l}]: answers are not all different`);
      if (String(t[0]).length > 220) warns.push(`${where} [${l}]: question is long (${t[0].length} chars)`);
      t.slice(1, 5).forEach(a => { if (String(a).length > 110) warns.push(`${where} [${l}]: answer is long (${a.length} chars)`); });
    }
    const key = String(e.de?.[0] || "").trim().toLowerCase();
    if (texts.has(key)) errs.push(`${where}: same German question text appears twice`); texts.add(key);
  }
  return list.length;
}

const report = [];
if (!arg || arg === "FED") {
  const all = [...FED, ...FED2];
  checkEntries(all, "FED");
  report.push(`federal: ${all.length} (pol ${all.filter(e => e.c === "pol").length}, geo ${all.filter(e => e.c === "geo").length}, hist ${all.filter(e => e.c === "hist").length})`);
}
const cantons = !arg ? CANTONS.map(c => c.k) : arg === "FED" ? [] : [arg];
for (const k of cantons) {
  if (!CANTONS.find(c => c.k === k)) { errs.push(`unknown canton ${k}`); continue; }
  let list;
  try { list = (await import(`../src/data/cantons/${k}.js?${Date.now()}`)).default; }
  catch (e) { errs.push(`${k}.js does not load: ${e.message}`); continue; }
  const n = checkEntries(list, k, k);
  // generated questions must still work in every language
  for (const l of ["de", "fr", "it"]) for (const q of buildPool(l, k).filter(q => q.cat === "canton"))
    if (q.a.length !== 4 || new Set(q.a).size !== 4) errs.push(`${k} ${l} ${q.id}: generated answers broken`);
  const total = buildPool("de", k).filter(q => q.cat === "canton").length;
  report.push(`${k}: ${n} hand-written + ${total - n} generated = ${total}${total < 80 ? "  (below 80)" : ""}`);
}

console.log(report.join("\n"));
if (warns.length) console.log(`\n${warns.length} warning(s):\n` + [...new Set(warns)].slice(0, 30).join("\n"));
if (errs.length) { console.log(`\n${errs.length} error(s):\n` + [...new Set(errs)].slice(0, 60).join("\n")); process.exit(1); }
console.log("\nNo errors found.");
