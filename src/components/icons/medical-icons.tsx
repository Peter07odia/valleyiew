import type { ComponentType, ReactNode, SVGProps } from "react"

import { cn } from "@/lib/utils"

export type AppIcon = ComponentType<SVGProps<SVGSVGElement>>

interface BaseIconProps extends SVGProps<SVGSVGElement> {
  children: ReactNode
}

function BaseIcon({ className, children, ...props }: BaseIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-6", className)}
      {...props}
    >
      {children}
    </svg>
  )
}

export function WalkInCareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <rect x="11" y="19" width="34" height="28" rx="9" fill="#E8F7F4" />
      <path
        d="M19 19v-3a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v3"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="11"
        y="19"
        width="34"
        height="28"
        rx="9"
        stroke="currentColor"
        strokeWidth="3.2"
      />
      <path
        d="M28 26v14M21 33h14"
        stroke="currentColor"
        strokeWidth="3.8"
        strokeLinecap="round"
      />
      <circle cx="49.5" cy="42.5" r="9.5" fill="#FCE9BE" />
      <path
        d="M49.5 37.5v5l3 2"
        stroke="#F0A830"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  )
}

export function FamilyPracticeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <circle cx="22" cy="23" r="7" fill="#E8F7F4" />
      <circle cx="38" cy="21" r="6" fill="#D7F0EA" />
      <path
        d="M14 43c1.8-7.3 8-11 15-11s13.2 3.7 15 11"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M30 43c1.2-5 5-7.7 9.5-7.7 4.4 0 8.1 2.7 9.5 7.7"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle
        cx="22"
        cy="23"
        r="7"
        stroke="currentColor"
        strokeWidth="3.2"
      />
      <circle
        cx="38"
        cy="21"
        r="6"
        stroke="currentColor"
        strokeWidth="3.2"
      />
      <rect x="42" y="34" width="12" height="12" rx="4" fill="#FCE9BE" />
      <path
        d="M48 37v6M45 40h6"
        stroke="#F0A830"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </BaseIcon>
  )
}

export function VaccinationsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path
        d="M32 12 45 17v11c0 9.4-5.4 17.1-13 20-7.6-2.9-13-10.6-13-20V17l13-5Z"
        fill="#E8F7F4"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path
        d="m24.5 38 16-16"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <rect
        x="23.5"
        y="34.5"
        width="7.5"
        height="4.5"
        rx="2.2"
        transform="rotate(-45 23.5 34.5)"
        fill="#F0A830"
      />
      <rect
        x="34.7"
        y="23.3"
        width="10"
        height="4.5"
        rx="2.2"
        transform="rotate(-45 34.7 23.3)"
        fill="#F0A830"
      />
      <path
        d="M40 20.5 43.5 24M19.5 43 24 38.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </BaseIcon>
  )
}

export function PhysicalsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <rect x="17" y="12" width="30" height="40" rx="8" fill="#E8F7F4" />
      <path
        d="M25 12.5h14M27 21h10M25 31l4 4 8-8M25 42h14"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="17"
        y="12"
        width="30"
        height="40"
        rx="8"
        stroke="currentColor"
        strokeWidth="3.2"
      />
      <path
        d="M49 21.5c0 3.3-5 7.2-5 7.2s-5-3.9-5-7.2a5 5 0 0 1 10 0Z"
        fill="#FCE9BE"
      />
      <path
        d="M44 17v6M41 20h6"
        stroke="#F0A830"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </BaseIcon>
  )
}

export function PediatricsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <circle cx="24" cy="23" r="8" fill="#E8F7F4" />
      <path
        d="M14 46c1.8-8.2 8.2-13 16-13s14.2 4.8 16 13"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle
        cx="24"
        cy="23"
        r="8"
        stroke="currentColor"
        strokeWidth="3.2"
      />
      <path
        d="M18 20c0-2.4 2.2-4.5 5.1-4.5 1.9 0 3.7.9 4.7 2.3"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M40 18c0-4 3.1-7 7-7 3.8 0 7 3 7 7 0 5.3-7 10.5-7 10.5S40 23.3 40 18Z"
        fill="#FCE9BE"
      />
      <path
        d="M47 14.8v6.4M43.8 18h6.4"
        stroke="#F0A830"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </BaseIcon>
  )
}

export function LabWorkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path
        d="M20 13v12l-7 12.3A7 7 0 0 0 19.1 48h10.8A7 7 0 0 0 36 37.3L29 25V13"
        fill="#E8F7F4"
      />
      <path
        d="M20 13h9M17 25h15M20 13v12l-7 12.3A7 7 0 0 0 19.1 48h10.8A7 7 0 0 0 36 37.3L29 25V13"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 36c2.2-1.2 4.6-1.8 7-1.8 3 0 6 .9 8.8 2.8"
        stroke="#F0A830"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M43 18v12M37 24h12"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="43" cy="24" r="10" stroke="currentColor" strokeWidth="3.2" />
    </BaseIcon>
  )
}

export function MinorProceduresIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <rect
        x="14"
        y="26"
        width="18"
        height="12"
        rx="5"
        transform="rotate(-18 14 26)"
        fill="#E8F7F4"
        stroke="currentColor"
        strokeWidth="3.2"
      />
      <rect
        x="32"
        y="32"
        width="18"
        height="12"
        rx="5"
        transform="rotate(-18 32 32)"
        fill="#D7F0EA"
        stroke="currentColor"
        strokeWidth="3.2"
      />
      <path
        d="M28 20v24M16 32h24"
        stroke="#F0A830"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.9"
      />
    </BaseIcon>
  )
}

export function VirtualCareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <rect
        x="12"
        y="15"
        width="40"
        height="26"
        rx="7"
        fill="#E8F7F4"
        stroke="currentColor"
        strokeWidth="3.2"
      />
      <path
        d="M23 49h18M28 41v8M36 41v8"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="28" cy="27" r="5" fill="#D7F0EA" />
      <path
        d="M20.5 35c1.3-4 4.4-6 7.5-6 3.2 0 6.2 2 7.5 6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle
        cx="28"
        cy="27"
        r="5"
        stroke="currentColor"
        strokeWidth="3"
      />
      <rect x="38" y="22" width="10" height="10" rx="3.5" fill="#FCE9BE" />
      <path
        d="M43 24.5v5M40.5 27h5"
        stroke="#F0A830"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </BaseIcon>
  )
}

export function PreventionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path
        d="M32 12 45 17v11c0 9.4-5.4 17.1-13 20-7.6-2.9-13-10.6-13-20V17l13-5Z"
        fill="#E8F7F4"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path
        d="M32 22v14M25 29h14"
        stroke="#F0A830"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </BaseIcon>
  )
}

export function HealthTipsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path
        d="M24 39c-2.8-2.2-6-6.6-6-11.3 0-7.4 5.9-13.2 14-13.2S46 20.3 46 27.7c0 4.5-2.9 8.6-5.8 11.3"
        fill="#E8F7F4"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25 43h14M27 48h10"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M32 22v9M27.5 27.5h9"
        stroke="#F0A830"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M49 14v5M46.5 16.5h5"
        stroke="#F0A830"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </BaseIcon>
  )
}
