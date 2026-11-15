# Basel Bürgerquiz – iOS & Android app

A gamified practice quiz for the Basel-Stadt naturalisation interview, packaged with [Capacitor](https://capacitorjs.com) so the same code ships to the App Store and Google Play.

**Already done in this project**
- iOS and Android projects (`ios/`, `android/`) with app icon, splash screens (light and dark) and notification icon
- Works fully offline: fonts and questions are bundled
- Progress saved with native storage, so it survives app updates
- Haptic feedback, and an optional daily reminder with a day-streak counter
- iOS privacy manifest and export-compliance flag; Android's restricted exact-alarm permission removed
- Privacy policy page (`docs/privacy.html`), store texts (`STORE-LISTING.md`), and a GitHub Actions build that produces an Android test APK

---

## Step 0 · Before anything else (15 minutes)

1. **Choose your app ID.** It's set to `com.baselbuergerquiz.app` in `capacitor.config.json`. Change it now if you want something else (for example `ch.yourname.buergerquiz`). **It can never change after the first upload.** If you change it, also change `PRODUCT_BUNDLE_IDENTIFIER` in Xcode and `applicationId` / `namespace` in `android/app/build.gradle`.
2. **Fill in your contact details** in `docs/privacy.html` (the `[DEIN NAME]` / `[YOUR EMAIL]` placeholders). Both stores require a reachable contact.
3. **Publish the privacy policy** so it has a public URL:
   - Create a GitHub account and a new repository, then upload this whole folder (without `node_modules`).
   - In the repository: **Settings → Pages → Source: Deploy from branch → Branch `main`, folder `/docs`**.
   - Your URL is `https://<username>.github.io/<repo>/privacy.html`. You'll paste it into both stores.

## Step 1 · Test on your own phone

**Android (easiest, no computer setup):** pushing to GitHub runs the *Android test build* workflow. Open **Actions → latest run → Artifacts**, download the APK, send it to your Android phone and install it (allow "install unknown apps").

**iPhone:** you need a Mac (see Step 3). Connect the iPhone, run `npm run ios`, pick your phone in Xcode and press ▶.

## Step 2 · Google Play

1. **Create a developer account** at play.google.com/console. It costs USD 25 once and needs ID verification.
   - New *personal* accounts must run a **closed test with at least 12 testers for 14 days in a row** before you can publish. Ask friends from your naturalisation course to join; they install via a Play Store link.
   - An *organisation* account (needs a D-U-N-S number) skips this rule.
2. **Install Android Studio** (free, Windows/Mac/Linux) and Node.js 22.
3. In this folder, run:
   ```
   npm install
   npm run android
   ```
   Android Studio opens. Choose **Build → Generate Signed App Bundle → Android App Bundle**, create a new upload keystore, and build `app-release.aab`.
   **Back up the keystore file and its passwords.** Without them you cannot publish updates.
4. In Play Console: **Create app** → name *Basel Bürgerquiz*, default language German (Switzerland), App, Free.
5. Complete **App content**: privacy policy URL, Ads = No, App access = no login needed, Content rating questionnaire, Target audience 18+, Data safety = no data collected (see `STORE-LISTING.md`), Government apps = **No**. Because the app covers government topics, Google requires the non-affiliation disclaimer and source links in the description; they're already in the listing text.
6. **Store listing:** texts from `STORE-LISTING.md`, the icon from `assets/icon-only.png` (resize to 512 px), a 1024×500 feature graphic and at least 2 phone screenshots.
7. **Testing → Closed testing:** upload the `.aab`, add your 12+ testers, wait 14 days, then **Apply for production**. Review usually takes a few days.

## Step 3 · Apple App Store

1. **Get a Mac** with the latest Xcode (free from the Mac App Store). If you don't own one, options are borrowing one, renting a cloud Mac (e.g. MacinCloud), or a cloud build service like Codemagic, which builds and uploads from this repository without a Mac.
2. **Join the Apple Developer Program** at developer.apple.com/programs. It costs USD 99 per year, and identity verification can take 1–2 days.
3. On the Mac, in this folder:
   ```
   npm install
   npm run ios
   ```
   Xcode opens. Select the **App** target → **Signing & Capabilities** → tick *Automatically manage signing* and choose your team.
4. In **App Store Connect** (appstoreconnect.apple.com): **My Apps → + → New App**, platform iOS, name *Basel Bürgerquiz*, primary language German, bundle ID = your app ID, SKU anything (e.g. `basel-quiz-1`).
5. In Xcode: choose **Any iOS Device**, then **Product → Archive → Distribute App → App Store Connect → Upload**.
6. In App Store Connect fill in:
   - texts, keywords and review notes from `STORE-LISTING.md`
   - screenshots for 6.9" iPhone (1320×2868) and 13" iPad (2064×2752). Take them in the Xcode simulator with ⌘S.
   - privacy policy URL, App Privacy = *Data Not Collected*, age rating, price Free
7. Select the uploaded build, then **Add for Review → Submit**. Reviews usually take 1–3 days.

**Avoiding rejection.** Apple sometimes rejects apps that look like a website in a wrapper (guideline 4.2). This app has offline play, native storage, haptics and local notifications, which helps. If Apple still asks for more native value, reply in Resolution Center describing those features. Never claim to be official: the in-app disclaimer and listing text already handle this, and don't use the Basel coat of arms or the Swiss cross as the icon.

## Step 4 · Updating questions

All questions live in `src/app.js` in the `Q` list. The first answer is always the correct one; the app shuffles them.

1. Edit `src/app.js`. Questions marked `cur:1` are time-sensitive (Federal Council, Regierungsrat, Ständerat). **Check them every December** after the Federal Assembly elections, and after Basel elections.
2. Raise the version:
   - Android: `versionCode` (+1) and `versionName` in `android/app/build.gradle`
   - iOS: *Version* and *Build* in Xcode → App target → General
3. Run `npm run sync`, build again, upload, and submit as in Steps 2 and 3.

## Project layout

| Path | What it is |
|---|---|
| `src/index.html`, `src/app.js` | The quiz: screens, styles, questions, game logic |
| `src/fonts/` | Bundled fonts (SIL Open Font License) |
| `scripts/build.mjs` | Bundles `src/` into `www/` (run by `npm run build`) |
| `assets/` | Source icon and splash images. After changing them, run `npm run assets` |
| `ios/`, `android/` | Native projects. Open them with `npm run ios` / `npm run android` |
| `docs/privacy.html` | Privacy policy for GitHub Pages |
| `STORE-LISTING.md` | Texts and answers for the store forms |

## Costs at a glance

| Item | Cost |
|---|---|
| Google Play developer account | USD 25 once |
| Apple Developer Program | USD 99 per year |
| Mac, if you don't have one | Borrow / rent a cloud Mac / Codemagic free tier |
| Hosting the privacy policy (GitHub Pages) | Free |
