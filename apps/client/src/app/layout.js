import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "Pocket Maps - L'aventure vous attend",
  description: "Explorez le monde qui vous entoure avec une nouvelle perspective.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <main className="h-screen w-screen overflow-hidden relative">
          {children}
        </main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
