<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

- In Next.js 16, the file `src/proxy.ts` is the correct middleware file convention, and `export async function proxy(request: NextRequest)` is the correct export. Do NOT flag this as a naming violation or request a rename to `middleware.ts`.
<!-- END:nextjs-agent-rules -->

