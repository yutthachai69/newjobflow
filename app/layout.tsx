import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import { getCurrentUser } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AirService Enterprise - ระบบบริหารจัดการงานบริการแอร์",
  description: "Enterprise Air Service Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  
  // แปลง user เป็น format ที่ Navigation ต้องการ
  const navUser = user ? {
    username: user.username,
    fullName: user.fullName || undefined,
    role: user.role as "ADMIN" | "TECHNICIAN" | "CLIENT",
  } : null;

  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <Navigation user={navUser} />
        <main>{children}</main>
      </body>
    </html>
  );
}
