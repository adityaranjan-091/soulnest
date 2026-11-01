import type { Metadata } from "next";
import { Lora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { AudioProvider } from "@/context/AudioContext";
import { Navbar } from "@/components/layout/Navbar";

// Storytelling serif font for articles, quotes, and titles
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

// Clean UI typography for buttons, navigation, and metadata
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SoulNest — Where Deep Stories Find a Home",
  description:
    "A cozy, human-centric sanctuary for reflective essays, vulnerable narratives, digital gardens, and soulful reading.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${lora.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <ThemeProvider>
          <AuthProvider>
            <AudioProvider>
              {/* Top Navigation Bar with Logo, Ambient Player & 3-way Theme Switcher */}
              <Navbar />

              {/* Persistent Content Area */}
              <div className="flex-1 flex flex-col">
                {children}
              </div>

              {/* Cozy Footer */}
              <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 py-8 px-4 text-center">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
                  <p className="font-serif italic">
                    SoulNest — crafted for slow reading & mindful reflection.
                  </p>
                  <div className="flex items-center gap-6">
                    <span>Light • Sepia • Dark</span>
                    <span>Rain • Fireplace • Forest</span>
                  </div>
                </div>
              </footer>
            </AudioProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
