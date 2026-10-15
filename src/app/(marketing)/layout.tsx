import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 overflow-x-clip">{children}</main>
      <SiteFooter />
    </>
  )
}
