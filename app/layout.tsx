import "@/styles/globals.css"
import { SessionProvider } from "../components/session";
import { Session } from "inspector";

import { type ReactNode } from "react"
import { type Metadata } from "next"

import { siteConfig } from "@/config/site"
import { fontSans } from "@/lib/fonts"
import { cn, sanitizeName } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { ExamplesNav } from "@/components/examples-nav"
import Footer from "@/components/footer"
import PageHeader from "@/components/home/pageHeader"
import { ShadcnThemeProvider } from "@/components/shadcn-theme-provider"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeArrows } from "@/components/theme-arrows"
import { ThemeProvider } from "@/components/theme-provider"
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";





interface RootLayoutProps {
  children: ReactNode
  params: any
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="en"
      suppressHydrationWarning={true}
      className={`theme-${params.theme}`}
    >
      <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
          suppressHydrationWarning={true}
        >				<SessionProvider session={session}>
                  <SiteHeader />

                <div className="flex min-h-screen flex-col">
                  <div className="flex-1">
                    <div className="container pb-10">
                      <PageHeader theme={params.theme} />
                      <section className="block">
                        <div className="overflow-hidden rounded-lg border bg-background shadow-xl">
                          {children}
                        </div>
                      </section>
                    </div>
                  </div>
                  <Footer />
                </div>
                <Toaster />
              <TailwindIndicator />
              </SessionProvider>

        </body>
    </html>
  )
}
