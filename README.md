# Guilds Tech Tree

Interactive web-based tech tree viewer for the [Guilds](https://github.com/mintychochip/guilds) Minecraft plugin.

## How It Works

1. Player runs `/techtree web` in-game
2. Plugin creates a secure session and gives the player a magic link
3. Player opens the link → connects to the game server via WebSocket
4. Interactive node graph renders with Cytoscape.js
5. Player selects nodes to unlock, confirms changes
6. Plugin validates and applies the unlocks

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS, Cytoscape.js
- **Backend:** Embedded Javalin web server in the plugin, WebSocket API
- **Session:** UUID-based secure tokens with configurable timeout

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To test with sample data, open [http://localhost:3000/s/demo?host=localhost:8080](http://localhost:3000/s/demo?host=localhost:8080).

## Deployment

Deployed to Vercel. Push to `main` to deploy automatically.

## Links

- [Plugin Repository](https://github.com/mintychochip/guilds)
- [Vercel Deployment](https://guilds-techtree.vercel.app)
