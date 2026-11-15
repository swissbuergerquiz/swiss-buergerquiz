// Builds the question pool for one language and canton: federal + generated canton facts + hand-written canton questions.
import { FED as FED1 } from "./data/federal.js";
import FED2 from "./data/federal-extra.js";
const FED = [...FED1, ...FED2];
import { CANTONS, CUSTOM } from "./data/cantons.js";
import TXT from "./data/i18n.js";
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (arr, n) => shuffle(arr).slice(0, n);
const FR_OF = { JU:"du Jura", VS:"du Valais", TI:"du Tessin", GR:"des Grisons", AG:"d'Argovie", UR:"d'Uri", OW:"d'Obwald",
  AR:"d'Appenzell Rhodes-Extérieures", AI:"d'Appenzell Rhodes-Intérieures", TG:"de Thurgovie" };
const cName = (c, lang) => lang === "fr" ? (FR_OF[c.k] || "de " + c.n.fr) : c.n[lang];
const fromTuple = (e, lang) => { const t = e[lang], en = e.en; return { id:e.id, cat:e.c || "canton", q:t[0], a:[t[1],t[2],t[3],t[4]], x:t[5], enQ:en[0], enX:en[5] }; };
const nearest = (pool, v, n) => pool.filter(p => p !== v).sort((a,b) => Math.abs(a-v) - Math.abs(b-v)).slice(0, n + 2);
const PARL_NAMES = ["Kantonsrat","Landrat","Grosser Rat","Grand Conseil","Gran Consiglio","Parlement","Bürgerrat","Gemeinderat"];
const LANG_SETS = [["de"],["fr"],["it"],["de","fr"],["de","it"],["fr","it"],["de","rm","it"],["de","rm"]];
const sameSet = (a,b) => a.length === b.length && a.every(x => b.includes(x));

function templateQs(c, lang){
  const t = TXT[lang].t, te = TXT.en.t, cn = cName(c, lang), ce = c.n.en, out = [];
  const add = (id, tl, tel, v, ve, wrong, l) => {
    const [q, xf] = tl(cn), [eq, exf] = tel(ce);
    out.push({ id:`${c.k}-${id}`, cat:"canton", q, a:[String(v), ...wrong.map(String)], x:xf(cn, v, l), enQ:eq, enX:exf(ce, ve, l) });
  };
  add("cap", t.cap, te.cap, c.cap[lang], c.cap.en, pick(c.towns, 3));
  add("gov", t.gov, te.gov, c.gov, c.gov, [3,5,7,9].filter(n => n !== c.gov).slice(0,3), c.govL);
  add("parlN", t.parlN, te.parlN, c.parlL, c.parlL, pick(PARL_NAMES.filter(p => !c.parlL.includes(p)), 3));
  add("parlS", t.parlS, te.parlS, c.parl, c.parl, pick(nearest([50,55,60,64,65,80,90,100,110,120,130,140,150,160,180], c.parl, 3), 3), c.parlL);
  const yrs = [1291,1332,1351,1352,1353,1481,1501,1513,1803,1815,1848,1979];
  if (c.k === "JU") add("join", t.joinJU, te.joinJU, 1979, 1979, [1815,1848,1978]);
  else add("join", t.join, te.join, c.join, c.join, pick(nearest(yrs, c.join, 3), 3));
  const nrW = [...new Set([c.nr+1, c.nr+2, c.nr+3, c.nr-1, c.nr-2].filter(n => n > 0 && n !== c.nr))];
  add("nr", t.nr, te.nr, c.nr, c.nr, pick(nrW, 3));
  add("sr", t.sr, te.sr, c.sr, c.sr, [1,2,3,4].filter(n => n !== c.sr));
  const ln = (set, lg) => set.map(k => TXT[lg].langNames[k]).join(", ");
  const wrongSets = pick(LANG_SETS.filter(s => !sameSet(s, c.langs)), 3);
  add("langs", t.langs, te.langs, ln(c.langs, lang), ln(c.langs, "en"), wrongSets.map(s => ln(s, lang)));
  return out;
}
export function buildPool(lang, k){
  const c = CANTONS.find(x => x.k === k);
  const fed = FED.map(e => fromTuple(e, lang));
  const own = c ? [...templateQs(c, lang), ...CUSTOM.filter(e => e.k === c.k).map(e => fromTuple(e, lang))] : [];
  return [...fed, ...own];
}
