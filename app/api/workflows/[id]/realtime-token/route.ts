import { auth } from "@clerk/nextjs/server"
import { auth as triggerAuth } from "@trigger.dev/sdk"

import { getWorkflow } from "@/features/workflows/data"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth()
  if (!orgId) return new Response("Unauthorized", { status: 401 })

  const { id } = await params
  const workflow = await getWorkflow(orgId, id)
  if (!workflow) return new Response("Not found", { status: 404 })

  const token = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        tags: [`workflow:${id}`],
      },
    },
    expirationTime: "1h",
  })

  return Response.json({ token })
}
