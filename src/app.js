import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

// Correct answer is always a[0]; options are shuffled when shown.
const LINES = {
  1:{name:"Schweiz", sub:"Bund, Parlament, Geografie"},
  2:{name:"Basel-Stadt", sub:"Kanton, Gemeinden, Gerichte"},
  3:{name:"Stadt & Bräuche", sub:"Bürgergemeinde, Fasnacht, Vogel Gryff"},
  4:{name:"Geschichte & Rechte", sub:"Jahreszahlen, Initiative, Referendum"}
};
const Q = [
// Linie 1 Schweiz
{id:"ch1",l:1,q:"Wie viele Einwohnerinnen und Einwohner hat die Schweiz ungefähr?",en:"Roughly how many people live in Switzerland?",a:["ca. 9 Millionen","ca. 6 Millionen","ca. 12 Millionen","ca. 15 Millionen"],x:"Switzerland passed 9 million inhabitants in 2023. Its area is about 41,285 km²."},
{id:"ch2",l:1,q:"Welches sind die vier Landessprachen?",en:"What are the four national languages?",a:["Deutsch, Französisch, Italienisch, Rätoromanisch","Deutsch, Französisch, Italienisch, Englisch","Deutsch, Französisch, Rätoromanisch, Schweizerdeutsch","Deutsch, Französisch, Italienisch, Latein"],x:"German, French, Italian and Romansh. Basel is German-speaking."},
{id:"ch3",l:1,q:"Welches Land grenzt NICHT an die Schweiz?",en:"Which country does NOT border Switzerland?",a:["Belgien","Liechtenstein","Österreich","Frankreich"],x:"The five neighbours are Germany, France, Italy, Austria and Liechtenstein."},
{id:"ch4",l:1,q:"Wie viele Mitglieder hat der Nationalrat?",en:"How many members does the National Council have?",a:["200","246","100","46"],x:"200 seats, divided among the cantons by population. Together with the 46 Council of States members that makes 246."},
{id:"ch5",l:1,q:"Wie viele Mitglieder hat der Ständerat?",en:"How many members does the Council of States have?",a:["46","26","50","200"],x:"Two per canton, one for each of the six former half-cantons such as Basel-Stadt: 20×2 + 6×1 = 46."},
{id:"ch6",l:1,q:"Wer wählt die Mitglieder des Bundesrates?",en:"Who elects the members of the Federal Council?",a:["Die Vereinigte Bundesversammlung","Das Volk direkt","Der Ständerat allein","Die Kantonsregierungen"],x:"The United Federal Assembly (both chambers together, 246 members). It also elects federal judges, the Federal Chancellor and the Attorney General."},
{id:"ch7",l:1,q:"Wo hat das Bundesgericht seinen Sitz?",en:"Where is the Federal Supreme Court?",a:["Lausanne","Bern","Zürich","Bellinzona"],x:"Lausanne, with a branch in Lucerne. Federal Criminal Court: Bellinzona. Federal Administrative and Patent Courts: St. Gallen."},
{id:"ch8",l:1,q:"Wo befindet sich das Bundesstrafgericht?",en:"Where is the Federal Criminal Court?",a:["Bellinzona","St. Gallen","Lausanne","Luzern"],x:"Bellinzona, Ticino."},
{id:"ch9",l:1,q:"Welchen See teilt die Schweiz mit Italien?",en:"Which lake does Switzerland share with Italy?",a:["Lago Maggiore","Bodensee","Genfersee","Zürichsee"],x:"Lago Maggiore and Lake Lugano with Italy, Lake Geneva with France, Lake Constance with Germany and Austria."},
{id:"ch10",l:1,q:"Wie heisst der höchste Berg der Schweiz?",en:"What is Switzerland's highest mountain?",a:["Dufourspitze","Matterhorn","Jungfrau","Eiger"],x:"The Dufourspitze in Valais, 4,634 m."},
{id:"ch11",l:1,q:"Wie viele Mitglieder hat der Bundesrat?",en:"How many members does the Federal Council have?",a:["7","5","9","11"],x:"Seven, each heading a department. The presidency rotates every year."},
{id:"ch12",l:1,cur:1,q:"Wer ist Bundespräsident im Jahr 2026?",en:"Who is Federal President in 2026?",a:["Guy Parmelin","Karin Keller-Sutter","Ignazio Cassis","Beat Jans"],x:"Guy Parmelin (SVP, Vaud), elected 10 Dec 2025. He has announced he will leave the Federal Council at the end of 2026. Check who is president for 2027 before your interview."},
{id:"ch13",l:1,cur:1,q:"Welches Bundesratsmitglied kommt aus Basel-Stadt?",en:"Which Federal Councillor comes from Basel-Stadt?",a:["Beat Jans","Albert Rösti","Martin Pfister","Ignazio Cassis"],x:"Beat Jans (SP) heads the Federal Department of Justice and Police since 2024. He was previously Regierungspräsident of Basel-Stadt."},
// Linie 2 Basel-Stadt
{id:"bs1",l:2,q:"Wie viele Kantone hat die Schweiz?",en:"How many cantons does Switzerland have?",a:["26","23","20","28"],x:"26 cantons, six of them former half-cantons, including Basel-Stadt and Basel-Landschaft."},
{id:"bs2",l:2,q:"Welche drei Gemeinden bilden den Kanton Basel-Stadt?",en:"Which three communes form the canton?",a:["Basel, Riehen, Bettingen","Basel, Riehen, Allschwil","Basel, Liestal, Riehen","Basel, Birsfelden, Bettingen"],x:"Basel, Riehen and Bettingen. Allschwil, Birsfelden and Liestal are in Basel-Landschaft."},
{id:"bs3",l:2,q:"Wo liegt der höchste Punkt des Kantons?",en:"Where is the canton's highest point?",a:["St. Chrischona in Bettingen","Münsterhügel","Bruderholz","Tüllinger Hügel"],x:"St. Chrischona, about 522 m, in Bettingen. The Tüllinger Hügel is across the border in Germany."},
{id:"bs4",l:2,q:"Welche Flüsse fliessen durch Basel?",en:"Which rivers flow through Basel?",a:["Rhein, Birs und Wiese","Rhein, Aare und Reuss","Rhein, Limmat und Birs","Rhein, Rhone und Wiese"],x:"Rhine, Birs and Wiese. The Birsig runs mostly underground through the old town."},
{id:"bs5",l:2,q:"An welche Länder grenzt der Kanton Basel-Stadt?",en:"Which countries border the canton?",a:["Deutschland und Frankreich","Frankreich und Italien","Deutschland und Österreich","Nur Deutschland"],x:"Germany and France. The Dreiländereck is at the Rhine port in Kleinhüningen."},
{id:"bs6",l:2,q:"Wie viele Mitglieder hat der Grosse Rat?",en:"How many members does the cantonal parliament have?",a:["100","120","60","200"],x:"The Grosser Rat (legislative) has 100 members. Because the city has no own government, it also acts as the city parliament."},
{id:"bs7",l:2,q:"Wie viele Mitglieder hat der Regierungsrat?",en:"How many members does the cantonal government have?",a:["7","5","9","3"],x:"Seven, each leading a department. The President heads the Präsidialdepartement."},
{id:"bs8",l:2,q:"Wo tagen der Grosse Rat und der Regierungsrat?",en:"Where do parliament and government meet?",a:["Im Rathaus am Marktplatz","Im Stadthaus","Im Spiegelhof","Im Kunstmuseum"],x:"The red Rathaus on the Marktplatz. The Stadthaus is home of the Bürgergemeinde."},
{id:"bs9",l:2,q:"Was ist das höchste Gericht im Kanton Basel-Stadt?",en:"What is the highest cantonal court?",a:["Das Appellationsgericht","Das Zivilgericht","Das Strafgericht","Das Bundesgericht"],x:"The Appellationsgericht. If you lose there, you can go to the Federal Supreme Court in Lausanne."},
{id:"bs10",l:2,cur:1,q:"Wer vertritt Basel-Stadt im Ständerat?",en:"Who represents Basel-Stadt in the Council of States?",a:["Eva Herzog","Beat Jans","Conradin Cramer","Tanja Soland"],x:"Eva Herzog (SP). As a former half-canton Basel-Stadt has one seat."},
{id:"bs11",l:2,cur:1,q:"Wie viele Sitze hat Basel-Stadt im Nationalrat?",en:"How many National Council seats does Basel-Stadt have?",a:["4","5","2","7"],x:"Four since the 2023 elections (previously five). Learn the names of the current members."},
{id:"bs12",l:2,cur:1,q:"Wer ist Regierungspräsident von Basel-Stadt?",en:"Who is President of the Basel government?",a:["Conradin Cramer","Lukas Engelberger","Esther Keller","Kaspar Sutter"],x:"Conradin Cramer (LDP). Learn all seven members and their departments."},
// Linie 3 Stadt & Bräuche
{id:"st1",l:3,q:"Wie heisst die Exekutive der Bürgergemeinde Basel?",en:"What is the executive of the Bürgergemeinde called?",a:["Bürgerrat","Regierungsrat","Bürgergemeinderat","Stadtrat"],x:"The Bürgerrat is the executive. The Bürgergemeinderat is its parliament."},
{id:"st2",l:3,q:"Wie heisst das Parlament der Bürgergemeinde?",en:"What is the Bürgergemeinde's parliament called?",a:["Bürgergemeinderat","Grosser Rat","Bürgerrat","Einwohnerrat"],x:"The Bürgergemeinderat (40 members). Basel's Bürgergemeinde is one of few with its own parliament."},
{id:"st3",l:3,q:"Wo hat die Bürgergemeinde ihren Sitz?",en:"Where is the Bürgergemeinde based?",a:["Im Stadthaus","Im Rathaus","Im Spalentor","Im Messeturm"],x:"The Stadthaus on the Stadthausgasse. Your interview takes place there."},
{id:"st4",l:3,q:"Welche Aufgabe hat die Bürgergemeinde?",en:"What does the Bürgergemeinde do?",a:["Einbürgerungen und soziale Einrichtungen wie Bürgerspital und Waisenhaus","Steuern erheben","Die Polizei führen","Strassen bauen"],x:"Naturalisations, the Bürgerspital, the Waisenhaus, and supervising the Christoph Merian Stiftung."},
{id:"st5",l:3,q:"Wer war Christoph Merian?",en:"Who was Christoph Merian?",a:["Ein Basler, der sein Vermögen der Stadt vermachte","Der Gründer der Universität","Der erste Bundesrat aus Basel","Der Erfinder der Fasnacht"],x:"A 19th-century Basel landowner and philanthropist. His fortune funds the Christoph Merian Stiftung."},
{id:"st6",l:3,q:"Wer organisiert den Vogel Gryff?",en:"Who organises the Vogel Gryff?",a:["Die drei Ehrengesellschaften Kleinbasels","Die Zünfte Grossbasels","Das Fasnachts-Comité","Der Regierungsrat"],x:"The three Ehrengesellschaften zum Rebhaus, zur Hären and zum Greifen, all in Kleinbasel. The guilds (Zünfte) belong to Grossbasel."},
{id:"st7",l:3,q:"Wann findet der Vogel Gryff statt?",en:"When is the Vogel Gryff held?",a:["Im Januar","Im März","Am 1. August","Im Herbst"],x:"In January, on the 13th, 20th or 27th, depending on which Ehrengesellschaft leads that year."},
{id:"st8",l:3,q:"Welche drei Figuren treten am Vogel Gryff auf?",en:"Which three figures appear at Vogel Gryff?",a:["Vogel Gryff, Leu und Wild Maa","Bär, Adler und Löwe","Basilisk, Drache und Greif","Waggis, Harlekin und Pierrot"],x:"The griffin, the lion and the Wild Maa. The Wild Maa floats down the Rhine on a raft."},
{id:"st9",l:3,q:"Wann beginnt die Basler Fasnacht?",en:"When does Basel Fasnacht start?",a:["Am Montag nach Aschermittwoch um 4 Uhr","Am Aschermittwoch um Mitternacht","Am 11.11. um 11:11 Uhr","Am Fasnachtsdienstag um 20 Uhr"],x:"With the Morgestraich at 4 am on the Monday after Ash Wednesday. It lasts three days."},
{id:"st10",l:3,q:"Welche Branche ist für Basels Wirtschaft besonders wichtig?",en:"Which industry is key to Basel's economy?",a:["Pharma und Life Sciences","Uhrenindustrie","Bergtourismus","Schokoladenproduktion"],x:"Pharma (Roche, Novartis), plus the Messe (Art Basel) and logistics via the Rhine ports."},
{id:"st11",l:3,q:"Welches Gebäude am Marktplatz ist rot bemalt?",en:"Which building on the Marktplatz is painted red?",a:["Das Rathaus","Das Münster","Das Stadthaus","Der Spiegelhof"],x:"The Rathaus. The Münster is built from red sandstone too, but stands on the Münsterhügel."},
// Linie 4 Geschichte & Rechte
{id:"hi1",l:4,q:"Welches Jahr gilt als Gründung der Eidgenossenschaft?",en:"Which year is the Confederation's founding?",a:["1291","1848","1501","1833"],x:"1291, the Federal Charter of Uri, Schwyz and Unterwalden. National Day is 1 August."},
{id:"hi2",l:4,q:"Wann trat Basel der Eidgenossenschaft bei?",en:"When did Basel join the Confederation?",a:["1501","1291","1648","1815"],x:"1501, as the 11th member."},
{id:"hi3",l:4,q:"Wann wurde der Kanton Basel geteilt?",en:"When was the canton of Basel split?",a:["1833","1798","1848","1919"],x:"1833, into Basel-Stadt and Basel-Landschaft after conflicts between city and countryside."},
{id:"hi4",l:4,q:"Seit wann gibt es den modernen Bundesstaat?",en:"Since when does the modern federal state exist?",a:["1848","1291","1648","1971"],x:"1848, with the first federal constitution. The two-chamber parliament dates from then."},
{id:"hi5",l:4,q:"Wann wurde das Frauenstimmrecht auf Bundesebene eingeführt?",en:"When did women get the vote nationally?",a:["1971","1919","1959","1990"],x:"1971. Basel-Stadt introduced it at cantonal level in 1966, as the first German-speaking canton."},
{id:"hi6",l:4,q:"Welches Ereignis zerstörte Basel im Jahr 1356?",en:"What destroyed Basel in 1356?",a:["Ein schweres Erdbeben","Eine Rheinflut","Ein Krieg mit Frankreich","Die Pest"],x:"The Basel earthquake of 1356, the strongest recorded in Central Europe. Fires then destroyed much of the city."},
{id:"hi7",l:4,q:"Wann wurde die Universität Basel gegründet?",en:"When was the University of Basel founded?",a:["1460","1291","1833","1910"],x:"1460. It is the oldest university in Switzerland. Basel received its fair privilege (Messe) in 1471."},
{id:"hi8",l:4,q:"Welche römische Stadt lag in der Nähe von Basel?",en:"Which Roman town lay near Basel?",a:["Augusta Raurica","Aventicum","Vindonissa","Turicum"],x:"Augusta Raurica near Augst. Celts (Rauraci) lived on the Münsterhügel before the Romans."},
{id:"hi9",l:4,q:"Wie viele Unterschriften braucht eine eidgenössische Volksinitiative?",en:"How many signatures does a federal popular initiative need?",a:["100'000 in 18 Monaten","50'000 in 100 Tagen","10'000 in 1 Jahr","200'000 in 6 Monaten"],x:"100,000 valid signatures within 18 months. It proposes a change to the Federal Constitution."},
{id:"hi10",l:4,q:"Wie viele Unterschriften braucht ein fakultatives Referendum?",en:"How many signatures does an optional referendum need?",a:["50'000 in 100 Tagen","100'000 in 18 Monaten","5'000 in 30 Tagen","8 Kantone und 100'000"],x:"50,000 signatures (or 8 cantons) within 100 days of the law's publication."},
{id:"hi11",l:4,q:"Was ist der Unterschied zwischen Initiative und Referendum?",en:"Difference between initiative and referendum?",a:["Die Initiative schlägt etwas Neues vor, das Referendum bekämpft einen Parlamentsbeschluss","Es gibt keinen Unterschied","Das Referendum schlägt neue Gesetze vor, die Initiative stoppt sie","Die Initiative gilt nur für Kantone"],x:"Initiative: citizens propose a constitutional change. Referendum: citizens demand a vote on a law parliament has passed. Constitutional changes always go to a mandatory referendum."},
{id:"hi12",l:4,q:"Ab welchem Alter darf man in der Schweiz abstimmen und wählen?",en:"From what age can you vote in Switzerland?",a:["18","16","20","21"],x:"18 at federal level and in Basel-Stadt. Swiss citizens can vote, elect, sign initiatives and referendums, and stand for office."}
];
const STOPS=["Bahnhof SBB","Aeschenplatz","Bankverein","Kunstmuseum","Barfüsserplatz","Marktplatz","Schifflände","Rheingasse","Claraplatz","Messeplatz","Badischer Bahnhof","Theater","Heuwaage","Universitätsspital","Wettsteinplatz"];
const LEVELS=[[0,"Gast"],[100,"Neuzuzüger:in"],[300,"Quartierkenner:in"],[600,"Fasnächtler:in"],[1000,"Zunftmitglied"],[1600,"Basler Original"]];
const BADGES=[
 {id:"first",n:"Erste Fahrt",d:"Eine Runde beenden"},
 {id:"combo5",n:"Fünferserie",d:"5 richtig in Folge"},
 {id:"perfect",n:"Ohne Halt",d:"Runde ohne Fehler"},
 {id:"all",n:"Netzkarte",d:"Alle 4 Linien gefahren"},
 {id:"talk",n:"Redekunst",d:"20 Interviewkarten"},
 {id:"clean",n:"Zweite Chance",d:"Fehlerliste geleert"}
];
const ICON={
 heart:'<svg viewBox="0 0 24 24"><path fill="var(--signal)" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3 1.7-1.8 3.2-3 5.3-3 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>',
 star:(on)=>`<svg viewBox="0 0 24 24" class="${on?'on':''}"><path fill="${on?'var(--gold)':'var(--rule)'}" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>`,
 tram:'<svg viewBox="0 0 34 22"><rect x="1" y="3" width="32" height="15" rx="4" fill="var(--tram)"/><rect x="4" y="6" width="6" height="5" rx="1" fill="var(--card)"/><rect x="12" y="6" width="6" height="5" rx="1" fill="var(--card)"/><rect x="20" y="6" width="6" height="5" rx="1" fill="var(--card)"/><rect x="28" y="6" width="3" height="5" rx="1" fill="var(--gold)"/><circle cx="8" cy="19" r="2.2" fill="var(--ink)"/><circle cx="26" cy="19" r="2.2" fill="var(--ink)"/><path d="M17 3V0" stroke="var(--ink)" stroke-width="1.5"/></svg>',
 on:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
 off:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>',
 medal:(t)=>`<svg viewBox="0 0 40 40"><path d="M12 2h6l3 10h-6zM28 2h-6l-3 10h6z" fill="var(--l3)"/><circle cx="20" cy="25" r="13" fill="var(--gold)"/><circle cx="20" cy="25" r="9.5" fill="none" stroke="var(--card)" stroke-width="1.5" opacity=".7"/><text x="20" y="30" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="13" fill="#1a1300">${t}</text></svg>`
};

