# 🧩 offvsix web

A fast, minimal, and offline-capable tool to browse and download Visual Studio Code extensions as `.vsix` packages — without needing to install them from the Marketplace.

- ⚡ Instant search and category browsing
- 📦 Queue multiple extensions
- ⬇ Download as `.zip` for offline use
- 🛠 Built with Next.js App Router and full static export

Live: [gni.github.io/offvsix-web](https://gni.github.io/offvsix-web)  
GitHub: [github.com/gni/offvsix-web](https://github.com/gni/offvsix-web)

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
````

### 2. Run Locally

```bash
npm run dev
# or
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📦 Static Export (Production Build)

This app supports static export via `next export`.

### 1. Build & Export

```bash
npm run build
npm run export
```

The final output is located in the `out/` directory and is fully static (no server).

### 2. Deploy to GitHub Pages

Deploy from the `out/` folder to GitHub Pages using:

```bash
npx gh-pages -d out
```

Or configure your GitHub Actions/Pages settings to serve `/offvsix-web/`.

---

## 🧠 Features

* 🔍 Full-text search using Marketplace API
* 📂 Browse by:

  * Popular
  * Featured (Trending)
  * Recent
* ➕ Add to queue (animated UI)
* 📁 Download queue as `.vsix` or bundled `.zip`
* 🛡 Verified publisher badge
* 🧱 Responsive Masonry layout
* 🌐 SEO, Open Graph meta tags
* 🎨 Theme-aware (dark/light system)

---

## 🛡 Privacy & Offline Use

All extensions are downloaded client-side via the official Marketplace API. No analytics, no telemetry.

---

## 🛠 Built With

* [Next.js (App Router)](https://nextjs.org/)
* [TypeScript](https://www.typescriptlang.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Framer Motion](https://www.framer.com/motion/)
* [Zod](https://zod.dev/) + React Hook Form

---

## 🤝 Contributing

PRs and suggestions welcome. To contribute:

```bash
git clone https://github.com/gni/offvsix-web
cd offvsix-web
npm install
npm run dev
```

---

## Python cli
[offvsix](https://github.com/gni/offvsix)

## Author
[Lucian BLETAN](https://github.com/gni)

## 📄 License

MIT
