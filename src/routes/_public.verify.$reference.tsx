import { createFileRoute } from "@tanstack/react-router"
import { CheckCircle2Icon, XCircleIcon } from "lucide-react"

import { verifyRegistration } from "@/domains/registrations"

export const Route = createFileRoute("/_public/verify/$reference")({
  head: () => ({
    meta: [
      { title: "Verify registration | Africa Digital Forum" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ params }) =>
    verifyRegistration({ data: { reference: params.reference } }),
  component: VerifyPage,
})

function VerifyPage() {
  const result = Route.useLoaderData()
  const { reference } = Route.useParams()

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      {result.registered ? (
        <>
          <CheckCircle2Icon className="size-16 text-green-600" />
          <h1 className="text-2xl font-bold">Registered</h1>
          <p className="text-lg">{result.name}</p>
          <p className="text-muted-foreground">
            {result.passTier ? `${result.passTier} pass` : "Registered"}
          </p>
          {result.checkedIn ? (
            <p className="text-sm text-amber-600">Already checked in</p>
          ) : null}
        </>
      ) : (
        <>
          <XCircleIcon className="size-16 text-red-600" />
          <h1 className="text-2xl font-bold">Not registered</h1>
          <p className="text-muted-foreground">
            No registration found for this code.
          </p>
        </>
      )}
      <p className="text-xs text-muted-foreground">{reference.toUpperCase()}</p>
    </main>
  )
}
