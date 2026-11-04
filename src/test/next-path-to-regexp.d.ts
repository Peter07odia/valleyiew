// Types for Next's bundled matcher, used by redirects.test.ts to check redirect sources.
declare module "next/dist/compiled/path-to-regexp" {
  export function match(
    path: string,
    options?: { decode?: (value: string) => string },
  ): (pathname: string) => false | { path: string; params: Record<string, unknown> }
}
