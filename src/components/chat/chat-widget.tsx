"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { useMobileClinicBarVisible } from "@/components/layout/mobile-clinic-bar"
import { useChat } from "@ai-sdk/react"
import { MessageCircle, X, Send, Bot, AlertTriangle, House } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

const SUGGESTED_QUESTIONS = [
  "What are your hours?",
  "Do you accept walk-ins?",
  "Where is your nearest location?",
]

function renderInlineFormatting(text: string) {
  const segments = text.split(/(\*\*.*?\*\*)/g)

  return segments.map((segment, index) => {
    const match = /^\*\*(.*?)\*\*$/.exec(segment)

    if (match) {
      return <strong key={`${segment}-${index}`}>{match[1]}</strong>
    }

    return <span key={`${segment}-${index}`}>{segment}</span>
  })
}

function renderFormattedText(text: string) {
  const blocks = text.split(/\n\s*\n/).filter(Boolean)

  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean)
    const bulletLines = lines.filter((line) => /^\*\s+/.test(line))

    if (lines.length > 0 && bulletLines.length === lines.length) {
      return (
        <ul
          key={`block-${blockIndex}`}
          className="space-y-1.5 pl-4"
        >
          {lines.map((line, lineIndex) => (
            <li key={`line-${blockIndex}-${lineIndex}`} className="list-disc">
              {renderInlineFormatting(line.replace(/^\*\s+/, ""))}
            </li>
          ))}
        </ul>
      )
    }

    return (
      <div key={`block-${blockIndex}`} className="space-y-1.5">
        {lines.map((line, lineIndex) => {
          const content = line.replace(/^\*\s+/, "")
          const isHeading = /^\*\*.*\*\*$/.test(content)

          return (
            <p
              key={`line-${blockIndex}-${lineIndex}`}
              className={cn(
                "whitespace-pre-wrap",
                isHeading && "font-semibold"
              )}
            >
              {renderInlineFormatting(content)}
            </p>
          )
        })}
      </div>
    )
  })
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)")

    const updateViewport = () => {
      setIsDesktop(mediaQuery.matches)
    }

    updateViewport()
    mediaQuery.addEventListener("change", updateViewport)

    return () => {
      mediaQuery.removeEventListener("change", updateViewport)
    }
  }, [])

  return isDesktop
}

function ChatMessages({
  messages,
  status,
}: {
  messages: ReturnType<typeof useChat>["messages"]
  status: ReturnType<typeof useChat>["status"]
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isStreaming = status === "streaming" || status === "submitted"

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, status])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Bot className="size-6 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">
            Welcome to Valleyview Medical Centre
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ask me about our locations, services, hours, or booking.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 touch-pan-y"
    >
      <div className="flex flex-col gap-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                message.role === "user"
                  ? "rounded-br-md bg-primary text-primary-foreground"
                  : "rounded-bl-md bg-muted text-foreground"
              )}
            >
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <div key={i} className="space-y-3">
                      {renderFormattedText(part.text)}
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>
        ))}
        {isStreaming &&
          messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-muted px-3.5 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground" />
                  <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}

