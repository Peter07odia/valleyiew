"use client"

import Image from "next/image"
import { useState } from "react"
import { UserRound } from "lucide-react"

import { getDoctorBio, getDoctorPhoto } from "@/lib/team"
import { cn } from "@/lib/utils"

interface DoctorPhotoProps {
  doctorId: string
  sizes: string
  priority?: boolean
  className?: string
}

/**
 * A doctor's portrait, filling its (relatively positioned) container. Shows a
 * neutral placeholder avatar, labelled with the doctor's name, when there is no
 * photo or the file fails to load.
 */
export function DoctorPhoto({ doctorId, sizes, priority, className }: DoctorPhotoProps) {
  const [failed, setFailed] = useState(false)
  const bio = getDoctorBio(doctorId)
  const photo = getDoctorPhoto(doctorId)
  const name = bio?.name ?? "Doctor"

  if (!photo || failed) {
    return (
      <div
        role="img"
        aria-label={name}
        className={cn("absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-500", className)}
      >
        <UserRound className="size-1/2" strokeWidth={1.5} aria-hidden="true" />
      </div>
    )
  }

  return (
    <Image
      src={photo}
      alt={bio?.imageAlt ?? `Portrait of ${name}`}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
      style={{ objectPosition: bio?.imagePosition ?? "center top" }}
    />
  )
}
