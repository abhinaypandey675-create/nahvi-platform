import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import NeuralBackground from "@/components/NeuralBackground";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "NAHVI — AI systems, built to ship",
  description:
    "NAHVI builds production AI products: intelligent agents, workflow engines, and developer tools.",
  openGraph: {
    title: "NAHVI — AI systems, built to ship",
    description:
      "NAHVI builds production AI products: intelligent agents, workflow engines, and developer tools.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <Providers>
          <NeuralBackground />
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
