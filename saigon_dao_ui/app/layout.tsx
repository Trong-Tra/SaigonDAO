import "./globals.css";
import { Plus_Jakarta_Sans, Orbitron } from "next/font/google";
import ContextProvider from "@/context";
import { headers } from "next/headers";
import { Toaster } from "react-hot-toast";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const cookies = headersList.get("cookie");
  return (
    <html lang="en">
      <body
        className={`min-h-screen bg-gradient-to-bl from-amber-100 via-white to-amber-100 ${plusJakartaSans.variable} ${orbitron.variable}`}
      >
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
