import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guilds Tech Tree",
  description: "Interactive tech tree viewer for the Guilds Minecraft plugin",
};

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#0f172a",
        color: "#e2e8f0",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          background: "linear-gradient(135deg, #22c55e, #3b82f6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "12px",
        }}
      >
        🌿 Guilds Tech Tree
      </h1>
      <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
        Run <code style={{ color: "#93c5fd" }}>/techtree web</code> in-game to
        get a link to your town&apos;s tech tree.
      </p>
    </div>
  );
}
