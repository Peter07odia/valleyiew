import type { ClinicLocation } from "@/config/clinic"

const SITE_URL = "https://valleyviewmedical.ca"

// TODO: Confirm Whitby Friday/Saturday/Sunday hours in locations.json.
// TODO: Confirm Oshawa unit and postal code in locations.json.
// TODO: Confirm Courtice unit and postal code in locations.json.
// TODO: Confirm Sunday hours for both Brantford clinics in locations.json.
// Existing registry values are preserved for the address and hours below.

export function locationSeo(location: ClinicLocation) {
  const street = location.address.split(",")[0].replace(/^\d+\s+/, "")
  const kind = location.walkIn ? "Medical Clinic & Walk-in" : "Medical Clinic"
  const url = `${SITE_URL}/locations/${location.slug}`
  return {
    url,
    title: `${location.city} ${street} ${kind}`,
    description: `${location.name}: ${location.walkIn ? "walk-in and " : ""}medical clinic on ${street} in ${location.city}. Family physician care, Ocean booking for registered patients and a new patient registration form.`,
    intro: `${location.name} is a ${location.walkIn ? "walk-in and " : ""}medical clinic on ${street} in ${location.city}, providing family physician care. Registered patients can book through Ocean; new patients can use the registration form to request registration.${location.walkIn ? " Call the clinic for walk-in availability before visiting." : " Call the clinic for appointment availability."}`,
  }
}

export function medicalClinicJsonLd(location: ClinicLocation) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: location.name,
    url: locationSeo(location).url,
    telephone: location.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address,
      addressLocality: location.city,
      addressRegion: location.province,
      postalCode: location.postalCode,
      addressCountry: "CA",
    },
    openingHoursSpecification: location.hours
      .filter((hours) => hours.status === "confirmed")
      .map((hours) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${hours.day}`,
        opens: hours.isClosed ? "00:00" : hours.open,
        closes: hours.isClosed ? "00:00" : hours.close,
      })),
    ...(typeof location.lat === "number" && typeof location.lng === "number"
      ? { geo: { "@type": "GeoCoordinates", latitude: location.lat, longitude: location.lng } }
      : {}),
  }
}
