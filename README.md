# Guilds Tech Tree

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&color=000000" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript&color=3178C6" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.0-blue?style=flat-square&logo=tailwindcss&color=06B6D4" alt="Tailwind">
  <img src="https://img.shields.io/badge/Cytoscape.js-Graph%20Visualization-orange?style=flat-square" alt="Cytoscape">
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel&color=000000" alt="Vercel">
</p>

<p align="center">
  <strong>Interactive Web-Based Tech Tree for the Guilds Minecraft Plugin</strong>
</p>

<p align="center">
  <a href="https://guilds-techtree.vercel.app">Live Demo</a> •
  <a href="https://github.com/mintychochip/guilds">Plugin Repo</a>
</p>

---

## Features

- **Web-Based Interface** — No client mod required, works in any browser
- **Secure Sessions** — UUID-based magic links with configurable timeouts
- **Real-Time Sync** — WebSocket connection to Minecraft server for live updates
- **Interactive Graph** — Visual node tree powered by Cytoscape.js
- **Instant Apply** — Unlock tech tree nodes directly from the web interface
- **Modern UI** — Built with Next.js 16 and Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 + TypeScript |
| **Styling** | Tailwind CSS |
| **Visualization** | Cytoscape.js — Interactive graph rendering |
| **Backend** | Javalin web server (embedded in Guilds plugin) |
| **Protocol** | WebSocket API for real-time communication |
| **Session** | Secure UUID-based tokens |
| **Hosting** | Vercel (auto-deploy on push to `main`) |

---

## How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Minecraft      │     │  Magic Link     │     │  Web Browser    │
│  Player         │────▶│  (Secure Token) │────▶│  Tech Tree UI   │
│  /techtree web  │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  WebSocket to     │
                                               │  Server Plugin    │
                                               │  (Unlock Nodes)   │
                                               └─────────────────┘
```

1. **Player runs `/techtree web`** in-game
2. **Plugin generates secure session** and provides magic link
3. **Player opens link** in any browser
4. **Interactive node graph** renders with Cytoscape.js
5. **Select nodes to unlock** — visual feedback in real-time
6. **Plugin validates** and applies unlocks to player's guild

---

## Quick Start

### Prerequisites

- Node.js 18+
- Guilds plugin installed on Minecraft server

### Installation

```bash
# Clone the repository
git clone https://github.com/mintychochip/guilds-techtree.git
cd guilds-techtree

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Testing with Sample Data

```bash
# Open demo page with mock data
open http://localhost:3000/s/demo?host=localhost:8080
```

---

## Project Structure

```
guilds-techtree/
├── app/                    # Next.js 16 app router
│   ├── s/[session]/        # Session-based tree viewer
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── TechTreeGraph.tsx   # Cytoscape.js wrapper
│   └── NodePanel.tsx       # Node details panel
├── lib/                    # Utilities and API clients
│   ├── websocket.ts        # WebSocket connection
│   └── session.ts          # Session management
├── types/                  # TypeScript definitions
└── next.config.ts          # Next.js configuration
```

---

## WebSocket API

The frontend communicates with the Guilds plugin via WebSocket:

| Message | Direction | Description |
|---------|-----------|-------------|
| `auth` | Client → Server | Authenticate with session token |
| `tree_data` | Server → Client | Receive tech tree structure |
| `unlock` | Client → Server | Request node unlock |
| `unlock_confirmed` | Server → Client | Unlock successful |

---

## Deployment

Automatically deployed to Vercel on every push to `main`:

```bash
# Manual deployment
vercel --prod
```

**Live URL:** [https://guilds-techtree.vercel.app](https://guilds-techtree.vercel.app)

---

## Contributing

Contributions welcome! Please follow the existing code style.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and open a PR

---

## License

MIT License

---

<p align="center">
  Built for the Guilds Minecraft community
</p>