// ---- storage ----
let S={xp:0,best:{},wrong:[],badges:[],cards:0,lines:[],muted:false,hadWrong:false,dayStreak:0,lastDay:"",reminder:{on:false,time:"19:00"}};
// Native Preferences survive iOS WebView storage cleanup; localStorage is the browser fallback.
async function load(){
  let raw=null;
  try{raw=(await Preferences.get({key:"bbq"})).value}catch(e){}
  if(!raw){try{raw=localStorage.getItem("bbq")}catch(e){}}
  if(raw){try{S=Object.assign(S,JSON.parse(raw))}catch(e){}}
}
function save(){
  const raw=JSON.stringify(S);
  try{localStorage.setItem("bbq",raw)}catch(e){}
  Preferences.set({key:"bbq",value:raw}).catch(()=>{});
}
const NATIVE=Capacitor.isNativePlatform();
function buzz(kind){
  if(!NATIVE)return;
  if(kind==="good")Haptics.impact({style:ImpactStyle.Light}).catch(()=>{});
  else if(kind==="bad")Haptics.notification({type:NotificationType.Error}).catch(()=>{});
  else Haptics.notification({type:NotificationType.Success}).catch(()=>{});
}
// Daily streak: counts consecutive calendar days with at least one finished round or card.
const dayKey=d=>`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
function touchDay(){
  const today=dayKey(new Date());if(S.lastDay===today)return;
  const y=new Date();y.setDate(y.getDate()-1);
  S.dayStreak=S.lastDay===dayKey(y)?S.dayStreak+1:1;S.lastDay=today;
}
function liveStreak(){
  const t=new Date(),y=new Date();y.setDate(y.getDate()-1);
  return (S.lastDay===dayKey(t)||S.lastDay===dayKey(y))?S.dayStreak:0;
}

const $=id=>document.getElementById(id);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function show(id){["home","play","result","cards"].forEach(s=>$(s).hidden=s!==id);window.scrollTo(0,0)}

// ---- sound ----
let ac=null;
function tone(freqs,dur=.09,type="triangle"){
  if(S.muted)return;
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();
    freqs.forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;
      const t=ac.currentTime+i*dur;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.18,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur*1.6);
      o.connect(g).connect(ac.destination);o.start(t);o.stop(t+dur*1.8)})}catch(e){}
}
// tram bell for correct, low buzz for wrong
const sGood=()=>tone([988,1319],.08), sBad=()=>tone([196,165],.12,"sawtooth"), sWin=()=>tone([659,784,988,1319],.1);

// ---- confetti ----
const fx=$("fx"),cx=fx.getContext("2d");let parts=[],raf=0;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
function confetti(n=60,y=.4){
  if(reduce)return;
  fx.width=innerWidth*devicePixelRatio;fx.height=innerHeight*devicePixelRatio;
  const cs=getComputedStyle(document.documentElement);
  const cols=["--gold","--tram","--signal","--l3"].map(c=>cs.getPropertyValue(c).trim());
  for(let i=0;i<n;i++)parts.push({x:innerWidth/2,y:innerHeight*y,vx:(Math.random()-.5)*12,vy:-Math.random()*12-4,r:Math.random()*6+4,c:cols[i%4],a:Math.random()*6,va:(Math.random()-.5)*.4,life:90+Math.random()*40});
  if(!raf)loop();
}
function loop(){
  cx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);cx.clearRect(0,0,innerWidth,innerHeight);
  parts.forEach(p=>{p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.vx*=.99;p.a+=p.va;p.life--;
    cx.save();cx.translate(p.x,p.y);cx.rotate(p.a);cx.fillStyle=p.c;cx.globalAlpha=Math.min(1,p.life/30);cx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);cx.restore()});
  parts=parts.filter(p=>p.life>0&&p.y<innerHeight+40);
  raf=parts.length?requestAnimationFrame(loop):(cx.clearRect(0,0,innerWidth,innerHeight),0);
}
function popText(t){const d=document.createElement("div");d.className="pop";d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),900)}

// ---- home ----
function levelInfo(xp){let i=0;while(i<LEVELS.length-1&&xp>=LEVELS[i+1][0])i++;
  const cur=LEVELS[i],nx=LEVELS[i+1];return{name:cur[1],pct:nx?(xp-cur[0])/(nx[0]-cur[0])*100:100,next:nx}}
function award(id,list){if(!S.badges.includes(id)){S.badges.push(id);list&&list.push(BADGES.find(b=>b.id===id).n)}}
function renderHome(){
  const L=levelInfo(S.xp);
  $("xpTotal").textContent=S.xp+" XP";$("lvlName").textContent=L.name;$("lvlBar").style.width=L.pct+"%";
  $("lvlNext").textContent=L.next?`Noch ${L.next[0]-S.xp} XP bis „${L.next[1]}“`:"Höchster Rang erreicht. Du bist bereit für das Stadthaus.";
  $("lines").innerHTML="";
  for(const k of [1,2,3,4]){const b=document.createElement("button");b.className="linecard";b.style.setProperty("--lc",`var(--l${k})`);
    const n=Q.filter(q=>q.l===k).length,st=S.best[k]||0;
    b.innerHTML=`<div class="lnum">${k}</div><h3>${LINES[k].name}</h3><small>${LINES[k].sub} · ${n} Fragen</small><div class="stars">${[1,2,3].map(i=>ICON.star(i<=st)).join("")}</div>`;
    b.onclick=()=>start(k);$("lines").appendChild(b)}
  const w=S.wrong.length;$("wrongCount").textContent=w?`${w} Frage${w>1?"n":""} zum Wiederholen`:"Keine Fehler gespeichert";$("mWrong").disabled=!w;
  $("badges").innerHTML=BADGES.map(b=>`<div class="badge ${S.badges.includes(b.id)?"on":""}">${ICON.medal(b.n[0])}<b>${b.n}</b><small>${b.d}</small></div>`).join("");
  $("mute").innerHTML=S.muted?ICON.off:ICON.on;
  const ds=liveStreak();
  $("dayStreak").innerHTML=ds?`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 5 5.5 5 10.5A5 5 0 0 1 7 12.5c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9z"/></svg>${ds} Tag${ds>1?"e":""}`:"";
  renderReminder();
}
$("mute").onclick=()=>{S.muted=!S.muted;save();renderHome()};
$("mMix").onclick=()=>start("mix");$("mWrong").onclick=()=>start("wrong");$("mCards").onclick=startCards;

