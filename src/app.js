import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { CANTONS } from "./data/cantons.js";
import TXT, { LANGS } from "./data/i18n.js";
import { buildPool as build } from "./questions.js";

const $ = id => document.getElementById(id);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (arr, n) => shuffle(arr).slice(0, n);
const NATIVE = Capacitor.isNativePlatform();

// ---------- state ----------
let S = { xp:0, best:{}, wrong:[], badges:[], cards:0, lines:[], muted:false, hadWrong:false,
          dayStreak:0, lastDay:"", reminder:{on:false,time:"19:00"}, lang:"", canton:"", enHelp:true };
async function load(){
  let raw = null;
  try { raw = (await Preferences.get({ key:"sbq" })).value; } catch(e){}
  if (!raw) { try { raw = localStorage.getItem("sbq"); } catch(e){} }
  if (raw) { try { S = Object.assign(S, JSON.parse(raw)); } catch(e){} }
}
function save(){
  const raw = JSON.stringify(S);
  try { localStorage.setItem("sbq", raw); } catch(e){}
  Preferences.set({ key:"sbq", value:raw }).catch(()=>{});
}
const T = () => TXT[S.lang] || TXT.de;
const canton = () => CANTONS.find(c => c.k === S.canton);

let POOL = [];
const buildPool = () => build(S.lang, S.canton);

// ---------- feedback: sound, haptics, confetti ----------
let ac = null;
function tone(freqs, dur=.09, type="triangle"){
  if (S.muted) return;
  try { ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f,i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f;
      const t = ac.currentTime + i*dur; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.18,t+.01); g.gain.exponentialRampToValueAtTime(.0001,t+dur*1.6);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t+dur*1.8); }); } catch(e){}
}
const sGood = () => tone([988,1319],.08), sBad = () => tone([196,165],.12,"sawtooth"), sWin = () => tone([659,784,988,1319],.1);
function buzz(kind){
  if (!NATIVE) return;
  if (kind === "good") Haptics.impact({ style:ImpactStyle.Light }).catch(()=>{});
  else if (kind === "bad") Haptics.notification({ type:NotificationType.Error }).catch(()=>{});
  else Haptics.notification({ type:NotificationType.Success }).catch(()=>{});
}
const fx = $("fx"), cx = fx.getContext("2d"); let parts = [], raf = 0;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
function confetti(n=60, y=.4){
  if (reduce) return;
  fx.width = innerWidth*devicePixelRatio; fx.height = innerHeight*devicePixelRatio;
  const cs = getComputedStyle(document.documentElement);
  const cols = ["--gold","--tram","--signal","--l3"].map(c => cs.getPropertyValue(c).trim());
  for (let i=0;i<n;i++) parts.push({x:innerWidth/2,y:innerHeight*y,vx:(Math.random()-.5)*12,vy:-Math.random()*12-4,r:Math.random()*6+4,c:cols[i%4],a:Math.random()*6,va:(Math.random()-.5)*.4,life:90+Math.random()*40});
  if (!raf) loop();
}
function loop(){
  cx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); cx.clearRect(0,0,innerWidth,innerHeight);
  parts.forEach(p => { p.vy+=.35; p.x+=p.vx; p.y+=p.vy; p.vx*=.99; p.a+=p.va; p.life--;
    cx.save(); cx.translate(p.x,p.y); cx.rotate(p.a); cx.fillStyle=p.c; cx.globalAlpha=Math.min(1,p.life/30); cx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2); cx.restore(); });
  parts = parts.filter(p => p.life>0 && p.y<innerHeight+40);
  raf = parts.length ? requestAnimationFrame(loop) : (cx.clearRect(0,0,innerWidth,innerHeight), 0);
}
function popText(t){ const d = document.createElement("div"); d.className = "pop"; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 900); }

