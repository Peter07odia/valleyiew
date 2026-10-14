import { Reveal } from "@/components/shared/reveal"
import Link from "next/link"
import { REGIONS, CLINIC_LOCATIONS } from "@/config/clinic"
import { LocationCard } from "@/components/locations/location-card"
export const metadata = { title: "Our Locations", description: "Seven Valleyview clinics in Whitby, Oshawa, Courtice, Peterborough and Brantford. Find hours, contact details and booking." }
export default function LocationsPage() {
  return <><section className="bg-secondary px-5 py-16 text-white sm:py-24"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-accent-warm">Seven clinics. One Valleyview.</p><h1 className="mt-5 font-serif text-5xl sm:text-7xl">Find care close to home.</h1><p className="mt-6 max-w-xl leading-7 text-white/75">Choose your clinic for contact details, directions, registration and online booking.</p><nav className="mt-8 flex flex-wrap gap-4" aria-label="Clinic regions">{REGIONS.map(r=><Link key={r.id} href={`#${r.id}`} className="border border-white/30 px-5 py-3 text-sm hover:bg-white/10">{r.name}</Link>)}</nav></div></section>
    {REGIONS.map(region=><section key={region.id} id={region.id} className="mx-auto max-w-7xl scroll-mt-40 px-5 py-14 sm:px-8"><h2 className="mb-8 font-serif text-4xl text-secondary">{region.name}</h2><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{CLINIC_LOCATIONS.filter(l=>l.region===region.id).map((l,index)=><Reveal key={l.id} effect="flip" delay={(index % 3) * 120}><LocationCard location={l}/></Reveal>)}</div></section>)}
  </>
}
