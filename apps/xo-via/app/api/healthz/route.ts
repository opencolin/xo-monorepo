/**
 * k8s liveness probe. Returns 200 with a small JSON payload as long
 * as the Node process is responsive.
 */
export const dynamic = "force-static"

export async function GET() {
  return Response.json({ status: "ok" })
}
