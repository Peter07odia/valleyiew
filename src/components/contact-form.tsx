"use client"

import * as React from "react"

import { LOCATIONS } from "@/lib/constants"
import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ContactForm() {
  const [pending, setPending] = React.useState(false)
  const { preferredLocation } = usePreferredLocation()
  const [selectedLocation, setSelectedLocation] = React.useState("")

  React.useEffect(() => {
    if (!selectedLocation && preferredLocation) {
      setSelectedLocation(preferredLocation.slug)
    }
  }, [selectedLocation, preferredLocation])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)

    // Placeholder for form submission logic
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setPending(false)
    const form = event.currentTarget
    form.reset()
    setSelectedLocation(preferredLocation?.slug ?? "")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      aria-label="Contact form"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Full Name</Label>
          <Input
            id="contact-name"
            name="name"
            placeholder="Your full name"
            required
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email">Email Address</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-phone">Phone Number</Label>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            placeholder="905-000-0000"
            autoComplete="tel"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-location">Preferred Location</Label>
          <Select
            name="location"
            value={selectedLocation}
            onValueChange={setSelectedLocation}
          >
            <SelectTrigger id="contact-location" className="w-full">
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((location) => (
                <SelectItem
                  key={location.id}
                  value={location.slug}
                  disabled={location.isComingSoon}
                >
                  {location.name} &mdash;{" "}
                  {location.isComingSoon ? "Coming soon" : location.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          name="subject"
          placeholder="How can we help you?"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          placeholder="Please describe your inquiry in detail..."
          required
          className="min-h-32"
        />
      </div>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
