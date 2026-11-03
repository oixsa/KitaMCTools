# KitaMCTools ⛏️

> All-in-one Minecraft tools in your browser, built for server owners, developers and builders.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Status: In development](https://img.shields.io/badge/status-in%20development-orange)

KitaMCTools puts the Minecraft utilities you keep hunting for into one fast, clean web app, so you don't have to hop between a dozen different websites while setting up or building a server. It runs entirely in the browser: no account, no install.

<!-- TODO: add live demo link, e.g. **Live demo:** https://your-domain.example -->
<!-- TODO: add a screenshot, e.g. ![KitaMCTools home page](docs/screenshot.png) -->

---

## Why KitaMCTools?

Setting up and running a Minecraft server usually means bouncing between separate sites for your MOTD, server icon, JSON text, calculators and more. KitaMCTools aims to bring **every tool a server owner or developer needs into one place**, including, eventually, a world converter.

> **Status:** work in progress. Only complete, fully working tools are listed in the catalog.

---

## Available Tools

| # | Tool | What it does |
|---|------|--------------|
| 1 | **Server MOTD Generator** | Live in-game preview, RGB hex gradient builder, export to `server.properties`, BungeeCord and YAML `.yml` |
| 2 | **Server Icon Resizer** | Converts an image to a 64×64 PNG and Base64 |
| 3 | **Nether Portal Link Calculator** | Calculates linked portal coordinates between the Overworld and the Nether |
| 4 | **Voxel Circle & Oval Generator** | Block-by-block circle and oval layouts on a canvas grid |
| 5 | **Sphere & Dome Generator** | Sphere and dome layouts shown as layer slices |
| 6 | **Tellraw & JSON Text Builder** | Build `/tellraw` and `/title` JSON text visually |
| 7 | **Block Gradient & Palette Matcher** | Block palette and gradient matching across 60+ blocks |
| 8 | **Anvil & Enchantment Optimizer** | Finds the cheapest anvil order using the penalty tree |
| 9 | **Armor Stand Pose Visualizer** | Pose an armor stand and generate the `/summon` command |
| 10 | **Beacon Pyramid Calculator** | Pyramid size and mineral cost for tiers 1–4 |
| 11 | **XP & Mob Farm Calculator** | XP level and farm calculations (1.8+ formulas) |
| 12 | **Firework Rocket Designer** | Design rockets with a live particle preview |
| 13 | **Leather Armor Dye Mixer** | Mix dyes across all ~5.7 million vanilla leather colors |

More tools are on the way. See the [Roadmap](#roadmap).

---

## Features

- **Quick Launcher (`Ctrl+K` / `⌘K`)**: search tools by name, category or description; navigate with `↑` `↓`, open with `Enter`, close with `Esc`.
- **Favorites**: star the tools you use most; saved locally in your browser.
- **Dark & Light themes**: toggle with a persisted preference and no flash of the wrong theme on load.
- **Fully responsive**: adaptive layout for mobile, tablet and desktop, with a touch-scrollable category bar and a mobile drawer menu.
- **Accessible**: interactive controls have `aria-label`s for screen readers.
- **Data-driven catalog**: tools, categories and navigation live in a single data layer, separate from the UI.

---

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/) (strict)
- [Tailwind CSS v4](https://tailwindcss.com/)
- ESLint

---

## Getting Started

**Prerequisites:** a recent version of [Node.js](https://nodejs.org/) and npm.

```bash
# 1. Clone the repository
git clone https://github.com/oixsa/KitaMCTools.git
cd KitaMCTools

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To create and run a production build:

```bash
npm run build
npm start
```

---

## Project Structure

```
KitaMCTools/
├── app/
│   ├── components/   # Shared UI (header, footer, tool cards, quick launcher)
│   ├── data/         # Tool catalog, categories and navigation links
│   ├── hooks/        # useTheme, useFavorites
│   ├── types/        # TypeScript interfaces (Tool, Category, ...)
│   ├── tools/        # One folder per tool (each tool is its own page)
│   ├── layout.tsx    # Root layout and theme initialization
│   └── page.tsx      # Home page
├── docs/             # Architecture and maintenance guide
├── public/           # Static assets
└── README.md
```

For the full architecture, theme system and maintenance guide, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Adding a New Tool

1. **Create the tool page** at `app/tools/<tool-id>/page.tsx`.
2. **Register it** by adding an entry to the `TOOLS` array in `app/data/tools.ts`:

```ts
{
  id: 'my-tool',
  title: 'My Tool',
  description: 'One or two sentences about what this tool does.',
  category: 'utilities', // see categories below
  badge: 'NEW',          // optional: 'BETA' | 'NEW' | ...
  href: '/tools/my-tool',
  icon: 'build',         // Google Material Symbols Outlined icon name
  isFlagship: false,     // true = shown in the Flagship section
  featured: false,
  engineVersion: '1.21+' // optional
}
```

Available categories: `build-planning`, `shapes`, `art-palettes`, `seeds-worlds`, `calculators-games`, `creator-tools`, `utilities`.

Once registered, the tool automatically appears in **Explore Tools**, the **Quick Launcher**, category filters and the favorites list.

---

## Roadmap

- [ ] More tools for server owners and developers
- [ ] World converter
- [ ] Live demo and screenshots

Ideas and requests are welcome, so feel free to [open an issue](https://github.com/oixsa/KitaMCTools/issues).

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a branch: `git checkout -b feature/my-tool`
3. Commit your changes and push the branch
4. Open a pull request describing what you added or fixed

Please keep new tools fully working before adding them to the catalog, and follow the existing TypeScript and component structure.

---

## License

Released under the [MIT License](LICENSE).

The license covers the source code in this repository only. Minecraft names, textures and other game assets belong to their respective owners and are not covered by it.

---

## Disclaimer

*NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.*
Minecraft is a registered trademark of Mojang Synergies AB.