// ---- game ----
let G=null;
function start(mode){
  let pool;
  if(mode==="mix")pool=shuffle(Q).slice(0,15);
  else if(mode==="wrong")pool=shuffle(Q.filter(q=>S.wrong.includes(q.id))).slice(0,15);
  else pool=shuffle(Q.filter(q=>q.l===mode)).slice(0,12);
  const off=Math.floor(Math.random()*STOPS.length);
  G={mode,pool,i:0,lives:3,streak:0,bestStreak:0,xp:0,right:0,marks:[],stops:pool.map((_,i)=>STOPS[(off+i)%STOPS.length]),answered:false,newB:[]};
  show("play");renderQ();
}
function renderHUD(){
  $("hearts").innerHTML=[0,1,2].map(i=>`<span class="${i<G.lives?"":"lost"}">${ICON.heart}</span>`).join("");
  const m=mult();$("combo").textContent=`×${m} · Serie ${G.streak}`;$("combo").classList.toggle("hot",m>1);
  $("xpRound").textContent=G.xp+" XP";
}
const mult=()=>G.streak>=6?3:G.streak>=3?2:1;
function renderTrack(){
  const n=G.pool.length,pos=i=>n>1?i/(n-1)*100:50;
  let h=`<div class="rail"></div><div class="done" style="width:${pos(G.i)}%"></div>`;
  for(let i=0;i<n;i++)h+=`<div class="stop ${G.marks[i]||""}" style="left:${pos(i)}%"></div>`;
  h+=`<div class="tram" style="left:${pos(G.i)}%">${ICON.tram}</div>`;
  $("track").innerHTML=h;
}
function renderQ(){
  const q=G.pool[G.i];G.answered=false;
  renderHUD();renderTrack();
  $("stopName").textContent=G.stops[G.i];$("qPos").textContent=`${G.i+1}/${G.pool.length}`;
  $("qTopic").textContent=`Linie ${q.l} · ${LINES[q.l].name}`;$("qTopic").style.color=`var(--l${q.l})`;
  $("qText").textContent=q.q;$("qEn").textContent=q.en;$("qCur").hidden=!q.cur;
  $("opts").innerHTML="";
  shuffle(q.a).forEach((t,k)=>{const b=document.createElement("button");b.className="opt";b.dataset.ok=t===q.a[0]?1:0;
    b.innerHTML=`<span class="k">${k+1}</span><span></span>`;b.lastChild.textContent=t;b.onclick=()=>answer(b);$("opts").appendChild(b)});
  $("fb").hidden=true;$("next").hidden=true;
}
function answer(btn){
  if(G.answered)return;G.answered=true;
  const q=G.pool[G.i],ok=btn.dataset.ok==="1";
  [...$("opts").children].forEach(b=>{b.disabled=true;if(b.dataset.ok==="1")b.classList.add("right");else if(b!==btn)b.classList.add("dim")});
  if(ok){
    G.streak++;G.bestStreak=Math.max(G.bestStreak,G.streak);G.right++;const gain=10*mult();G.xp+=gain;G.marks[G.i]="ok";
    S.wrong=S.wrong.filter(id=>id!==q.id);
    sGood();buzz("good");popText("+"+gain+" XP");if(G.streak===3||G.streak===6)confetti(30,.35);
    if(G.streak>=5)award("combo5",G.newB);
    $("fbH").textContent=G.streak>=3?`Richtig! Serie ${G.streak}`:"Richtig!";$("fb").className="fb ok";
  }else{
    btn.classList.add("wrong");G.streak=0;G.lives--;G.marks[G.i]="no";
    if(!S.wrong.includes(q.id))S.wrong.push(q.id);S.hadWrong=true;
    sBad();buzz("bad");
    $("fbH").textContent=G.lives?"Nicht ganz.":"Endstation! Keine Leben mehr.";$("fb").className="fb no";
  }
  $("fbX").textContent=q.x;$("fb").hidden=false;
  const last=G.i===G.pool.length-1||G.lives===0;
  $("next").textContent=last?"Zum Ergebnis":"Nächster Halt";$("next").hidden=false;$("next").focus({preventScroll:true});
  renderHUD();renderTrack();save();
}
$("next").onclick=()=>{if(G.i===G.pool.length-1||G.lives===0)finish();else{G.i++;renderQ();$("qText").scrollIntoView({block:"nearest"})}};
$("quit").onclick=()=>{renderHome();show("home")};

