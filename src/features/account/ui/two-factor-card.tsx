import * as React from "react"
import { ShieldCheckIcon, ShieldOffIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { useTwoFactorSetup } from "../hooks/use-two-factor-setup"
import { EnableTwoFactorDialog } from "./enable-two-factor-dialog"
import { PasswordConfirmForm } from "./password-confirm-form"

export function TwoFactorCard({ enabled }: { enabled: boolean }) {
  const setup = useTwoFactorSetup()
  const [disableOpen, setDisableOpen] = React.useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle>Two-factor authentication</CardTitle>
            <CardDescription>
              A 6-digit code from your authenticator app is required at sign-in.
            </CardDescription>
          </div>
          <Badge variant={enabled ? "default" : "secondary"}>
            {enabled ? (
              <>
                <ShieldCheckIcon className="size-3.5" /> Enabled
              </>
            ) : (
              <>
                <ShieldOffIcon className="size-3.5" /> Off
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {enabled ? (
          <Button
            variant="destructive"
            onClick={() => setDisableOpen(true)}
            disabled={setup.isDisabling}
          >
            {setup.isDisabling && <Spinner />}
            Disable 2FA
          </Button>
        ) : (
          <Button onClick={setup.start}>Enable 2FA</Button>
        )}
      </CardContent>

      <EnableTwoFactorDialog setup={setup} />
      <DisableTwoFactorDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
        onDisable={(password) => {
          setup.disable(password)
          setDisableOpen(false)
        }}
        isPending={setup.isDisabling}
      />
    </Card>
  )
}

function DisableTwoFactorDialog({
  open,
  onOpenChange,
  onDisable,
  isPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDisable: (password: string) => void
  isPending: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <PasswordConfirmForm
          id="disable-2fa-password"
          title="Disable two-factor authentication"
          description="Enter your password to confirm disabling 2FA. This makes your account less secure."
          submitLabel="Disable 2FA"
          submitVariant="destructive"
          isPending={isPending}
          onConfirm={onDisable}
        />
      </DialogContent>
    </Dialog>
  )
}
