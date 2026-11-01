# Ibukunoluwa Olabode — Animated Portfolio

A deployable multi-page portfolio built with Vite, vanilla JavaScript, Three.js, GSAP, and JSON-driven content. Designed for Vercel static hosting with Vercel serverless functions for optional admin publishing, RAG-assisted chat, Telegram notifications, contact email, and subscriptions.

## Included pages

- `/` — animated 3D homepage with chapter navigation
- `/about/` — profile, skill groups, and experience
- `/work/` — selected projects
- `/freelance/` — services and marketplace profile links
- `/blog/` — published article index
- `/blog/<slug>/` — full article template
- `/resume/` — in-page document preview and CV links
- `/hire/` — opportunity and project enquiry form
- `/chat/` — portfolio assistant chat
- `/admin/` — private CMS and portfolio studio
- `/media/` — image and video workshop
- `/privacy/` — basic privacy information for the public forms and assistant

Public pages use folder `index.html` files. Vercel is configured with clean URLs and trailing slashes so visitors do not see `.html` extensions.

## Local development

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Push this folder to a new GitHub repository.
2. Import the repository into Vercel.
3. Use the default Vite build command `npm run build` and output directory `dist`.
4. Add the environment variables described below for admin login, GitHub publishing, AI chat, Telegram, and email.
5. Deploy.

The public portfolio works without optional API keys. Admin publishing, generated AI answers, Telegram notifications, email delivery, and persistent newsletter collection require their respective services.

## Update your profile before launch

Edit `public/data/content.json`:

- Replace `your-email@example.com`, GitHub, LinkedIn, Fiverr, Upwork, and portfolio placeholders with verified links.
- Confirm location, exact degree/programme, education dates, employment dates, and availability statement.
- Confirm all listed skills and project descriptions are accurate. The Song project link is set to the verified `.vercel.app` deployment. The DigiTrovea URL remains as supplied and returned a 404 during link checking; replace it with the correct live URL before launch.
- Add the CV PDF to `public/assets/` and set `profile.resumePath` (for example `/assets/Ibukunoluwa-Olabode-CV.pdf`).
- Add screenshots in `public/assets/` and set project cover paths if desired.

Edit `public/data/blog.json` to add articles. Only items with `status: "published"` appear on the public blog index. Articles use blocks (`paragraph`, `heading`, `list`, `quote`, `image`) and all plain-text URLs are linkified automatically.

Content dates, employment dates, degree details, freelance marketplace profile URLs, and any missing project evidence should be confirmed before publishing. The starter dataset includes a few clearly editable fields and a single article seed.

## Admin and CMS

The `/admin/` area is protected by an HTTP-only signed session cookie. The block editor supports heading, paragraph, list, quote, and image blocks; drag-and-drop ordering; local drafts; JSON import/export; and GitHub-based publishing. The publishing API allows writes only to:

- `public/data/content.json`
- `public/data/blog.json`
- `public/data/knowledge.json`

Admin publishing commits the JSON file to the configured GitHub branch. Vercel redeploys after the repository commit. Local drafts and browser analytics are stored in the browser and are not cross-device analytics.

Set these Vercel environment variables:

```text
ADMIN_PASSWORD=use-a-long-unique-password
ADMIN_SESSION_SECRET=use-a-long-random-secret
GITHUB_TOKEN=your-fine-grained-token
GITHUB_OWNER=your-github-account-or-org
GITHUB_REPO=your-repository-name
GITHUB_BRANCH=main
```

Give the GitHub token access only to the selected repository with Contents: Read and write. Do not add tokens to frontend JSON, JavaScript, HTML, or GitHub commits.

## AI assistant and RAG

`api/chat.js` retrieves relevant paragraphs from `public/data/knowledge.json` and `public/data/content.json` before creating a response. If an OpenAI-compatible endpoint is configured, retrieved context is passed to it. Without a model key, the endpoint returns a simple knowledge-grounded fallback.

Optional environment variables:

```text
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

This is a lightweight lexical retrieval starter, not a trained foundation model or a vector database. It does not perform supervised, unsupervised, or reinforcement learning. To add vector search, evaluations, durable memory, tool execution, and model training, connect a managed vector store/database and a dedicated training/evaluation pipeline. Never claim the assistant is trained on a large private dataset unless that work is actually carried out.

The command catalogue contains 155 allow-listed command descriptors in `public/data/bot-commands.json`. The current public chat implements core information, page navigation, help, and safe self-audit responses. Admin-only commands are catalogue entries for controlled CMS workflows; they are not exposed as unrestricted privileged actions to visitors.

## Telegram integration

Visitor questions can be forwarded to the configured Telegram chat. An admin can reply directly to the notification in Telegram; the optional webhook relays that reply into the matching browser chat session using Upstash Redis.

Set:

```text
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_WEBHOOK_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Configure Telegram's webhook URL as `https://YOUR-DOMAIN/api/telegram-webhook` and use the same `TELEGRAM_WEBHOOK_SECRET` as the webhook secret token. Use HTTPS. The bot token must remain a Vercel server-side environment variable.

