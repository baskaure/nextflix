import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { SequelsProvider } from "@/contexts/SequelsContext";
import { ProjectsProvider } from "@/contexts/ProjectsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nextflix - Le baromètre des histoires de demain",
  description: "Nextflix transforme la voix émotionnelle des fans en un baromètre clair pour les suites, spin-offs et univers étendus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <SequelsProvider>
            <ProjectsProvider>{children}</ProjectsProvider>
          </SequelsProvider>
        </UserProvider>
      </body>
    </html>
  );
}
