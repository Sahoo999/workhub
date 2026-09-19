import type { Metadata } from "next";

import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "WorkHub",
  description:
    "Project and team management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}



// global Authentication Context Provider in client