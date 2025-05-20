import "./globals.css";
import { Plus_Jakarta_Sans, Orbitron } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-orbitron",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen bg-gradient-to-bl from-amber-100 via-white to-amber-100 ${plusJakartaSans.variable} ${orbitron.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
