"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { Reveal } from "@/components/shared/reveal"
import {
  SUPPORT_TEAM_MEMBERS,
  TEAM_CATEGORIES,
  TEAM_MEMBER_BIOS,
  getTeamMemberImageSrc,
  isTeamLogoImage,
  type TeamCategory,
} from "@/lib/team"
import { cn } from "@/lib/utils"
import { DoctorPhoto } from "./doctor-photo"
import styles from "./team-carousel.module.css"

interface Person {
  key: string
  name: string
  title: string
  credentials?: string
  /** Support staff photo; doctors use DoctorPhoto instead. */
  image: string
  profileId: string | null
  isDoctor?: boolean
}

function peopleFor(category: TeamCategory, clinicId: string | null, doctorIds: string[] | null): Person[] {
  if (category === "doctors") {
    return TEAM_MEMBER_BIOS.filter(bio => !doctorIds || doctorIds.includes(bio.id)).map(bio => {
      const [credentials, title] = bio.role.includes(" | ") ? bio.role.split(" | ") : ["", bio.role]
      return { key: bio.id, name: bio.name, title, credentials, image: getTeamMemberImageSrc(bio.id), profileId: bio.id, isDoctor: true }
    })
  }
  const seen = new Set<string>()
  return SUPPORT_TEAM_MEMBERS.filter(member => member.category === category && (!clinicId || member.locationIds.includes(clinicId)))
    .filter(member => {
      // Across all clinics, list each person once per group.
      if (seen.has(member.name)) return false
      seen.add(member.name)
      return true
    })
    .map(member => ({
      key: `${category}-${member.name}`,
      name: member.name,
      title: member.title,
      image: member.image,
      profileId: member.profileId,
    }))
}

function PersonCard({ person, index }: { person: Person; index: number }) {
  const logo = isTeamLogoImage(person.image)
  const card = (
    <Reveal as="article" effect="flip" delay={(index % 4) * 100} className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.avatarWrap}>
          {person.isDoctor && person.profileId ? (
            <DoctorPhoto doctorId={person.profileId} sizes="88px" className={styles.avatarImg} />
          ) : (
            <Image
              src={person.image}
              alt={person.name}
              fill
              sizes="88px"
              className={cn(styles.avatarImg, logo && "object-contain p-2")}
            />
          )}
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.doctorInfo}>
          <h3>{person.name}</h3>
          <p>{person.title}</p>
          {person.credentials ? <p className={styles.credentials}>{person.credentials}</p> : null}
        </div>
        {person.profileId ? (
          <span className={styles.viewProfile}>
            View Profile <ArrowRight size={14} aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </Reveal>
  )
  return person.profileId ? (
    <Link href={`/staff/${person.profileId}`} className={styles.gridItem} aria-label={`View profile of ${person.name}`}>
      {card}
    </Link>
  ) : (
    <div className={styles.gridItem}>{card}</div>
  )
}

/** Our Team page: centred group tabs (Doctors, Administrative, Pharmacists, Management) for the visitor's clinic. */
export function TeamDirectory() {
  const { preferredLocation } = usePreferredLocation()
  const clinic = preferredLocation
  const groups = TEAM_CATEGORIES.map(category => ({
    ...category,
    people: peopleFor(category.id, clinic?.id ?? null, clinic?.doctorIds ?? null),
  })).filter(group => group.people.length > 0)
  const [picked, setPicked] = useState<TeamCategory>("doctors")
  // Fall back to the first group when the chosen one does not exist at this clinic.
  const active = groups.some(group => group.id === picked) ? picked : groups[0]?.id ?? "doctors"

  return (
    <section className={styles.section} aria-labelledby="team-heading">
      <div className={styles.container}>
        <Reveal className={styles.heading}>
          <h1 id="team-heading">Meet Our Team</h1>
          <span aria-hidden="true" />
          <p>Experienced and qualified healthcare professionals</p>
        </Reveal>


        <TabsPrimitive.Root value={active} onValueChange={value => setPicked(value as TeamCategory)}>
          <div className={styles.tabs}>
            <TabsPrimitive.List aria-label="Team groups" className={styles.tabList}>
              {groups.map(group => (
                <TabsPrimitive.Trigger key={group.id} value={group.id} className={styles.tab}>
                  {group.title}
                </TabsPrimitive.Trigger>
              ))}
            </TabsPrimitive.List>
          </div>
          {groups.map(group => (
            <TabsPrimitive.Content key={group.id} value={group.id} className="outline-none">
              <h2 className="sr-only">{group.title}</h2>
              <div className={styles.grid}>
                {group.people.map((person, index) => (
                  <PersonCard key={person.key} person={person} index={index} />
                ))}
              </div>
            </TabsPrimitive.Content>
          ))}
        </TabsPrimitive.Root>
      </div>
    </section>
  )
}
