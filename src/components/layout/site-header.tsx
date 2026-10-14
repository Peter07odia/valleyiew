"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, ArrowUpRight } from "lucide-react"
import { SiteLogo } from "./site-logo"
import { ClinicSwitcher } from "./clinic-switcher"
import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
const links = [["Home", "/"], ["Locations", "/locations"], ["Team", "/team"], ["Services", "/services"], ["Contact", "/contact"]]
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { preferredLocation: clinic } = usePreferredLocation()
  return <header className="sticky top-0 z-40 border-b border-secondary/10 bg-background/95 backdrop-blur-md">
    <a className="sr-only focus:not-sr-only focus:absolute focus:bg-white focus:p-4" href="#main-content">Skip to content</a>
    <div className="bg-secondary text-secondary-foreground">
      <div className="mx-auto flex max-w-7xl items-center px-5 py-2 text-xs sm:px-8">
        <ClinicSwitcher />
      </div>
    </div>
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:gap-5 sm:px-8">
      <Link href="/" aria-label="Valleyview Medical Centre home" className="flex min-w-0 items-center gap-2 sm:gap-3"><SiteLogo className="h-12 w-12" sizes="48px" /><span className="text-sm font-bold leading-tight tracking-tight text-secondary sm:text-base">Valleyview<br /><span className="font-medium">Medical Centre</span></span></Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-6 text-sm font-semibold lg:flex">{links.map(([label,href])=><Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className="py-2 hover:text-primary aria-[current=page]:text-primary">{label}</Link>)}</nav>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3"><Link href="/new-patient-form" className="hidden border border-secondary/20 px-4 py-3 text-xs font-bold hover:border-primary sm:block">New patient registration</Link><Link href={clinic?.bookingUrl ?? "/book"} className="flex items-center gap-2 bg-primary px-4 py-3 text-xs font-bold text-white hover:bg-primary/90">Book appointment <ArrowUpRight className="size-3.5" /></Link>
      <button type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-menu" onClick={()=>setOpen(!open)} className="p-2 lg:hidden">{open ? <X /> : <Menu />}</button></div>
    </div>
    {open && <nav id="mobile-menu" aria-label="Mobile navigation" className="max-h-[70dvh] overflow-y-auto border-t px-5 py-4 lg:hidden">{[...links,["New patient registration","/new-patient-form"]].map(([label,href])=><Link key={href} href={href} onClick={()=>setOpen(false)} className="block border-b border-secondary/10 py-3 font-medium">{label}</Link>)}</nav>}
  </header>
}
