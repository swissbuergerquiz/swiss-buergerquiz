# How to write questions for Swiss Bürgerquiz

Swiss Bürgerquiz helps people prepare for the Swiss naturalisation test or interview. Users study in German, French or Italian, with English as help. **People rely on these facts for their citizenship, so every question must be correct.** If you cannot confirm a fact, leave the question out.

## Target

- Each canton needs **at least 80 questions in total**. The app already generates 8 per canton from a facts table, so each canton file needs **at least 74 hand-written questions** (aim for 75–78). Keep the questions that are already in the file.
- If a canton runs out of obvious test-level facts, go deeper: villages and regions, landmarks, economy and well-known companies, institutions (university, cantonal bank, hospitals), dialect, food, transport, nature, historical people, events and buildings. They must still be facts a well-informed resident could learn, and they must be verifiable.

## Already covered: do NOT write questions about these

The app generates these 8 for every canton, so don't duplicate them:
capital · number of members of the cantonal government · name of the cantonal parliament · number of seats in the cantonal parliament · year of joining the Confederation · National Council seats · Council of States seats · official languages.

Also don't repeat the questions already in the canton's file.

## Never include

- **Names of current office holders** (government members, members of the Council of States or National Council, mayors, party presidents). They change. Historical people are fine.
- **Numbers that change often** (exact population, unemployment rate, tax rates), unless the question says the date (for example "Stand 2026") and you have a source for that date. Rounded, stable facts are fine ("rund 1,6 Millionen Einwohner").
- Opinions, jokes about groups, politically one-sided framing, or anything that would be offensive to people of the canton.
- Trick questions where a wrong option is arguably also correct.

## Format

Each canton has its own file: `src/data/cantons/XX.js` (XX = canton code). Add entries to the array; never change other cantons' files or any other file.

```js
{id:"zh3",k:"ZH",src:"https://www.zh.ch/...",
 de:["Frage?","Richtige Antwort","Falsch 1","Falsch 2","Falsch 3","Kurze Erklärung."],
 fr:["Question ?","Bonne réponse","Faux 1","Faux 2","Faux 3","Brève explication."],
 it:["Domanda?","Risposta giusta","Sbagliata 1","Sbagliata 2","Sbagliata 3","Breve spiegazione."],
 en:["Question?","Correct answer","Wrong 1","Wrong 2","Wrong 3","Short explanation."]},
```

- `id`: lowercase canton code + number, continuing after the highest existing number (zh3, zh4, …). Never reuse an id.
- `k`: the canton code in capitals.
- `src`: the URL of the page where you **actually confirmed** the fact. Prefer official sources: the canton's website (especially its naturalisation learning material, many cantons publish one), the commune's website, admin.ch, ch.ch, the Historisches Lexikon der Schweiz (hls-dhs-dss.ch), the Federal Statistical Office (bfs.admin.ch), parlament.ch. Wikipedia is acceptable only when nothing official covers the fact.
- Each language has exactly 6 strings: question, **correct answer first**, three wrong answers, explanation. The app shuffles the answers.
- The four answers must be clearly different from each other and the three wrong ones must be plausible but clearly wrong. Keep answers short (under ~80 characters).
- Explanation: one or two short sentences (under ~30 words) that teach something, not just repeat the answer.
- Write all four languages yourself, as natural texts, not word-for-word. Use local official names (e.g. "Grosser Rat" in Aargau, "Grand Conseil" in Vaud). For place names use the form usual in each language (Genf/Genève/Ginevra/Geneva) where one exists.
- Swiss conventions: German without ß (use ss) and with «» quotes; French with a space before ? ! : and « »; Italian with «»; English in British spelling.
- Numbers: 1'000 in German, 1 000 in French and Italian, 1,000 in English.

## Spread of topics (roughly, per canton)

Politics and institutions ~20 (government departments, how laws are made, cantonal votes and initiatives, communes and districts, courts, constitution, Landsgemeinde if any, voting rights) · geography ~15 · history ~15 · economy and work ~8 · culture, customs, food, sport, famous people ~12 · daily life and other ~5. Mix easy and harder questions.

## Writing in chunks

Add questions in batches of about 12–15 (Edit: insert before the final `];`), so no single edit is huge. After each batch, run:

```
node scripts/check-questions.mjs XX
```

It must end with "No errors found" and show at least 80 in total when you are done. Fix every error it reports. Warnings about missing `src` are not acceptable for new questions.
