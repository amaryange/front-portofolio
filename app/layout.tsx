import { Syne, DM_Mono, DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import PostHogProvider from "@/components/providers/PostHogProvider";

// Les polices restent ici pour éviter leur redéclaration dans le layout [locale]
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning : data-theme + lang sont mis à jour côté client
    <html suppressHydrationWarning>
      <head>
        {/* Anti-FOUC : applique le bon thème avant tout rendu */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('theme');var d=document.documentElement;d.setAttribute('data-theme',s||(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'));})();`,
          }}
        />
      </head>
      <body
        className={`${syne.variable} ${dmMono.variable} ${dmSans.variable}`}
      >
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "0.8rem",
            },
          }}
        />
      </body>
    </html>
  );
}
