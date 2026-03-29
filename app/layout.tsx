import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guilds Tech Tree",
  description: "Interactive tech tree viewer for the Guilds Minecraft plugin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body style={{ margin: 0, padding: 0, background: "#0f172a" }}>
        {children}
      </body>
    </html>
  );
}