function finish(){
  const n=G.pool.length,pct=G.right/n,stars=pct>=.9?3:pct>=.7?2:pct>=.5?1:0;
  S.xp+=G.xp;touchDay();award("first",G.newB);
  if(G.right===n&&n>=10)award("perfect",G.newB);
  if(typeof G.mode==="number"){S.best[G.mode]=Math.max(S.best[G.mode]||0,stars);if(!S.lines.includes(G.mode))S.lines.push(G.mode);if(S.lines.length===4)award("all",G.newB)}
  if(G.mode==="wrong"&&S.wrong.length===0&&S.hadWrong)award("clean",G.newB);
  save();
  $("rLine").textContent=typeof G.mode==="number"?`Linie ${G.mode} · ${LINES[G.mode].name}`:G.mode==="mix"?"Express · alle Themen":"Fehler wiederholen";
  $("rStars").innerHTML=[1,2,3].map(i=>ICON.star(i<=stars)).join("");
  [...$("rStars").children].forEach((s,i)=>s.style.animationDelay=(i*.18)+"s");
  $("rTitle").textContent=G.lives===0?"Endstation":["Weiter üben","Gute Fahrt","Stark!","Perfekt!"][stars];
  $("rSub").textContent=G.lives===0?"Alle drei Leben aufgebraucht. Deine Fehler warten im Wiederholungsmodus.":stars===3?"Diese Linie sitzt. Versuche die Antworten jetzt im Interview-Training laut zu sagen.":"Falsch beantwortete Fragen sind gespeichert. Wiederhole sie, bis die Liste leer ist.";
  $("rScore").textContent=`${G.right}/${n}`;$("rXp").textContent="+"+G.xp;$("rCombo").textContent=G.bestStreak;
  $("rBadges").innerHTML=G.newB.map(b=>`<span>Neues Abzeichen: ${b}</span>`).join("");
  show("result");
  if(stars>=2||G.newB.length){sWin();buzz("win");confetti(stars===3?140:70,.3)}
}
$("again").onclick=()=>start(G.mode==="wrong"&&!S.wrong.length?"mix":G.mode);
$("home2").onclick=()=>{renderHome();show("home")};