## Contact and newsletter

For email delivery:

```text
RESEND_API_KEY=
CONTACT_TO_EMAIL=your-inbox@example.com
CONTACT_FROM_EMAIL=Portfolio <verified-sender@your-domain.com>
```

Newsletter signups are stored in Upstash Redis when configured. Otherwise, the public form uses a local-browser fallback and is not a shared subscriber database. Configure consent wording and a privacy policy before collecting real subscriber information.

## Image and video workshop

The browser-based editor includes image crop controls, resize, rotate, filters, brightness, contrast, saturation, and PNG export. The video editor includes playback preview, trim in/out points, playback speed, filters, aspect framing, poster-frame export, and browser WebM recording. Browser video export uses `MediaRecorder` and currently exports the rendered video image without source audio. Heavy, frame-accurate transcoding should be added via a server-side FFmpeg service or a carefully configured ffmpeg.wasm integration; ffmpeg.wasm is intentionally not loaded by default because of its large download and memory cost.

## Resume and document preview

The resume page embeds PDFs and supported image previews in the same page. Browsers do not natively render every office format (DOCX, XLSX, PPTX) without a renderer or conversion. Convert office files to PDF for reliable same-page viewing, or add dedicated browser parsers for selected formats. Do not assume every unknown file type can be displayed natively.

## Android app build (GitHub Actions)

`.github/workflows/build-android.yml` builds the web site, wraps its built assets using Capacitor, and uploads a downloadable **debug APK** as a GitHub Actions artifact after pushes to `main`/`master` or a manual workflow run.

After pushing code:

1. Open the repository's **Actions** tab.
2. Select **Build Android app**.
3. Wait for the workflow to finish successfully.
4. Open the completed run and download the `ibukunoluwa-portfolio-android-debug` artifact.
5. Extract the ZIP to get `app-debug.apk`.

This debug APK is for testing and sideloading. For Google Play distribution, configure a release signing keystore and a separate signed release workflow. The Android wrapper is generated during CI; you do not need to commit generated Android build output.

## Accessibility, performance, and security notes

- Reduced-motion preferences disable the Three.js animation and soften UI motion.
- The main site uses a full-screen chapter/slide interaction on desktop; long-form article and admin/media tools retain contained scrolling for readability and usability. Mobile uses ordinary document flow and touch-friendly navigation instead of forcing a no-scroll layout on small screens.
- Three.js limits pixel ratio and particle count to reduce GPU use.
- The site uses lazy-loaded native media where practical and a simple service worker for app-shell caching.
- The included passive self-audit is not a penetration test. Do not expose an unauthenticated remote scanner, allow arbitrary target URLs, or claim a security assessment has been completed.
- Add a real privacy policy, cookie/analytics notice if applicable, spam protection, and persistent database before production lead generation.

## Project references and implementation inspirations

This project uses its own design and code. Open-source packages and public examples were reviewed for implementation patterns; no whole portfolio template was copied into this project.

- Three.js examples: https://threejs.org/examples/
- 3D portfolio pattern reference (MIT): https://github.com/CodeItAlone/3D-portfolio
- Scroll-driven Three.js gallery reference (MIT): https://github.com/boydcroberts/CherryTree
- SortableJS drag-and-drop ordering (MIT): https://github.com/SortableJS/Sortable
- GrapesJS web builder and block editor patterns (BSD-3-Clause): https://github.com/GrapesJS/grapesjs
- CropperJS reference for image cropping patterns (MIT): https://github.com/fengyuanchen/cropperjs
- ffmpeg.wasm browser media processing reference (MIT): https://github.com/ffmpegwasm/ffmpeg.wasm
- Vercel AI SDK RAG guide: https://github.com/vercel/ai-sdk-rag-starter
- Telegram Bot API: https://core.telegram.org/bots/api
- Chrome Trusted Web Activities build guide: https://developer.chrome.com/docs/android/trusted-web-activity/quick-start

Review each dependency and reference license before adapting code from any external repository.
