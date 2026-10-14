import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Search } from "lucide-react"

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold">Page not found</h1>
            <p className="text-muted-foreground">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. It
              may have been moved or no longer exists.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button asChild variant="outline">
                <Link href="/locations">Find a Location</Link>
              </Button>
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  )
}