// ---- interview cards ----
let C=null;
function startCards(){C={deck:shuffle(Q),i:0,done:0};show("cards");renderCard()}
function renderCard(){
  if(C.i>=C.deck.length)C.i=0,C.deck=shuffle(Q);
  const q=C.deck[C.i];
  $("cTopic").textContent=`Linie ${q.l} · ${LINES[q.l].name}`;$("cTopic").style.color=`var(--l${q.l})`;
  $("cText").textContent=q.q;$("cEn").textContent=q.en;$("cA").textContent=q.a[0];$("cX").textContent=q.x;
  $("cAns").hidden=true;$("grade").hidden=true;$("reveal").hidden=false;
  $("cCount").textContent=`${C.done} geübt · gesamt ${S.cards}`;
}
$("reveal").onclick=()=>{$("cAns").hidden=false;$("grade").hidden=false;$("reveal").hidden=true};
function grade(ok){
  const q=C.deck[C.i];C.done++;S.cards++;touchDay();
  if(ok){S.wrong=S.wrong.filter(id=>id!==q.id);S.xp+=5;sGood();popText("+5 XP")}
  else{if(!S.wrong.includes(q.id))S.wrong.push(q.id);S.hadWrong=true;tone([330],.08)}
  if(S.cards>=20&&!S.badges.includes("talk")){award("talk");confetti(80,.3);popText("Redekunst!")}
  save();C.i++;renderCard();
}
$("gYes").onclick=()=>grade(true);$("gNo").onclick=()=>grade(false);
$("quit2").onclick=()=>{renderHome();show("home")};

