"use client"
import Image from "next/image"
import Link from "next/link"
import { useRef, useState, useEffect, useCallback } from "react"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { CLINIC_LOCATIONS } from "@/config/clinic"
import { TEAM_MEMBER_BIOS, getTeamMemberImageSrc } from "@/lib/team"
import { Reveal } from "@/components/shared/reveal"
import styles from "./team-carousel.module.css"
export function LocationTeamSection({ headingLevel = "h1", locationSlug, all = false }: { headingLevel?: "h1" | "h2"; locationSlug?: string; all?: boolean }) {
  const { preferredLocation } = usePreferredLocation()
  const clinic = locationSlug ? CLINIC_LOCATIONS.find(l => l.slug === locationSlug) : all ? null : preferredLocation
  const doctors = clinic ? TEAM_MEMBER_BIOS.filter(d => clinic.doctorIds.includes(d.id)) : TEAM_MEMBER_BIOS
  const Heading = headingLevel
  return <section id="meet-our-team" className={styles.section} aria-label="Meet Our Team">
    <div className={styles.container}>
      <Reveal className={styles.heading}><Heading>Meet Our Team</Heading><span aria-hidden="true" /><p>Experienced and qualified healthcare professionals</p></Reveal>
      <DoctorCarousel key={clinic?.slug ?? "all"} doctors={doctors} />
    </div>
  </section>
}
function DoctorCarousel({ doctors }: { doctors: typeof TEAM_MEMBER_BIOS }) {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })
  const update = useCallback(() => { const el=ref.current;if(el) setEdges({start:el.scrollLeft<2,end:el.scrollLeft+el.clientWidth>=el.scrollWidth-2}) },[])
  useEffect(()=>{ const el=ref.current;if(!el)return;const observer=new ResizeObserver(update);observer.observe(el);update();return()=>observer.disconnect() },[update])
  function move(direction: number) { const el=ref.current;if(el)el.scrollBy({left: direction * ((el.firstElementChild?.getBoundingClientRect().width ?? el.clientWidth)+24),behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"}) }
  return <>
    <div ref={ref} onScroll={update} className={styles.track} role="region" aria-roledescription="carousel" aria-label="Our medical team" tabIndex={0} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}}}>
      {doctors.map((bio,index)=>{
        const [credentials,role] = bio.role.includes(" | ") ? bio.role.split(" | ") : ["",bio.role]
        return <Link href={`/staff/${bio.id}`} key={bio.id} className={styles.cardLink} aria-label={`View profile of ${bio.name}, ${index+1} of ${doctors.length}`}>
          <Reveal as="article" effect="flip" delay={(index % 4) * 100} className={styles.card}><div className={styles.cardHeader}><div className={styles.avatarWrap}><Image src={getTeamMemberImageSrc(bio.id)} alt={bio.name} fill sizes="88px" className={styles.avatarImg} style={{objectPosition:bio.imagePosition ?? "center top"}} /></div></div>
            <div className={styles.cardBody}><div className={styles.doctorInfo}><h3>{bio.name}</h3><p>{role}</p>{credentials && <p className={styles.credentials}>{credentials}</p>}</div><span className={styles.viewProfile}>View Profile <ArrowRight size={14} aria-hidden="true" /></span></div>
          </Reveal>
        </Link>
      })}
    </div>
    <div className={styles.controls}><button onClick={()=>move(-1)} disabled={edges.start} aria-label="Previous doctors"><ChevronLeft size={20} /></button><button onClick={()=>move(1)} disabled={edges.end} aria-label="Next doctors"><ChevronRight size={20} /></button></div>
  </>
}
