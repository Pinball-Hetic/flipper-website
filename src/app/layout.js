import "./globals.css";

export const metadata = {
  title: "Pocket Maps - Pokémon Go Style",
  description: "Explore the world around you",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <main className="h-screen w-screen overflow-hidden relative">
          {children}
        </main>
      </body>
    </html>
  );
}