// ---------- constants ----------
const LINE_ORDER = ["pol","geo","hist","canton"];
const LINE_COLOR = { pol:"--l1", geo:"--l2", hist:"--l3", canton:"--l4" };
const STOPS = ["Zürich HB","Bern","Lausanne","Luzern","Lugano","Chur","Genève","Basel SBB","St. Gallen","Sion","Neuchâtel","Brig","Arth-Goldau","Olten","Winterthur","Fribourg","Bellinzona","Interlaken Ost","Zug","Schaffhausen","Aarau","Delémont","Frauenfeld","Altdorf","Stans"];
const LEVELS = [0,100,300,600,1000,1600];
const BADGE_IDS = ["first","combo5","perfect","all","talk","clean"];
const ICON = {
  heart:'<svg viewBox="0 0 24 24"><path fill="var(--signal)" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3 1.7-1.8 3.2-3 5.3-3 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>',
  star:on => `<svg viewBox="0 0 24 24" class="${on?"on":""}"><path fill="${on?"var(--gold)":"var(--rule)"}" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>`,
  train:'<svg viewBox="0 0 34 22"><rect x="1" y="3" width="32" height="15" rx="4" fill="var(--tram)"/><rect x="4" y="6" width="6" height="5" rx="1" fill="var(--card)"/><rect x="12" y="6" width="6" height="5" rx="1" fill="var(--card)"/><rect x="20" y="6" width="6" height="5" rx="1" fill="var(--card)"/><rect x="28" y="6" width="3" height="5" rx="1" fill="var(--gold)"/><circle cx="8" cy="19" r="2.2" fill="var(--ink)"/><circle cx="26" cy="19" r="2.2" fill="var(--ink)"/><path d="M17 3V0" stroke="var(--ink)" stroke-width="1.5"/></svg>',
  on:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
  off:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>',
  medal:t => `<svg viewBox="0 0 40 40"><path d="M12 2h6l3 10h-6zM28 2h-6l-3 10h6z" fill="var(--l3)"/><circle cx="20" cy="25" r="13" fill="var(--gold)"/><circle cx="20" cy="25" r="9.5" fill="none" stroke="var(--card)" stroke-width="1.5" opacity=".7"/><text x="20" y="30" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="13" fill="#1a1300">${t}</text></svg>`,
  flame:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 5 5.5 5 10.5A5 5 0 0 1 7 12.5c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9z"/></svg>'
};

function show(id){ ["onb","home","play","result","cards"].forEach(s => $(s).hidden = s !== id); window.scrollTo(0,0); }
const lineName = cat => cat === "canton" ? `${T().lines.canton[0]} · ${canton().n[S.lang]}` : T().lines[cat][0];

