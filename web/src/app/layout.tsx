import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Air Drip | Diwali Air Quality Predictor & Atmospheric Intelligence",
  description:
    "Pick your Delhi neighborhood and All-India metro to see how bad the air will be before, during, and after Diwali, with an actionable health plan.",
  icons: {
    icon: "https://img.icons8.com/fluency/48/air-quality.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light m-0 p-0">
      <body className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-blue-600 selection:text-white m-0 p-0 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
