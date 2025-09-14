import { Metadata } from "next";
import { Toaster } from "sonner";

import { Navbar } from "@/components/custom/navbar";
import { ThemeProvider } from "@/components/custom/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://arkcutt.com"),
  title: "Agente Arkcutt - Especialista en Corte Láser",
  description: "Agente inteligente especializado en presupuestación, consultas y diseño para servicios de corte láser. Análisis DXF, cálculos precisos y asesoramiento técnico.",
  keywords: ["corte láser", "presupuesto", "DXF", "fabricación digital", "Arkcutt", "análisis técnico"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
