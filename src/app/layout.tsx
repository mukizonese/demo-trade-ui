import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider"
import { ThemeSwitch } from "@/components/ui/theme-switch"
import Link from "next/link";
import { Footer } from "@/components/ui/footer"
import Image from "next/image";
import { Toaster } from "@/components/ui/toaster"
import { ClientProviders } from "@/components/providers/ClientProviders"
import { AuthNav } from "@/components/ui/auth-nav"
import { AuthErrorToastManager } from "@/components/ui/auth-error-toast"
import { AuthHealthMonitor } from "@/components/ui/auth-health-monitor"
import { SimpleMobileNav } from "@/components/ui/simple-mobile-nav"
import { LayoutWrapper } from "@/components/ui/layout-wrapper"
import { ChartPanelProvider } from '@/contexts/ChartPanelContext';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Trade Demo",
  description: "MukiZone Trade Demo App",
};

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Market", href: "/trades" },
  { name: "Holdings", href: "/holdings" },
  { name: "About", href: "/about" },
];

const mobileNavigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Watch", href: "/watch" },
  { name: "Market", href: "/trades" },
  { name: "Holdings", href: "/holdings" },
  { name: "About", href: "/about" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClientProviders>
            <ChartPanelProvider>
              <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-9xl px-2 pt-2 lg:pt-4 lg:px-16">
                  {/* Mobile Navigation */}
                  <SimpleMobileNav navigation={mobileNavigation} />
                  {/* Desktop Navigation */}
                  <div className="hidden lg:grid lg:grid-cols-3 mb-4">
                    <div><ThemeSwitch/></div>
                    <div>
                      <ul className="flex items-center justify-center gap-8">
                        {navigation.map((item) => (
                          <Link key={item.href} href={item.href} className="text-md duration-500 hover:text-zinc-500">
                            {item.name}
                          </Link>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-3 items-center justify-end">
                      <AuthNav />
                      <a href="/mukizone" target="_self" rel="noopener noreferrer">
                        <Image className="dark:invert" src="/icons/mukizone-com.svg" alt="MukiZone" width={100} height={80} priority />
                      </a>
                    </div>
                  </div>
                  <LayoutWrapper>{children}</LayoutWrapper>
                  <AuthErrorToastManager />
                  <AuthHealthMonitor />
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mt-4">
                    <div><Footer/></div>
                  </div>
                </div>
              </div>
              <Toaster />
            </ChartPanelProvider>
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
