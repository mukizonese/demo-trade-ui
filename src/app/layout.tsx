import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Navigation } from '@/components/ui/navigation';
import { ThemeSwitch } from "@/components/ui/theme-switch"
import Link from "next/link";
import { WatchList } from "@/components/ui/watchlist/watchlist"
import { Back } from "@/components/ui/back"
import { Footer } from "@/components/ui/footer"
import Image from "next/image";
import { Toaster } from "@/components/ui/toaster"
import { ClientProviders } from "@/components/providers/ClientProviders"
import { AuthNav } from "@/components/ui/auth-nav"
import { AuthErrorToastManager } from "@/components/ui/auth-error-toast"
import { AuthHealthMonitor } from "@/components/ui/auth-health-monitor"

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
  { name: "Home", href: "/" },
  { name: "Market", href: "/trades" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Holdings", href: "/holdings" },
  { name: "Architecture", href: "/architecture" },
  //{ name: "Test Auth Errors", href: "/test-auth-errors" },
];

export default function RootLayout({
  children,
}: Readonly<{
     children: React.ReactNode;
   }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                  >
                    <ClientProviders>
                      <div className="lg:pl-38">

                          <div className="mx-auto max-w-9xl space-y-2 px-2 pt-20 lg:px-16 lg:py-2">

                              <div className="grid  grid-cols-3">
                                <div><ThemeSwitch/></div>
                                {/* <div><Navigation/></div> */}

                                <div>
                                    <ul className="flex items-center justify-center gap-8">
                                      {navigation.map((item) => (
                                        <Link
                                          key={item.href}
                                          href={item.href}
                                          className="text-md duration-500 hover:text-zinc-500"
                                        >
                                          {item.name}
                                        </Link>
                                      ))}
                                    </ul>
                                </div>

                                <div className="flex gap-3 items-center justify-end">
                                  <AuthNav />
                                  <a
                                    href="/mukizone"
                                    target="_self"
                                    rel="noopener noreferrer"
                                  >
                                    <Image
                                       className="dark:invert"
                                       src="/icons/mukizone-com.svg"
                                       alt="MukiZone"
                                       width={100}
                                       height={80}
                                       priority
                                     />
                                  </a>
                                </div>

                              </div>


                             <div className="rounded-lg bg-vc-border-gradient p-px ">
                                 {/* <div className="rounded-lg p-3.5 lg:p-6">{children}</div>*/}
                                      <div className="grid grid-cols-10 flex gap-2 items-left flex-col sm:flex-row">
                                          <div className="col-span-2 ">
                                                <WatchList/>
                                          </div>
                                          <div className="col-span-8 ">
                                                <div className="rounded-lg p-3.5 lg:p-6">{children}</div>

                                          </div>
                                      </div>
                                   </div>

                              <div> <Toaster /></div>
                              <AuthErrorToastManager />
                              <AuthHealthMonitor />
                            <div className="grid  grid-cols-2">
                              <div><Back/></div>
                              <div><Footer/></div>
                            </div>

                            </div>
                      </div>
                    </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
