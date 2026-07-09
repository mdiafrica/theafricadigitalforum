import * as React from "react"
import QRCode from "react-qr-code"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { totpCodeSchema } from "../model/account.schemas"
import { parseTotpUri } from "../model/totp-uri"
import { useTwoFactorSetup } from "../hooks/use-two-factor-setup"
import { PasswordConfirmForm } from "./password-confirm-form"

/**
 * The enable-2FA wizard: password → QR/URI → verify code → backup codes.
 * Steps are driven by the `useTwoFactorSetup` state machine owned by the card.
 */
export function EnableTwoFactorDialog({
  setup,
}: {
  setup: ReturnType<typeof useTwoFactorSetup>
}) {
  const isOpen = setup.step !== "idle"

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setup.reset()
      }}
    >
      <DialogContent>
        {setup.step === "password-prompt" && (
          <PasswordPromptStep
            onSubmit={setup.submitPassword}
            isPending={setup.isEnabling}
          />
        )}
        {setup.step === "showing-uri" && (
          <ShowUriStep totpUri={setup.totpUri} onNext={setup.proceedToVerify} />
        )}
        {setup.step === "verify-code" && (
          <VerifyCodeStep
            onVerify={setup.verify}
            isPending={setup.isVerifying}
          />
        )}
        {setup.step === "done" && (
          <DoneStep backupCodes={setup.backupCodes} onClose={setup.reset} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function PasswordPromptStep({
  onSubmit,
  isPending,
}: {
  onSubmit: (password: string) => void
  isPending: boolean
}) {
  return (
    <PasswordConfirmForm
      id="enable-2fa-password"
      title="Enable two-factor authentication"
      description="Enter your password to set up two-factor authentication with an authenticator app."
      submitLabel="Continue"
      autoFocus
      isPending={isPending}
      onConfirm={onSubmit}
    />
  )
}

function ShowUriStep({
  totpUri,
  onNext,
}: {
  totpUri: string
  onNext: () => void
}) {
  const { copied, copy } = useCopyToClipboard()
  const manualEntry = parseTotpUri(totpUri)

  return (
    <div className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Add to authenticator app</DialogTitle>
        <DialogDescription>
          Scan the QR code with Google Authenticator, Authy or 1Password — or
          enter the setup key manually.
        </DialogDescription>
      </DialogHeader>

      {totpUri && (
        <div className="flex justify-center rounded-lg border border-border bg-white p-4">
          <QRCode
            value={totpUri}
            size={176}
            bgColor="#FFFFFF"
            fgColor="#111111"
            className="h-auto w-full max-w-44"
          />
        </div>
      )}

      {manualEntry ? (
        <div className="grid gap-3">
          <ManualEntryField label="Setup key" value={manualEntry.secret} />
          <ManualEntryField label="Account" value={manualEntry.accountName} />
        </div>
      ) : (
        <div className="rounded-md border border-border bg-muted/50 p-3">
          <p className="font-mono text-xs leading-relaxed break-all select-all">
            {totpUri}
          </p>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => copy(totpUri)}
        className="self-end"
      >
        {copied ? "Copied" : "Copy URI"}
      </Button>

      <DialogFooter>
        <Button type="button" onClick={onNext}>
          I've added it — continue
        </Button>
      </DialogFooter>
    </div>
  )
}

function ManualEntryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="rounded-md border border-border bg-muted/50 p-3">
        <p className="font-mono text-xs leading-relaxed break-all select-all">
          {value}
        </p>
      </div>
    </div>
  )
}

function VerifyCodeStep({
  onVerify,
  isPending,
}: {
  onVerify: (code: string) => void
  isPending: boolean
}) {
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState("")

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const result = totpCodeSchema.safeParse({ code })
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid code.")
      return
    }
    setError("")
    onVerify(code)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Verify authenticator code</DialogTitle>
        <DialogDescription>
          Enter the 6-digit code from your authenticator app to confirm setup.
        </DialogDescription>
      </DialogHeader>

      <Field data-invalid={!!error}>
        <FieldLabel htmlFor="verify-2fa-code">Code</FieldLabel>
        <Input
          id="verify-2fa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          value={code}
          onChange={(event) => setCode(event.target.value)}
          disabled={isPending}
          className="text-center font-mono text-lg tracking-[0.5em]"
        />
        {error && <FieldError errors={[{ message: error }]} />}
      </Field>

      <DialogFooter>
        <Button type="submit" disabled={isPending || code.length !== 6}>
          {isPending && <Spinner />}
          Verify and enable
        </Button>
      </DialogFooter>
    </form>
  )
}

function DoneStep({
  backupCodes,
  onClose,
}: {
  backupCodes: string[]
  onClose: () => void
}) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <div className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Save your backup codes</DialogTitle>
        <DialogDescription>
          Each code works once if you lose access to your authenticator app.
          Store them somewhere safe — they won't be shown again.
        </DialogDescription>
      </DialogHeader>

      {backupCodes.length > 0 && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-md border border-border bg-muted/50 p-4">
          {backupCodes.map((backupCode) => (
            <p
              key={backupCode}
              className="font-mono text-sm leading-relaxed select-all"
            >
              {backupCode}
            </p>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => copy(backupCodes.join("\n"))}
        className="self-end"
      >
        {copied ? "Copied" : "Copy codes"}
      </Button>

      <DialogFooter>
        <Button type="button" onClick={onClose}>
          Done
        </Button>
      </DialogFooter>
    </div>
  )
}
