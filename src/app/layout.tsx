import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import NavBar from "@/components/NavBar";
import SideBar from "@/components/SideBar";
import { Toaster } from "react-hot-toast";
import { OnlineStatusHandler } from "@/components/online-status-handler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrendLink",
  description: "TrendLink - Social Media App",
  keywords: ["TrendLink", "Social Media", "Social Media App", "Social Media Platform", "Social Media Network"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <div className="min-h-screen">
              <NavBar />
              <main className="py-8">
                <OnlineStatusHandler />
                <div className="max-w-7xl mx-auto px-4 ">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="hidden lg:block lg:col-span-3">

                      <SideBar/>
                    </div>
                    <div className="lg:col-span-9">{children}</div>
                  </div>
                </div>
              </main>
              <Toaster />

            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