// ---------- daily streak ----------
const dayKey = d => `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
function touchDay(){ const today = dayKey(new Date()); if (S.lastDay === today) return;
  const y = new Date(); y.setDate(y.getDate()-1); S.dayStreak = S.lastDay === dayKey(y) ? S.dayStreak+1 : 1; S.lastDay = today; }
function liveStreak(){ const t = new Date(), y = new Date(); y.setDate(y.getDate()-1); return (S.lastDay === dayKey(t) || S.lastDay === dayKey(y)) ? S.dayStreak : 0; }

// ---------- onboarding ----------
function guessLang(){ const l = (navigator.language || "de").slice(0,2); return LANGS[l] ? l : "de"; }
function renderOnb(){
  const t = T();
  $("oSub").textContent = t.sub; $("oTitle").textContent = t.welcome; $("oText").textContent = t.welcomeP;
  $("oLangT").textContent = t.chooseLang; $("oCantonT").textContent = t.chooseCanton; $("oStart").textContent = t.start;
  $("oLangs").innerHTML = "";
  Object.entries(LANGS).forEach(([k, name]) => { const b = document.createElement("button"); b.className = "chip"; b.textContent = name;
    b.setAttribute("aria-pressed", S.lang === k); b.onclick = () => { S.lang = k; renderOnb(); }; $("oLangs").appendChild(b); });
  $("oCantons").innerHTML = "";
  [...CANTONS].sort((a,b) => a.n[S.lang].localeCompare(b.n[S.lang], S.lang)).forEach(c => {
    const b = document.createElement("button"); b.className = "cbtn"; b.setAttribute("aria-pressed", S.canton === c.k);
    b.innerHTML = `<b>${c.k}</b><span></span>`; b.lastChild.textContent = c.n[S.lang];
    b.onclick = () => { S.canton = c.k; renderOnb(); }; $("oCantons").appendChild(b); });
  $("oStart").disabled = !S.canton;
}
$("oStart").onclick = () => { save(); POOL = buildPool(); document.documentElement.lang = S.lang; renderHome(); show("home"); };

// ---------- home ----------
function levelInfo(xp){ let i = 0; while (i < LEVELS.length-1 && xp >= LEVELS[i+1]) i++;
  return { name:T().ranks[i], pct:i < LEVELS.length-1 ? (xp-LEVELS[i])/(LEVELS[i+1]-LEVELS[i])*100 : 100, next:i < LEVELS.length-1 ? [LEVELS[i+1], T().ranks[i+1]] : null }; }
function award(id, list){ if (!S.badges.includes(id)) { S.badges.push(id); list && list.push(T().badges[id][0]); } }
function renderHome(){
  const t = T(), L = levelInfo(S.xp), c = canton();
  document.documentElement.lang = S.lang;
  $("hSub").textContent = t.sub; $("tRank").textContent = t.rank; $("tChoose").textContent = t.chooseLine;
  $("xpTotal").textContent = S.xp + " XP"; $("lvlName").textContent = L.name; $("lvlBar").style.width = L.pct + "%";
  $("lvlNext").textContent = L.next ? t.xpTo(L.next[0]-S.xp, L.next[1]) : t.maxRank;
  const ds = liveStreak(); $("dayStreak").innerHTML = ds ? ICON.flame + t.days(ds) : "";
  $("lines").innerHTML = "";
  LINE_ORDER.forEach((cat, i) => { const b = document.createElement("button"); b.className = "linecard"; b.style.setProperty("--lc", `var(${LINE_COLOR[cat]})`);
    const n = POOL.filter(q => q.cat === cat).length, st = S.best[`${cat}${cat==="canton"?"-"+S.canton:""}`] || 0;
    const sub = cat === "canton" ? c.n[S.lang] : t.lines[cat][1];
    b.innerHTML = `<div class="lnum">${cat==="canton"?c.k:i+1}</div><h3></h3><small></small><div class="stars">${[1,2,3].map(k => ICON.star(k <= st)).join("")}</div>`;
    if (cat === "canton") b.querySelector(".lnum").style.fontSize = "14px";
    b.querySelector("h3").textContent = t.lines[cat][0]; b.querySelector("small").textContent = `${sub} · ${t.nq(n)}`;
    b.onclick = () => start(cat); $("lines").appendChild(b); });
  $("tMix").textContent = t.express[0]; $("tMixS").textContent = t.express[1];
  $("tCards").textContent = t.interview[0]; $("tCardsS").textContent = t.interview[1];
  const w = wrongIds().length; $("tWrong").textContent = t.wrong[0]; $("wrongCount").textContent = t.wrong[1](w); $("mWrong").disabled = !w;
  $("tBadges").textContent = t.badgesT;
  $("badges").innerHTML = BADGE_IDS.map(id => `<div class="badge ${S.badges.includes(id)?"on":""}">${ICON.medal(t.badges[id][0][0])}<b>${t.badges[id][0]}</b><small>${t.badges[id][1]}</small></div>`).join("");
  $("mute").innerHTML = S.muted ? ICON.off : ICON.on;
  // settings
  $("tSettings").textContent = t.settings; $("sLangT").textContent = t.lang; $("sCantonT").textContent = t.canton;
  $("sEnT").textContent = t.enHelp; $("sEnP").textContent = t.enHelpP; $("sEn").setAttribute("aria-checked", S.enHelp);
  $("sLang").innerHTML = Object.entries(LANGS).map(([k,n]) => `<option value="${k}" ${k===S.lang?"selected":""}>${n}</option>`).join("");
  $("sCanton").innerHTML = [...CANTONS].sort((a,b) => a.n[S.lang].localeCompare(b.n[S.lang], S.lang))
    .map(x => `<option value="${x.k}" ${x.k===S.canton?"selected":""}>${x.n[S.lang]}</option>`).join("");
  $("aboutS").textContent = t.about;
  $("aboutB").innerHTML = t.aboutT.map(([h,p]) => `<h3>${h}</h3><p>${p}</p>`).join("");
  $("hNote").textContent = t.note;
  renderReminder();
}
const wrongIds = () => S.wrong.filter(id => POOL.some(q => q.id === id));
$("mute").onclick = () => { S.muted = !S.muted; save(); renderHome(); };
$("mMix").onclick = () => start("mix"); $("mWrong").onclick = () => start("wrong"); $("mCards").onclick = startCards;
$("sLang").onchange = e => { S.lang = e.target.value; save(); POOL = buildPool(); renderHome(); };
$("sCanton").onchange = e => { S.canton = e.target.value; save(); POOL = buildPool(); renderHome(); };
$("sEn").onclick = () => { S.enHelp = !S.enHelp; save(); renderHome(); };

// ---------- game ----------
let G = null;
function start(mode){
  let pool;
  if (mode === "mix") pool = pick(POOL, 15);
  else if (mode === "wrong") pool = pick(POOL.filter(q => S.wrong.includes(q.id)), 15);
  else pool = pick(POOL.filter(q => q.cat === mode), 12);
  const off = Math.floor(Math.random()*STOPS.length);
  G = { mode, pool, i:0, lives:3, streak:0, bestStreak:0, xp:0, right:0, marks:[], stops:pool.map((_,i) => STOPS[(off+i)%STOPS.length]), answered:false, newB:[] };
  $("tNext").textContent = T().nextStop; $("quit").setAttribute("aria-label", T().quit);
  show("play"); renderQ();
}
const mult = () => G.streak >= 6 ? 3 : G.streak >= 3 ? 2 : 1;
function renderHUD(){
  $("hearts").innerHTML = [0,1,2].map(i => `<span class="${i<G.lives?"":"lost"}">${ICON.heart}</span>`).join("");
  const m = mult(); $("combo").textContent = `×${m} · ${G.streak}`; $("combo").classList.toggle("hot", m > 1);
  $("xpRound").textContent = G.xp + " XP";
}
function renderTrack(){
  const n = G.pool.length, pos = i => n > 1 ? i/(n-1)*100 : 50;
  let h = `<div class="rail"></div><div class="done" style="width:${pos(G.i)}%"></div>`;
  for (let i=0;i<n;i++) h += `<div class="stop ${G.marks[i]||""}" style="left:${pos(i)}%"></div>`;
  $("track").innerHTML = h + `<div class="tram" style="left:${pos(G.i)}%">${ICON.train}</div>`;
}
function renderQ(){
  const q = G.pool[G.i]; G.answered = false; renderHUD(); renderTrack();
  $("stopName").textContent = G.stops[G.i]; $("qPos").textContent = `${G.i+1}/${G.pool.length}`;
  $("qTopic").textContent = lineName(q.cat); $("qTopic").style.color = `var(${LINE_COLOR[q.cat]})`;
  $("qText").textContent = q.q; $("qEn").textContent = S.enHelp ? q.enQ : ""; $("qEn").hidden = !S.enHelp;
  $("opts").innerHTML = "";
  shuffle(q.a).forEach((txt, k) => { const b = document.createElement("button"); b.className = "opt"; b.dataset.ok = txt === q.a[0] ? 1 : 0;
    b.innerHTML = `<span class="k">${k+1}</span><span></span>`; b.lastChild.textContent = txt; b.onclick = () => answer(b); $("opts").appendChild(b); });
  $("fb").hidden = true; $("next").hidden = true;
}
function answer(btn){
  if (G.answered) return; G.answered = true;
  const t = T(), q = G.pool[G.i], ok = btn.dataset.ok === "1";
  [...$("opts").children].forEach(b => { b.disabled = true; if (b.dataset.ok === "1") b.classList.add("right"); else if (b !== btn) b.classList.add("dim"); });
  if (ok) {
    G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak); G.right++; const gain = 10*mult(); G.xp += gain; G.marks[G.i] = "ok";
    S.wrong = S.wrong.filter(id => id !== q.id);
    sGood(); buzz("good"); popText("+" + gain + " XP"); if (G.streak === 3 || G.streak === 6) confetti(30,.35);
    if (G.streak >= 5) award("combo5", G.newB);
    $("fbH").textContent = G.streak >= 3 ? t.okStreak(G.streak) : t.ok; $("fb").className = "fb ok";
  } else {
    btn.classList.add("wrong"); G.streak = 0; G.lives--; G.marks[G.i] = "no";
    if (!S.wrong.includes(q.id)) S.wrong.push(q.id); S.hadWrong = true;
    sBad(); buzz("bad");
    $("fbH").textContent = G.lives ? t.no : t.over; $("fb").className = "fb no";
  }
  $("fbX").textContent = q.x; $("fbEn").textContent = S.enHelp ? q.enX : ""; $("fbEn").hidden = !S.enHelp;
  $("fb").hidden = false;
  const last = G.i === G.pool.length-1 || G.lives === 0;
  $("next").textContent = last ? t.toResult : t.next; $("next").hidden = false; $("next").focus({ preventScroll:true });
  renderHUD(); renderTrack(); save();
}
$("next").onclick = () => { if (G.i === G.pool.length-1 || G.lives === 0) finish(); else { G.i++; renderQ(); $("qText").scrollIntoView({ block:"nearest" }); } };
$("quit").onclick = () => { renderHome(); show("home"); };

function finish(){
  const t = T(), n = G.pool.length, pct = G.right/n, stars = pct >= .9 ? 3 : pct >= .7 ? 2 : pct >= .5 ? 1 : 0;
  S.xp += G.xp; touchDay(); award("first", G.newB);
  if (G.right === n && n >= 10) award("perfect", G.newB);
  if (LINE_ORDER.includes(G.mode)) {
    const key = G.mode === "canton" ? `canton-${S.canton}` : G.mode;
    S.best[key] = Math.max(S.best[key] || 0, stars);
    if (!S.lines.includes(G.mode)) S.lines.push(G.mode);
    if (S.lines.length === 4) award("all", G.newB);
  }
  if (G.mode === "wrong" && wrongIds().length === 0 && S.hadWrong) award("clean", G.newB);
  save();
  $("rLine").textContent = LINE_ORDER.includes(G.mode) ? lineName(G.mode) : G.mode === "mix" ? t.exLine : t.wrongLine;
  $("rStars").innerHTML = [1,2,3].map(i => ICON.star(i <= stars)).join("");
  [...$("rStars").children].forEach((s,i) => s.style.animationDelay = (i*.18) + "s");
  $("rTitle").textContent = G.lives === 0 ? t.rOver : t.rTitles[stars];
  $("rSub").textContent = G.lives === 0 ? t.rSubOver : stars === 3 ? t.rSub3 : t.rSub;
  $("rScore").textContent = `${G.right}/${n}`; $("rXp").textContent = "+" + G.xp; $("rCombo").textContent = G.bestStreak;
  [$("rS1").textContent, $("rS2").textContent, $("rS3").textContent] = t.stats;
  $("rBadges").innerHTML = ""; G.newB.forEach(b => { const s = document.createElement("span"); s.textContent = `${t.newBadge}: ${b}`; $("rBadges").appendChild(s); });
  $("again").textContent = t.again; $("home2").textContent = t.quit;
  show("result");
  if (stars >= 2 || G.newB.length) { sWin(); buzz("win"); confetti(stars === 3 ? 140 : 70, .3); }
}
$("again").onclick = () => start(G.mode === "wrong" && !wrongIds().length ? "mix" : G.mode);
$("home2").onclick = () => { renderHome(); show("home"); };

// ---------- interview cards ----------
let C = null;
function startCards(){ C = { deck:shuffle(POOL), i:0, done:0 }; const t = T();
  $("cTitle").textContent = t.interview[0]; $("cSay").textContent = t.sayAloud; $("cAnsT").textContent = t.answer;
  $("reveal").textContent = t.reveal; $("gNo").textContent = t.againCard; $("gYes").textContent = t.knew;
  show("cards"); renderCard(); }
function renderCard(){
  if (C.i >= C.deck.length) { C.i = 0; C.deck = shuffle(POOL); }
  const q = C.deck[C.i];
  $("cTopic").textContent = lineName(q.cat); $("cTopic").style.color = `var(${LINE_COLOR[q.cat]})`;
  $("cText").textContent = q.q; $("cEn").textContent = S.enHelp ? q.enQ : ""; $("cA").textContent = q.a[0]; $("cX").textContent = q.x;
  $("cXen").textContent = S.enHelp ? q.enX : "";
  $("cAns").hidden = true; $("grade").hidden = true; $("reveal").hidden = false;
  $("cCount").textContent = T().cardCount(C.done, S.cards);
}
$("reveal").onclick = () => { $("cAns").hidden = false; $("grade").hidden = false; $("reveal").hidden = true; };
function grade(ok){
  const q = C.deck[C.i]; C.done++; S.cards++; touchDay();
  if (ok) { S.wrong = S.wrong.filter(id => id !== q.id); S.xp += 5; sGood(); buzz("good"); popText("+5 XP"); }
  else { if (!S.wrong.includes(q.id)) S.wrong.push(q.id); S.hadWrong = true; tone([330],.08); }
  if (S.cards >= 20 && !S.badges.includes("talk")) { award("talk"); confetti(80,.3); popText(T().badges.talk[0]); }
  save(); C.i++; renderCard();
}
$("gYes").onclick = () => grade(true); $("gNo").onclick = () => grade(false);
$("quit2").onclick = () => { renderHome(); show("home"); };

addEventListener("keydown", e => {
  if (!$("play").hidden) {
    if (!G.answered && /^[1-4]$/.test(e.key)) { const b = $("opts").children[+e.key-1]; b && answer(b); }
    else if (G.answered && e.key === "Enter" && document.activeElement !== $("next")) $("next").click();
  } else if (!$("cards").hidden && e.key === " " && !$("reveal").hidden) { e.preventDefault(); $("reveal").click(); }
});

// ---------- daily reminder (native only) ----------
const REM_ID = 1;
function renderReminder(){
  if (!NATIVE) return;
  const t = T();
  $("remRow").hidden = false; $("remT").textContent = t.rem; $("remTimeT").textContent = t.remTime;
  if (!$("remNote").dataset.err) $("remNote").textContent = S.reminder.on ? t.remDaily(S.reminder.time) : t.remP;
  $("remToggle").setAttribute("aria-checked", S.reminder.on ? "true" : "false");
  $("remTimeRow").hidden = !S.reminder.on; $("remTime").value = S.reminder.time;
}
async function scheduleReminder(){
  const t = T(); delete $("remNote").dataset.err;
  try {
    await LocalNotifications.cancel({ notifications:[{ id:REM_ID }] });
    if (!S.reminder.on) return;
    let p = await LocalNotifications.checkPermissions();
    if (p.display !== "granted") p = await LocalNotifications.requestPermissions();
    if (p.display !== "granted") { S.reminder.on = false; save(); $("remNote").dataset.err = 1; $("remNote").textContent = t.remBlocked; return; }
    const [hour, minute] = S.reminder.time.split(":").map(Number);
    await LocalNotifications.schedule({ notifications:[{ id:REM_ID, title:"Swiss Bürgerquiz",
      body:t.remLines[Math.floor(Math.random()*t.remLines.length)], schedule:{ on:{ hour, minute }, allowWhileIdle:true } }] });
  } catch(e) { $("remNote").dataset.err = 1; $("remNote").textContent = t.remFail; }
}
$("remToggle").onclick = async () => { S.reminder.on = !S.reminder.on; save(); await scheduleReminder(); renderReminder(); };
$("remTime").onchange = async e => { S.reminder.time = e.target.value || "19:00"; save(); await scheduleReminder(); renderReminder(); };
if (NATIVE) LocalNotifications.addListener("localNotificationActionPerformed", () => { renderHome(); show("home"); }).catch(()=>{});

// ---------- boot ----------
async function boot(){
  await load();
  if (!S.lang) S.lang = guessLang();
  if (S.canton && canton()) { POOL = buildPool(); renderHome(); show("home"); }
  else { renderOnb(); show("onb"); }
  if (NATIVE) {
    StatusBar.setStyle({ style:Style.Default }).catch(()=>{});
    if (S.reminder.on) scheduleReminder();
    SplashScreen.hide().catch(()=>{});
  }
}
boot();