// keyboard: 1-4 answer, Enter/Space continue
addEventListener("keydown",e=>{
  if(!$("play").hidden){
    if(!G.answered&&/^[1-4]$/.test(e.key)){const b=$("opts").children[+e.key-1];b&&answer(b)}
    else if(G.answered&&e.key==="Enter"&&document.activeElement!==$("next")){$("next").click()}
  }else if(!$("cards").hidden){
    if(e.key===" "&&!$("reveal").hidden){e.preventDefault();$("reveal").click()}
  }
});

// ---- daily reminder (native only) ----
const REM_ID=1;
const REM_LINES=["Eine Runde bis zum Marktplatz? Deine Tagesserie wartet.","5 Minuten für die Einbürgerungskommission: heute schon geübt?","Morgestraich, Rathaus, Ständerat: kurz wiederholen?"];
function renderReminder(){
  if(!NATIVE)return;
  $("settings").hidden=false;
  $("remToggle").setAttribute("aria-checked",S.reminder.on?"true":"false");
  $("remTimeRow").hidden=!S.reminder.on;
  $("remTime").value=S.reminder.time;
}
async function scheduleReminder(){
  try{
    await LocalNotifications.cancel({notifications:[{id:REM_ID}]});
    if(!S.reminder.on)return true;
    let p=await LocalNotifications.checkPermissions();
    if(p.display!=="granted")p=await LocalNotifications.requestPermissions();
    if(p.display!=="granted"){
      S.reminder.on=false;save();
      $("remNote").textContent="Mitteilungen sind blockiert. Erlaube sie in den Einstellungen deines Telefons.";
      return false;
    }
    const [hour,minute]=S.reminder.time.split(":").map(Number);
    await LocalNotifications.schedule({notifications:[{
      id:REM_ID,title:"Swiss Bürgerquiz",
      body:REM_LINES[Math.floor(Math.random()*REM_LINES.length)],
      schedule:{on:{hour,minute},allowWhileIdle:true}
    }]});
    $("remNote").textContent=`Jeden Tag um ${S.reminder.time} Uhr`;
    return true;
  }catch(e){$("remNote").textContent="Erinnerung konnte nicht geplant werden.";return false}
}
$("remToggle").onclick=async()=>{S.reminder.on=!S.reminder.on;save();await scheduleReminder();renderReminder()};
$("remTime").onchange=async e=>{S.reminder.time=e.target.value||"19:00";save();await scheduleReminder()};
LocalNotifications.addListener?.("localNotificationActionPerformed",()=>{renderHome();show("home")}).catch?.(()=>{});

async function boot(){
  await load();
  renderHome();
  if(NATIVE){
    StatusBar.setStyle({style:Style.Default}).catch(()=>{});
    if(S.reminder.on){scheduleReminder()}
    SplashScreen.hide().catch(()=>{});
  }
}

boot();
