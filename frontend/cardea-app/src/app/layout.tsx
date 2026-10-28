import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { BarraLateral } from "@/components/BarraLateral";

export const metadata: Metadata = {
  title: "Cardea",
  description: "Gobierno del uso de IA",
  robots: { index: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen">
        <BarraLateral />
        <main className="flex min-w-0 flex-1 flex-col gap-3 p-4">{children}</main>
      </body>
    </html>
  );
}
