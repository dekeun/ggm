import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "고구마마켓 🍠",
  description: "우리 동네 중고거래, 고구마마켓",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${geist.className} min-h-full bg-orange-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
