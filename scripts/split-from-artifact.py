"""One-off: turn the published artifact page into src/index.html + src/app.js for Capacitor."""
import re, sys

src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()

def rep(text, old, new, count=1):
    assert old in text, f"missing: {old[:60]!r}"
    return text.replace(old, new, count)

script = re.search(r"<script>(.*)</script>", s, re.S).group(1)
markup = s[: s.index("<script>")]
style = re.search(r"<style>(.*?)</style>", markup, re.S).group(1)
body = markup[markup.index("</style>") + len("</style>"):]

# ---------- CSS ----------
style = rep(style, "padding-block:20px 40px}",
            "padding-top:calc(20px + env(safe-area-inset-top, 0px));padding-bottom:calc(40px + env(safe-area-inset-bottom, 0px))}")
style = rep(style, "html,body{min-height:100%}",
            "html,body{min-height:100%;-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%}\n"
            "body{-webkit-user-select:none;user-select:none;overscroll-behavior-y:none}")
style = "[hidden]{display:none!important}\nbody{margin:0}\n" + style
style += """
/* app-only additions */
.daystreak{display:inline-flex;align-items:center;gap:6px;font-family:var(--f-mono);font-weight:700;font-size:14px;color:var(--l4)}
.daystreak svg{width:18px;height:18px}
.settings{background:var(--card);border:2px solid var(--rule);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:12px}
.setrow{display:flex;align-items:center;justify-content:space-between;gap:12px}
.setrow b{display:block;font-size:16px}
.setrow span{color:var(--muted);font-size:14px}
.switch{position:relative;width:52px;height:30px;flex:none;border-radius:99px;border:none;background:var(--rule);transition:background .2s}
.switch::after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:var(--card);transition:transform .2s}
.switch[aria-checked="true"]{background:var(--tram)}
.switch[aria-checked="true"]::after{transform:translateX(22px)}
input[type="time"]{font:inherit;font-family:var(--f-mono);font-size:16px;color:var(--ink);background:var(--sunk);border:2px solid var(--rule);border-radius:10px;padding:6px 10px}
details.about{background:var(--card);border:2px solid var(--rule);border-radius:16px;padding:14px}
details.about summary{cursor:pointer;font-weight:600;list-style:none;display:flex;justify-content:space-between}
details.about summary::after{content:"+";font-family:var(--f-mono);color:var(--muted)}
details.about[open] summary::after{content:"–"}
details.about h3{font-size:16px;margin-top:14px}
details.about p{font-size:14px;color:var(--muted);margin:6px 0 0;-webkit-user-select:text;user-select:text}
"""

# ---------- markup ----------
body = rep(body,
    '<div class="level-row"><span class="eyebrow">Dein Rang</span><span class="mono" id="xpTotal"></span></div>',
    '<div class="level-row"><span class="eyebrow">Dein Rang</span><span class="daystreak" id="dayStreak"></span><span class="mono" id="xpTotal"></span></div>')

settings_and_about = '''
  <div class="settings" id="settings" hidden>
    <div class="setrow">
      <div><b>Tägliche Erinnerung</b><span id="remNote">Ein kurzer Hinweis, damit deine Tagesserie hält</span></div>
      <button class="switch" id="remToggle" role="switch" aria-checked="false" aria-label="Tägliche Erinnerung"></button>
    </div>
    <div class="setrow" id="remTimeRow" hidden>
      <span>Uhrzeit</span>
      <input type="time" id="remTime" value="19:00">
    </div>
  </div>

  <details class="about">
    <summary>Über die App &amp; Datenschutz</summary>
    <h3>Inoffizielle Lernhilfe</h3>
    <p>Diese App ist ein privates Lernangebot. Sie ist nicht mit der Bürgergemeinde der Stadt Basel, dem Kanton Basel-Stadt oder einer anderen Behörde verbunden und ersetzt keine offizielle Auskunft.</p>
    <h3>Quellen</h3>
    <p>Die Themen folgen den öffentlich beschriebenen Inhalten des Kompaktkurses Einbürgerung der Bürgergemeinde (bgbasel.ch), den Informationen des Kantons (bs.ch) und der Bundesbehörden (admin.ch). Verbindliche Informationen erhältst du bei der Bürgergemeinde der Stadt Basel, Tel. 061 269 96 10.</p>
    <h3>Datenschutz</h3>
    <p>Die App sammelt keine persönlichen Daten, hat kein Konto, keine Werbung und kein Tracking. Dein Lernfortschritt wird nur auf diesem Gerät gespeichert. Erinnerungen werden lokal auf dem Gerät geplant. Wenn du die App löschst, ist auch dein Fortschritt gelöscht.</p>
  </details>
'''
body = rep(body, '  <p class="note">Fragen zu Personen', settings_and_about + '\n  <p class="note">Fragen zu Personen')

# ---------- script ----------
script = rep(script,
"""let S={xp:0,best:{},wrong:[],badges:[],cards:0,lines:[],muted:false,hadWrong:false};
try{const raw=localStorage.getItem("bbq");if(raw)S=Object.assign(S,JSON.parse(raw))}catch(e){}
function save(){try{localStorage.setItem("bbq",JSON.stringify(S))}catch(e){}}""",
"""let S={xp:0,best:{},wrong:[],badges:[],cards:0,lines:[],muted:false,hadWrong:false,dayStreak:0,lastDay:"",reminder:{on:false,time:"19:00"}};
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
}""")

script = rep(script, "sBad();if(navigator.vibrate)try{navigator.vibrate(80)}catch(e){}", "sBad();buzz(\"bad\");")
script = rep(script, "sGood();popText(\"+\"+gain+\" XP\");", "sGood();buzz(\"good\");popText(\"+\"+gain+\" XP\");")
script = rep(script, "S.xp+=G.xp;award(\"first\",G.newB);", "S.xp+=G.xp;touchDay();award(\"first\",G.newB);")
script = rep(script, "if(stars>=2||G.newB.length){sWin();", "if(stars>=2||G.newB.length){sWin();buzz(\"win\");")
script = rep(script, "const q=C.deck[C.i];C.done++;S.cards++;", "const q=C.deck[C.i];C.done++;S.cards++;touchDay();")

script = rep(script, '$("mute").innerHTML=S.muted?ICON.off:ICON.on;',
"""$("mute").innerHTML=S.muted?ICON.off:ICON.on;
  const ds=liveStreak();
  $("dayStreak").innerHTML=ds?`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 5 5.5 5 10.5A5 5 0 0 1 7 12.5c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9z"/></svg>${ds} Tag${ds>1?"e":""}`:"";
  renderReminder();""")

reminder = r"""
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
      id:REM_ID,title:"Basel Bürgerquiz",
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
"""
script = rep(script, "\nrenderHome();\n", reminder + "\nboot();\n")

imports = """import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
"""
open(f"{out}/app.js", "w", encoding="utf-8").write(imports + script)

title = '<title>Basel Bürgerquiz</title>'
body = body.replace(title, "").replace('<meta name="claude:viewport-fit-sides" content="cover">', "")
body = re.sub(r'<link rel="preconnect"[^>]*>\s*', "", body)
body = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^>]*>\s*', "", body)

html = f"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<meta name="format-detection" content="telephone=no">
{title}
<link rel="stylesheet" href="fonts.css">
<style>{style}</style>
</head>
<body>
{body.strip()}
<script src="app.bundle.js"></script>
</body>
</html>
"""
open(f"{out}/index.html", "w", encoding="utf-8").write(html)
print("ok")
