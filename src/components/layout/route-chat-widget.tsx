"use client"

import { usePathname } from "next/navigation"

import { ChatWidget } from "@/components/chat/chat-widget"

export function RouteChatWidget() {
  const pathname = usePathname()

  if (["/admin", "/new-patient-form", "/registration-reports", "/auth"].some(path => pathname?.startsWith(path))) return null

  return <ChatWidget />
}