function ChatInput({
  onSend,
  status,
  suggestions,
  showSuggestions,
}: {
  onSend: (text: string) => void
  status: ReturnType<typeof useChat>["status"]
  suggestions: string[]
  showSuggestions: boolean
}) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const isDisabled = status === "streaming" || status === "submitted"

  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || isDisabled) return
    onSend(trimmed)
    setInput("")
  }, [input, isDisabled, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div className="border-t bg-background p-3">
      {showSuggestions && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {suggestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onSend(q)}
              disabled={isDisabled}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={input}
          maxLength={1500}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          disabled={isDisabled}
          className="flex-1"
          aria-label="Chat message input"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={isDisabled || !input.trim()}
          aria-label="Send message"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function ChatPanelContent({ onClose }: { onClose: () => void }) {
  const { preferredLocation } = usePreferredLocation()
  const { messages, status, sendMessage, error, setMessages, clearError } =
    useChat()
  const showSuggestions = messages.length === 0

  const handleSend = useCallback(
    (text: string) => {
      sendMessage({ text }, { body: { clinic: preferredLocation?.slug } })
    },
    [sendMessage, preferredLocation?.slug]
  )

  const handleReset = useCallback(() => {
    setMessages([])
    clearError()
  }, [setMessages, clearError])

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-primary px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5 text-primary-foreground" />
          <h2 className="text-sm font-semibold text-primary-foreground">
            Valleyview Assistant
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          {messages.length > 0 ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleReset}
              className="text-primary-foreground hover:bg-primary-foreground/20"
              aria-label="Return to chat home"
            >
              <House className="size-4" />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/20"
            aria-label="Close chat"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ChatMessages messages={messages} status={status} />

      {/* Error state */}
      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="size-3.5 shrink-0" />
          <span>
            Chat is unavailable or the conversation limit was reached.{" "}
            {preferredLocation?.phone ? (
              <>
                Call {preferredLocation.shortName} at{" "}
                <a className="font-semibold underline" href={`tel:${preferredLocation.phone.replace(/\D/g, "")}`}>
                  {preferredLocation.phone}
                </a>
                , or see{" "}
              </>
            ) : (
              "Find your clinic's phone number on "
            )}
            <Link className="font-semibold underline" href="/locations" onClick={onClose}>
              {preferredLocation?.phone ? "all locations" : "the Locations page"}
            </Link>
            .
          </span>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        status={status}
        suggestions={SUGGESTED_QUESTIONS}
        showSuggestions={showSuggestions}
      />

      {/* Disclaimer */}
      <div className="border-t px-4 py-2">
        <p className="text-center text-[10px] leading-tight text-muted-foreground">
          This assistant provides clinic information only. It cannot offer
          medical advice. Please do not share personal or health information. For emergencies, call 911.
        </p>
      </div>
    </div>
  )
}

/** Desktop chat panel -- fixed card in bottom-right corner */
function DesktopChatPanel({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed right-6 bottom-24 z-50 hidden h-[540px] w-[400px] overflow-hidden rounded-xl bg-card shadow-2xl ring-1 ring-foreground/10 md:flex md:flex-col"
    >
      <ChatPanelContent onClose={onClose} />
    </motion.div>
  )
}

/** Mobile chat panel -- full-screen Sheet from bottom */
function MobileChatPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="gap-0 p-0 data-[side=bottom]:h-[100dvh]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Chat with Valleyview Medical Centre</SheetTitle>
          <SheetDescription>
            Ask questions about our clinic locations, services, and hours.
          </SheetDescription>
        </SheetHeader>
        <ChatPanelContent onClose={onClose} />
      </SheetContent>
    </Sheet>
  )
}

const AUTO_OPEN_DELAY_MS = 4000
const AUTO_OPENED_KEY = "vvm-chat-auto-opened"

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const isDesktop = useIsDesktop()
  const { preferredLocation, hasHydrated } = usePreferredLocation()
  const hasClinic = !!preferredLocation
  const aboveClinicBar = useMobileClinicBarVisible()

  // Greet once per visit, a few seconds after the visitor has a clinic.
  useEffect(() => {
    if (!hasHydrated || !hasClinic) return
    try {
      if (window.sessionStorage.getItem(AUTO_OPENED_KEY)) return
    } catch {
      return
    }
    const timer = window.setTimeout(() => {
      try { window.sessionStorage.setItem(AUTO_OPENED_KEY, "1") } catch {}
      setIsOpen(true)
    }, AUTO_OPEN_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [hasHydrated, hasClinic])

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn("fixed right-6 z-50", aboveClinicBar ? "bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6" : "bottom-6")}
          >
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-95"
              aria-label="Open chat"
            >
              <MessageCircle className="size-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop panel */}
      <AnimatePresence>
        {isOpen && isDesktop && (
          <DesktopChatPanel key={preferredLocation?.slug ?? "all"} onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>

      {/* Mobile panel */}
      {!isDesktop && (
        <MobileChatPanel key={preferredLocation?.slug ?? "all"} open={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  )
}
