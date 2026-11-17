# Fact-checking Swiss Bürgerquiz questions

You are reviewing questions someone else wrote. People will use them to prepare for their Swiss citizenship test, so a wrong "correct" answer can cost them. Be sceptical; your job is to find and fix mistakes, not to approve.

Read `src/data/cantons/README.md` first: it has the format and writing rules the questions must follow.

## What to check for every question

1. **The correct answer is true** (as of November 2026). Open the `src` URL and confirm it. Group questions by `src`, so you fetch each source only once. If the source doesn't confirm the fact, look for another reliable source (official canton/federal sites, hls-dhs-dss.ch, bfs.admin.ch first) and replace `src`. If you cannot confirm it at all, **delete the question**.
2. **No wrong option is also correct or arguably correct.** If one is, replace it with a clearly wrong but plausible option, in all four languages.
3. **The explanation is true.** Remove or fix any claim in it you cannot confirm.
4. **The four languages say the same thing** (same correct answer, same meaning). Fix mismatches. Check Swiss conventions from the README (no ß, «» quotes, French spacing).
5. **Nothing from the "Never include" list**: names of current office holders, undated changing numbers, opinions.
6. **No duplicates** within the canton, and nothing that repeats the 8 generated topics (capital, government size, parliament name and size, year of joining, National Council seats, Council of States seats, official languages).

Questions without a `src`: find a source and add it, or delete the question.

## Rules for edits

- Only edit the files you were assigned. Other agents are editing other files at the same time.
- Keep ids unchanged when you fix a question. Don't renumber.
- If deleting pushes a canton below 80 in total, write verified replacement questions (with `src`, new ids continuing after the highest one) until it is back at 80 or more.
- After your changes run `node scripts/check-questions.mjs XX` for each canton. It must end with "No errors found". Missing-`src` warnings must be gone.
- Don't run git and don't build the app.

## Final reply (short)

For each canton: the checker's count line; how many questions you checked; how many you fixed, how many you deleted, how many you added; and a short list of the most important corrections (id: what was wrong → what it is now).
