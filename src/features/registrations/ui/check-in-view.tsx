import { useCallback, useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import jsQR from "jsqr"
import { CameraIcon, CheckCircle2Icon, UndoIcon } from "lucide-react"

import {
  checkInRegistration,
  findRegistrationByReference,
  getCheckInStats,
  undoCheckIn,
  type CheckInTicket,
} from "@/domains/registrations"
import { PageHeader } from "@/components/admin/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const toReference = (raw: string) => {
  const value = raw.trim()
  const match = value.match(/\/verify\/([^/?#\s]+)/i)
  return (match?.[1] ?? value).toUpperCase()
}

export function CheckInView() {
  const queryClient = useQueryClient()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [scanning, setScanning] = useState(false)
  const [manual, setManual] = useState("")
  const [ticket, setTicket] = useState<CheckInTicket | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const stats = useQuery({
    queryKey: ["registrations", "check-in-stats"],
    queryFn: () => getCheckInStats(),
  })

  const refreshStats = () =>
    queryClient.invalidateQueries({ queryKey: ["registrations"] })

  const lookup = useMutation({
    mutationFn: (reference: string) =>
      findRegistrationByReference({ data: { reference } }),
    onSuccess: (row) => {
      setTicket(row)
      setMessage(row ? null : "No registration found for that code.")
    },
    onError: () => setMessage("Lookup failed. Please try again."),
  })

  const checkIn = useMutation({
    mutationFn: (reference: string) =>
      checkInRegistration({ data: { reference } }),
    onSuccess: (row) => {
      setTicket(row)
      void refreshStats()
    },
  })

  const undo = useMutation({
    mutationFn: (reference: string) => undoCheckIn({ data: { reference } }),
    onSuccess: (row) => {
      setTicket(row)
      void refreshStats()
    },
  })

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setScanning(false)
  }, [])

  useEffect(() => stopCamera, [stopCamera])

  const startCamera = async () => {
    setMessage(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream
      setScanning(true)
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        await video.play()
      }
    } catch {
      setMessage(
        "Camera unavailable. Allow camera access (HTTPS required) or type the reference below."
      )
      stopCamera()
    }
  }

  useEffect(() => {
    if (!scanning) return
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d", { willReadFrequently: true })
    const timer = window.setInterval(() => {
      const video = videoRef.current
      if (!video || !context || video.videoWidth === 0) return
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)
      const image = context.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(image.data, image.width, image.height)
      if (code?.data) {
        stopCamera()
        lookup.mutate(toReference(code.data))
      }
    }, 250)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning, stopCamera])

  const busy = lookup.isPending || checkIn.isPending || undo.isPending

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Check-in"
        description="Scan an attendee's QR code or enter their reference."
      />

      <div className="rounded-lg border p-4 text-sm">
        Checked in:{" "}
        <strong>
          {stats.data?.checkedIn ?? 0} / {stats.data?.total ?? 0}
        </strong>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <video
          ref={videoRef}
          playsInline
          muted
          className={
            scanning
              ? "aspect-video w-full rounded-md bg-black object-cover"
              : "hidden"
          }
        />
        <Button
          type="button"
          variant={scanning ? "outline" : "default"}
          onClick={scanning ? stopCamera : startCamera}
        >
          <CameraIcon className="mr-2 size-4" />
          {scanning ? "Stop camera" : "Scan QR code"}
        </Button>

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            const value = toReference(manual)
            if (value) lookup.mutate(value)
          }}
        >
          <Input
            value={manual}
            onChange={(event) => setManual(event.target.value)}
            placeholder="ADF-XXXXXXXX"
            aria-label="Registration reference"
          />
          <Button type="submit" variant="outline" disabled={busy}>
            Look up
          </Button>
        </form>
      </div>

      {message ? (
        <p className="rounded-lg bg-red-600 p-4 text-center text-lg font-bold text-white">
          {message.startsWith("No registration") ? "NOT REGISTERED" : "ERROR"}
          <span className="block text-sm font-normal">{message}</span>
        </p>
      ) : null}

      {ticket ? (
        <div className="space-y-3 rounded-lg border p-4">
          <p className="rounded-md bg-green-600 p-3 text-center text-lg font-bold text-white">
            REGISTERED
          </p>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">
                {[ticket.title, ticket.fullName].filter(Boolean).join(" ")}
              </p>
              <p className="text-sm text-muted-foreground">
                {ticket.jobTitle} · {ticket.organization}
              </p>
              <p className="text-sm text-muted-foreground">{ticket.country}</p>
            </div>
            <Badge variant="outline">{ticket.reference}</Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge>{ticket.passTier ?? "No pass"}</Badge>
            <Badge
              variant={
                ticket.paymentStatus === "pending" ? "destructive" : "secondary"
              }
            >
              Payment: {ticket.paymentStatus}
            </Badge>
          </div>

          {ticket.checkedInAt ? (
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-medium text-amber-600">
                <CheckCircle2Icon className="size-4" />
                Already checked in at{" "}
                {new Date(ticket.checkedInAt).toLocaleString()}
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => undo.mutate(ticket.reference)}
              >
                <UndoIcon className="mr-2 size-4" />
                Undo check-in
              </Button>
            </div>
          ) : (
            <Button
              disabled={busy}
              onClick={() => checkIn.mutate(ticket.reference)}
            >
              <CheckCircle2Icon className="mr-2 size-4" />
              Check in
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )
}
