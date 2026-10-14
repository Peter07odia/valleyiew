import Image from "next/image"
import { cn } from "@/lib/utils"

interface SiteLogoProps {
  className?: string
  sizes?: string
}

export function SiteLogo({ className, sizes = "160px" }: SiteLogoProps) {
  return (
    <Image
      src="/images/branding/vvm-logo.png"
      alt=""
      width={368}
      height={369}
      sizes={sizes}
      className={cn("h-14 w-auto md:h-[3.9rem]", className)}
    />
  )
}
