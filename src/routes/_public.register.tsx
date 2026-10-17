import { useEffect, useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { useMutation } from "@tanstack/react-query"
import {
  Building2,
  CalendarDays,
  Check,
  Info,
  MapPin,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { getLocale } from "@/paraglide/runtime"
import { pageHead } from "@/lib/seo"
import {
  trCountry,
  trTitle,
  tr,
} from "@/domains/registrations/registrations.i18n"
import {
  COUNTRIES,
  EVENT_AUDIENCE,
  EVENT_DATES,
  EVENT_HOST,
  EVENT_LOCATION,
  INTEREST_AREAS,
  OTHER_PREFIX,
  PARTICIPATION_TYPES,
  PARTNERSHIP_OPTIONS,
  PASS_COMPARISON,
  PASS_TIERS,
  PRIMARY_GOALS,
  registrationInput,
  submitRegistration,
  TITLES,
  validateRegistrationCode,
  type PassTierId,
} from "@/domains/registrations"
import { Reveal } from "@/components/motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import heroBg from "@/assets/images/Image4.jpg"

const PAGE_TITLE = "Africa Digital Forum (ADF) Registration"
const PAGE_DESCRIPTION =
  "Join the premier continental platform shaping digital transformation, artificial intelligence, innovation, and technological sovereignty in Africa."

export const Route = createFileRoute("/_public/register")({
  head: () => ({
    ...pageHead({
      title: `${tr(PAGE_TITLE)} | Africa Digital Forum`,
      description: tr(PAGE_DESCRIPTION),
      path: "/register",
      locale: getLocale(),
    }),
  }),
  component: RegisterRoute,
  validateSearch: (
    search: Record<string, unknown>
  ): { payment?: "success" | "cancelled"; ref?: string } => ({
    payment:
      search.payment === "success" || search.payment === "cancelled"
        ? search.payment
        : undefined,
    ref: typeof search.ref === "string" ? search.ref.slice(0, 40) : undefined,
  }),
})

const INPUT_CLASS =
  "h-auto rounded-lg border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#111111] placeholder:text-[#a0aec0] focus-visible:border-primary focus-visible:bg-white focus-visible:ring-primary/[0.12] dark:border-[#e2e8f0] dark:bg-[#f8fafc]"
const LABEL_CLASS =
  "mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-[#2d3748] uppercase"

const STEPS = ["Your Details", "Your Interests", "Consent"] as const

/** Form fields validated when leaving each step. */
const STEP_FIELDS = [
  [
    "title",
    "fullName",
    "email",
    "jobTitle",
    "organization",
    "country",
    "nationality",
    "linkedinUrl",
  ],
  ["interestAreas", "participationType", "primaryGoal"],
  ["partnershipInterest", "communicationsConsent", "termsAccepted"],
] as const

interface FormValues {
  title: string
  fullName: string
  email: string
  jobTitle: string
  organization: string
  country: string
  nationality: string
  linkedinUrl: string
  passTier: PassTierId | ""
  interestAreas: string[]
  participationType: string
  primaryGoal: string
  partnershipInterest: string
  communicationsConsent: boolean
  termsAccepted: boolean
  accessCode: string
}

const INITIAL_VALUES: FormValues = {
  title: "",
  fullName: "",
  email: "",
  jobTitle: "",
  organization: "",
  country: "",
  nationality: "",
  linkedinUrl: "",
  passTier: "",
  interestAreas: [],
  participationType: "",
  primaryGoal: "",
  partnershipInterest: "",
  communicationsConsent: false,
  termsAccepted: false,
  accessCode: "",
}

type Errors = Partial<Record<keyof FormValues, string>>

interface AppliedCode {
  code: string
  label: string
  passTier: PassTierId | null
}

function RegisterRoute() {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [values.passTier])
  const [errors, setErrors] = useState<Errors>({})
  const [reference, setReference] = useState<string | null>(null)
  const [waived, setWaived] = useState(false)
  const [appliedCode, setAppliedCode] = useState<AppliedCode | null>(null)
  const search = Route.useSearch()
  const paidReference =
    search.payment === "success" && search.ref ? search.ref : null

  const submit = useMutation({
    mutationFn: (data: ReturnType<typeof registrationInput.parse>) =>
      submitRegistration({ data }),
    onSuccess: (result) => {
      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl)
        return
      }
      setReference(result.reference)
      setWaived(result.waived)
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    onError: (error) =>
      toast.error(tr("We could not complete your registration"), {
        description:
          error instanceof Error ? tr(error.message) : tr("Please try again."),
      }),
  })

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  /** Returns true when every field of the step passes validation. */
  const validateStep = (index: number) => {
    const result = registrationInput.safeParse(values)
    if (result.success) return true

    const stepErrors: Errors = {}
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof FormValues
      if (
        (STEP_FIELDS[index] as ReadonlyArray<string>).includes(key) &&
        !stepErrors[key]
      ) {
        stepErrors[key] = tr(issue.message)
      }
    }
    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const next = () => {
    if (!validateStep(step)) return
    setStep((current) => current + 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const back = () => setStep((current) => Math.max(0, current - 1))

  const finish = () => {
    if (!validateStep(step)) return
    const parsed = registrationInput.safeParse({
      ...values,
      locale: getLocale(),
      accessCode: appliedCode?.code ?? "",
    })
    if (parsed.success) submit.mutate(parsed.data)
  }

  return (
    <div className="bg-black font-nav">
      <section
        className="relative -mt-[85px] flex min-h-[405px] items-center justify-center overflow-hidden bg-cover bg-center pt-[105px] pb-8 text-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative px-5">
          <Reveal>
            <h1 className="mb-3 text-[clamp(30px,4vw,52px)] leading-[1.1] font-extrabold tracking-[0.05em] text-white">
              {tr(PAGE_TITLE)}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto max-w-[680px] text-base leading-[1.6] text-white/85">
              {tr(PAGE_DESCRIPTION)}
            </p>
          </Reveal>
        </div>
      </section>

      <div className="relative z-[2] mx-auto -mt-16 max-w-[1100px] px-[5%] pb-20">
        {reference || paidReference ? (
          <Confirmation
            reference={(reference ?? paidReference)!}
            waived={waived}
            paid={Boolean(paidReference) && !reference}
          />
        ) : (
          <>
            {search.payment === "cancelled" && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-[1.7] text-amber-950">
                <strong>{tr("Payment not completed")}</strong>
                <p className="mt-1">
                  {tr(
                    "Your registration was saved but the payment was not completed. Our team will contact you, or you can register again to pay now."
                  )}
                </p>
              </div>
            )}
            {!values.passTier && (
              <>
                <EventSummary />
                <PassComparison
                  values={values}
                  set={set}
                  appliedCode={appliedCode}
                  onCodeChange={setAppliedCode}
                />
              </>
            )}

            {values.passTier && (
              <Reveal delay={0.1}>
                <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_48px_rgba(0,0,0,0.25)]">
                  <Stepper current={step} />
                  <div className="px-6 py-9 sm:px-10 sm:py-12">
                    <div className="mb-8 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-[1.7] text-amber-950">
                      <Info className="mt-0.5 size-5 shrink-0 text-amber-700" />
                      <div>
                        <strong className="text-amber-950">
                          {appliedCode
                            ? tr("No payment required")
                            : tr("Secure online payment")}
                        </strong>
                        <p className="mt-1">
                          {tr(
                            appliedCode
                              ? "{name} selected. Your access code covers this pass."
                              : "{name} selected. After the last step you will be taken to Stripe's secure checkout to pay {price}.",
                            {
                              name: tr(
                                PASS_TIERS.find(
                                  (tier) => tier.id === values.passTier
                                )?.name ?? ""
                              ),
                              price: `$${PASS_TIERS.find((tier) => tier.id === values.passTier)?.price ?? ""}`,
                            }
                          )}
                        </p>
                        <button
                          type="button"
                          className="mt-1 font-semibold text-[#7c3aed] underline"
                          onClick={() => {
                            set("passTier", "")
                            setAppliedCode(null)
                            setStep(0)
                          }}
                        >
                          {tr("Change pass")}
                        </button>
                      </div>
                    </div>
                    {step === 0 && (
                      <StepDetails values={values} errors={errors} set={set} />
                    )}
                    {step === 1 && (
                      <StepInterests
                        values={values}
                        errors={errors}
                        set={set}
                      />
                    )}
                    {step === 2 && (
                      <StepConsent values={values} errors={errors} set={set} />
                    )}

                    <div className="mt-10 flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (step === 0) {
                            set("passTier", "")
                            setAppliedCode(null)
                          } else back()
                        }}
                        disabled={submit.isPending}
                        className="h-auto px-6 py-3 text-sm font-bold text-[#111111] dark:text-[#111111]"
                      >
                        {tr("Back")}
                      </Button>
                      {step < STEPS.length - 1 ? (
                        <Button
                          type="button"
                          onClick={next}
                          className="h-auto px-8 py-3 text-sm font-bold"
                        >
                          {tr("Continue")}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={finish}
                          disabled={submit.isPending}
                          className="h-auto px-8 py-3 text-sm font-bold"
                        >
                          {submit.isPending && <Spinner />}
                          {appliedCode
                            ? tr("Complete registration")
                            : tr("Continue to payment")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EventSummary() {
  const items = [
    { label: "Dates", value: EVENT_DATES, icon: CalendarDays },
    { label: "Location", value: EVENT_LOCATION, icon: MapPin },
    { label: "Host Organization", value: EVENT_HOST, icon: Building2 },
    { label: "Expected Audience", value: EVENT_AUDIENCE, icon: Users },
  ]

  return (
    <Reveal>
      <div className="grid gap-px overflow-hidden rounded-2xl bg-white/10 shadow-[0_8px_48px_rgba(0,0,0,0.35)] ring-1 ring-white/10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_2fr]">
        {items.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className={cn(
              "flex items-start gap-4 bg-[#0f1115]/95 p-6 backdrop-blur",
              label === "Expected Audience" && "sm:col-span-2 lg:col-span-1"
            )}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <div className="mb-1 text-[11px] font-bold tracking-[0.12em] text-white/50 uppercase">
                {tr(label)}
              </div>
              <div className="text-[15px] leading-[1.5] font-semibold text-white">
                {tr(value)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  )
}

function PassComparison({
  values,
  set,
  error,
  appliedCode,
  onCodeChange,
}: {
  values: FormValues
  set: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void
  error?: string
  appliedCode: AppliedCode | null
  onCodeChange: (code: AppliedCode | null) => void
}) {
  const [checking, setChecking] = useState(false)
  const [codeOpen, setCodeOpen] = useState(false)
  const locked = appliedCode?.passTier ?? null

  const applyCode = async () => {
    const code = values.accessCode.trim().toUpperCase()
    if (!code) return
    setChecking(true)
    try {
      const result = await validateRegistrationCode({ data: { code } })
      const passTier = (result.passTier as PassTierId | null) ?? null
      onCodeChange({ code, label: result.label, passTier })
      if (passTier) set("passTier", passTier)
      set("accessCode", code)
    } catch (err) {
      onCodeChange(null)
      toast.error(
        err instanceof Error
          ? tr(err.message)
          : tr("Could not check this code.")
      )
    } finally {
      setChecking(false)
    }
  }

  const clearCode = () => {
    onCodeChange(null)
    set("accessCode", "")
  }

  return (
    <Reveal delay={0.05}>
      <section className="mt-10">
        <h2 className="mb-2 text-[26px] font-extrabold tracking-[0.03em] text-white">
          {tr("Choose Your Pass")}
        </h2>
        <p className="mb-6 text-sm text-white/70">
          {tr(
            "Select the participation tier that best aligns with your goals, or use an access code. The registration form appears once you choose."
          )}
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {PASS_TIERS.map((tier, tierIndex) => {
            const selected = values.passTier === tier.id
            const disabled = locked !== null && locked !== tier.id
            const popular = tier.id === "executive"
            return (
              <button
                key={tier.id}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => set("passTier", tier.id)}
                className={cn(
                  "group relative flex cursor-pointer flex-col rounded-2xl border-2 p-5 text-left transition",
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-white/[0.04] hover:border-primary/60",
                  popular &&
                    !selected &&
                    "border-primary/50 shadow-[0_0_32px_-8px_var(--primary)]",
                  disabled &&
                    "cursor-not-allowed opacity-40 hover:border-white/10"
                )}
              >
                {popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-1 text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-white uppercase shadow-lg">
                    ★ {tr("Most Popular")}
                  </span>
                )}
                <div className="text-lg font-bold text-white">
                  {tr(tier.name)}
                </div>
                <div className="mb-3 text-2xl font-extrabold text-primary">
                  ${tier.price}
                </div>
                <p className="mb-4 text-[13px] leading-[1.7] text-white/70">
                  {tr(tier.audience)}
                </p>
                <ul className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-4 text-[13px] leading-[1.4]">
                  {PASS_COMPARISON.map(([feature, ...cells]) => (
                    <li key={feature} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>
                        <span className="block text-[11px] tracking-[0.06em] text-white/50 uppercase">
                          {tr(feature)}
                        </span>
                        <span className="font-semibold text-white">
                          {tr(cells[tierIndex])}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <span
                  className={cn(
                    "mt-5 rounded-lg px-4 py-2 text-center text-sm font-bold transition",
                    selected
                      ? "bg-white text-primary"
                      : "bg-primary text-white group-hover:brightness-110"
                  )}
                >
                  {selected
                    ? tr("Selected")
                    : tr("Select {name}", { name: tr(tier.name) })}
                </span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          aria-pressed={codeOpen}
          onClick={() => {
            if (codeOpen && appliedCode) clearCode()
            setCodeOpen((open) => !open)
          }}
          className={cn(
            "mt-4 flex w-full cursor-pointer flex-col gap-1 rounded-2xl border-2 border-dashed p-5 text-left transition sm:flex-row sm:items-center sm:justify-between",
            codeOpen
              ? "border-primary bg-primary/10"
              : "border-white/25 hover:border-primary/60"
          )}
        >
          <span>
            <span className="block text-lg font-bold text-white">
              {tr("I have an access code")}
            </span>
            <span className="text-[13px] text-white/70">
              {tr(
                "For the ADF team, partners and organizations that registered on your behalf. Payment is waived."
              )}
            </span>
          </span>
          <span className="text-2xl font-extrabold text-primary">
            {tr("Free")}
          </span>
        </button>

        {codeOpen && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            {appliedCode ? (
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white">
                <span>
                  <Check className="mr-1.5 inline size-4 text-primary" />
                  {tr("Code {code} applied", { code: appliedCode.code })}
                  {appliedCode.label ? ` (${appliedCode.label})` : ""}
                  {tr(". No payment is required")}
                  {appliedCode.passTier
                    ? "."
                    : tr(" — now pick your pass above.")}
                </span>
                <button
                  type="button"
                  onClick={clearCode}
                  className="text-xs font-bold text-primary underline"
                >
                  {tr("Remove")}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Input
                  id="accessCode"
                  aria-label={tr("Access code")}
                  value={values.accessCode}
                  onChange={(event) => set("accessCode", event.target.value)}
                  placeholder={tr("Enter your access code")}
                  className={cn(
                    INPUT_CLASS,
                    "max-w-xs border-2 border-primary uppercase focus-visible:border-primary focus-visible:ring-primary/40"
                  )}
                  autoComplete="off"
                />
                <Button
                  type="button"
                  onClick={applyCode}
                  disabled={checking || !values.accessCode.trim()}
                  className="h-auto px-5 py-2.5 text-sm font-bold"
                >
                  {checking && <Spinner />}
                  {tr("Apply")}
                </Button>
              </div>
            )}
          </div>
        )}
        <FieldError message={error} />

        {!values.passTier && (
          <p className="mt-5 text-center text-sm text-white/60">
            {tr("Choose a pass above to continue to the registration form.")}
          </p>
        )}
      </section>
    </Reveal>
  )
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="grid grid-cols-4 border-b border-[#eaeef5] bg-[#f8fafc]">
      {STEPS.map((label, index) => {
        const done = index < current
        const active = index === current
        return (
          <li
            key={label}
            className={cn(
              "flex flex-col items-center gap-1.5 border-b-2 px-2 py-4 text-center sm:flex-row sm:justify-center sm:gap-2.5",
              active ? "border-primary" : "border-transparent"
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                done || active
                  ? "bg-primary text-white"
                  : "bg-[#e2e8f0] text-[#4a5568]"
              )}
            >
              {done ? <Check className="size-4" /> : index + 1}
            </span>
            <span
              className={cn(
                "text-[10px] font-bold tracking-[0.06em] uppercase sm:text-[11px]",
                active ? "text-[#111111]" : "text-[#718096]"
              )}
            >
              {tr(label)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

interface StepProps {
  values: FormValues
  errors: Errors
  set: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
      {message}
    </p>
  )
}

function Checkbox({
  className,
  checked,
  onCheckedChange,
}: {
  className?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onCheckedChange(event.target.checked)}
      className={cn("adf-choice", className)}
    />
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-7 text-[24px] font-extrabold tracking-[-0.02em] text-[#111111]">
      {children}
    </h2>
  )
}

function TextField({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  optional,
  values,
  errors,
  set,
}: StepProps & {
  id: "fullName" | "email" | "jobTitle" | "organization" | "linkedinUrl"
  label: string
  type?: string
  placeholder?: string
  autoComplete?: string
  optional?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {tr(label)}
        {optional && (
          <span className="ml-1 font-medium normal-case opacity-60">
            {tr("(optional)")}
          </span>
        )}
      </label>
      <Input
        id={id}
        type={type}
        value={values[id]}
        onChange={(event) => set(id, event.target.value)}
        placeholder={placeholder ? tr(placeholder) : undefined}
        autoComplete={autoComplete}
        aria-invalid={Boolean(errors[id])}
        className={INPUT_CLASS}
      />
      <FieldError message={errors[id]} />
    </div>
  )
}

function TitleField({ values, set }: StepProps) {
  const [custom, setCustom] = useState(
    Boolean(values.title) &&
      !(TITLES as ReadonlyArray<string>).includes(values.title)
  )

  return (
    <div>
      <label htmlFor="title" className={LABEL_CLASS}>
        {tr("Title")}
        <span className="ml-1 font-medium normal-case opacity-60">
          {tr("(optional)")}
        </span>
      </label>
      <select
        id="title"
        value={custom ? "__other" : values.title}
        onChange={(event) => {
          const value = event.target.value
          setCustom(value === "__other")
          set("title", value === "__other" ? "" : value)
        }}
        className={cn(
          INPUT_CLASS,
          "w-full rounded-lg border px-3.5 py-2.5 outline-none focus:border-primary"
        )}
      >
        <option value="">{tr("No title")}</option>
        {TITLES.map((title) => (
          <option key={title} value={title}>
            {trTitle(title)}
          </option>
        ))}
        <option value="__other">{tr("Other…")}</option>
      </select>
      {custom && (
        <Input
          aria-label={tr("Your title")}
          value={values.title}
          maxLength={40}
          onChange={(event) => set("title", event.target.value)}
          placeholder={tr("Type your title")}
          className={cn(INPUT_CLASS, "mt-2")}
        />
      )}
    </div>
  )
}

function StepDetails(props: StepProps) {
  const { values, errors, set } = props

  return (
    <div>
      <SectionTitle>{tr("Personal & Professional Information")}</SectionTitle>
      <div className="grid gap-5 sm:grid-cols-2">
        <TitleField {...props} />
        <TextField
          {...props}
          id="fullName"
          label="Full Name"
          placeholder={tr("First and last name")}
          autoComplete="name"
        />
        <TextField
          {...props}
          id="email"
          label="Business Email"
          type="email"
          placeholder={tr("you@organization.com")}
          autoComplete="email"
        />
        <TextField
          {...props}
          id="jobTitle"
          label="Job Title"
          autoComplete="organization-title"
        />
        <TextField
          {...props}
          id="organization"
          label="Organization / Company"
          autoComplete="organization"
        />
        <div>
          <label htmlFor="country" className={LABEL_CLASS}>
            {tr("Country of Residence")}
          </label>
          <select
            id="country"
            value={values.country}
            onChange={(event) => set("country", event.target.value)}
            aria-invalid={Boolean(errors.country)}
            className={cn(
              INPUT_CLASS,
              "w-full rounded-lg border px-3.5 py-2.5 outline-none focus:border-primary"
            )}
          >
            <option value="">{tr("Select a country")}</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {trCountry(country)}
              </option>
            ))}
          </select>
          <FieldError message={errors.country} />
        </div>
        <div>
          <label htmlFor="nationality" className={LABEL_CLASS}>
            {tr("Country of Nationality")}
          </label>
          <select
            id="nationality"
            value={values.nationality}
            onChange={(event) => set("nationality", event.target.value)}
            aria-invalid={Boolean(errors.nationality)}
            className={cn(
              INPUT_CLASS,
              "w-full rounded-lg border px-3.5 py-2.5 outline-none focus:border-primary"
            )}
          >
            <option value="">{tr("Select a country")}</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {trCountry(country)}
              </option>
            ))}
          </select>
          <FieldError message={errors.nationality} />
        </div>
        <TextField
          {...props}
          id="linkedinUrl"
          label="LinkedIn Profile URL"
          type="url"
          placeholder="https://linkedin.com/in/your-profile"
          optional
        />
      </div>
    </div>
  )
}

function OtherInput({
  value,
  onChange,
  invalid,
}: {
  value: string
  onChange: (text: string) => void
  invalid?: boolean
}) {
  return (
    <input
      type="text"
      autoFocus
      maxLength={200}
      value={value.slice(OTHER_PREFIX.length)}
      onChange={(event) => onChange(OTHER_PREFIX + event.target.value)}
      placeholder={tr("Please tell us what you have in mind")}
      aria-invalid={invalid || undefined}
      className="mt-2 w-full rounded-lg border-2 border-primary/60 px-3 py-2 text-sm text-[#2d3748] outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
    />
  )
}

function RadioGroup({
  legend,
  name,
  options,
  value,
  error,
  onChange,
  allowOther,
}: {
  legend: string
  name: string
  options: ReadonlyArray<string>
  value: string
  error?: string
  onChange: (value: string) => void
  allowOther?: boolean
}) {
  const otherSelected = value.startsWith("Other:")

  return (
    <fieldset className="mb-8">
      <legend className={LABEL_CLASS}>{tr(legend)}</legend>
      <div className="flex flex-col gap-2.5">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-3 text-sm text-[#2d3748]"
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="adf-choice"
            />
            {tr(option)}
          </label>
        ))}
        {allowOther && (
          <div>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-[#2d3748]">
              <input
                type="radio"
                name={name}
                value="Other"
                checked={otherSelected}
                onChange={() => onChange(OTHER_PREFIX)}
                className="adf-choice"
              />
              {tr("Other")}
            </label>
            {otherSelected && (
              <OtherInput value={value} onChange={onChange} invalid={!!error} />
            )}
          </div>
        )}
      </div>
      <FieldError message={error} />
    </fieldset>
  )
}

function StepInterests({ values, errors, set }: StepProps) {
  const toggle = (area: string, checked: boolean) =>
    set(
      "interestAreas",
      checked
        ? [...values.interestAreas, area]
        : values.interestAreas.filter((item) => item !== area)
    )
  const otherValue = values.interestAreas.find((item) =>
    item.startsWith("Other:")
  )
  const setOther = (text: string | null) =>
    set("interestAreas", [
      ...values.interestAreas.filter((item) => !item.startsWith("Other:")),
      ...(text === null ? [] : [text]),
    ])

  return (
    <div>
      <SectionTitle>
        {tr("Participation Profile & Area of Interest")}
      </SectionTitle>

      <fieldset className="mb-8">
        <legend className={LABEL_CLASS}>
          {tr("Primary Interest Area (select all that apply)")}
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {INTEREST_AREAS.map((area) => (
            <label
              key={area}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#2d3748]"
            >
              <Checkbox
                checked={values.interestAreas.includes(area)}
                onCheckedChange={(checked) => toggle(area, checked === true)}
              />
              {tr(area)}
            </label>
          ))}
          <div>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-[#2d3748]">
              <Checkbox
                checked={otherValue !== undefined}
                onCheckedChange={(checked) =>
                  setOther(checked === true ? OTHER_PREFIX : null)
                }
              />
              {tr("Other")}
            </label>
            {otherValue !== undefined && (
              <OtherInput
                value={otherValue}
                onChange={setOther}
                invalid={!!errors.interestAreas}
              />
            )}
          </div>
        </div>
        <FieldError message={errors.interestAreas} />
      </fieldset>

      <RadioGroup
        legend="How do you wish to participate?"
        name="participationType"
        options={PARTICIPATION_TYPES}
        allowOther
        value={values.participationType}
        error={errors.participationType}
        onChange={(value) => set("participationType", value)}
      />
      <RadioGroup
        legend="Primary Goal for Attending"
        name="primaryGoal"
        options={PRIMARY_GOALS}
        allowOther
        value={values.primaryGoal}
        error={errors.primaryGoal}
        onChange={(value) => set("primaryGoal", value)}
      />
    </div>
  )
}

function StepConsent({ values, errors, set }: StepProps) {
  return (
    <div>
      <SectionTitle>{tr("Sponsorship Interest & Data Consent")}</SectionTitle>

      <RadioGroup
        legend="Would you like to receive information regarding specific partnership tiers?"
        name="partnershipInterest"
        options={PARTNERSHIP_OPTIONS}
        value={values.partnershipInterest}
        error={errors.partnershipInterest}
        onChange={(value) => set("partnershipInterest", value)}
      />

      <div className="flex flex-col gap-4">
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-[1.6] text-[#2d3748]">
            <Checkbox
              className="mt-0.5"
              checked={values.communicationsConsent}
              onCheckedChange={(checked) =>
                set("communicationsConsent", checked === true)
              }
            />
            <span>
              <strong>{tr("Data Consent:")}</strong>{" "}
              {tr(
                "I agree to receive official communications from the Media and Digital Institute (MDI) regarding ADF and related initiatives."
              )}
            </span>
          </label>
          <FieldError message={errors.communicationsConsent} />
        </div>
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-[1.6] text-[#2d3748]">
            <Checkbox
              className="mt-0.5"
              checked={values.termsAccepted}
              onCheckedChange={(checked) =>
                set("termsAccepted", checked === true)
              }
            />
            <span>
              <strong>{tr("Terms Acceptance:")}</strong>{" "}
              {tr("I accept the Africa Digital Forum")}{" "}
              <Link
                to="/privacy"
                target="_blank"
                className="text-primary underline"
              >
                {tr("Privacy Policy")}
              </Link>{" "}
              {tr("and")}{" "}
              <Link
                to="/terms"
                target="_blank"
                className="text-primary underline"
              >
                {tr("Event Terms of Use")}
              </Link>
              .
            </span>
          </label>
          <FieldError message={errors.termsAccepted} />
        </div>
      </div>
    </div>
  )
}

function Confirmation({
  reference,
  waived,
  paid,
}: {
  reference: string
  waived: boolean
  paid: boolean
}) {
  const confirmed = waived || paid
  return (
    <Reveal>
      <div className="rounded-2xl bg-white px-6 py-10 shadow-[0_8px_48px_rgba(0,0,0,0.25)] sm:px-12 sm:py-14">
        <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-7" />
        </div>
        <h2 className="mb-3 text-[clamp(24px,3vw,34px)] font-extrabold tracking-[-0.02em] text-[#111111]">
          {confirmed
            ? tr("Registration confirmed! Welcome to ADF.")
            : tr("Your pass is reserved!")}
        </h2>
        <p className="mb-2 text-[15px] leading-[1.7] text-[#2d3748]">
          {tr("Thank you for registering for the Africa Digital Forum!")}
        </p>
        <p className="mb-6 text-[15px] leading-[1.7] text-[#4a5568]">
          {tr(
            paid
              ? "Your payment was received and your participation pass is confirmed. A confirmation email with your QR ticket is on its way to your email address."
              : waived
                ? "Your participation pass is confirmed, and no payment is required. A confirmation email has been sent to your email address."
                : "Your participation pass reservation is confirmed. No payment has been taken. Our team will email you payment instructions. A confirmation email has been sent to your email address."
          )}
        </p>
        <div className="mb-8 inline-block rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-sm text-[#2d3748]">
          {tr("Registration reference:")}{" "}
          <strong className="tracking-[0.06em]">{reference}</strong>
        </div>

        <h3 className="mb-3 text-sm font-bold tracking-[0.08em] text-[#111111] uppercase">
          {tr("Next Steps")}
        </h3>
        <ul className="flex flex-col gap-3 text-[14px] leading-[1.7] text-[#4a5568]">
          <li>
            <strong className="text-[#111111]">
              {tr("Official Program:")}
            </strong>{" "}
            {tr(
              "The complete speaker schedule and breakout agenda will be published ahead of the event."
            )}
          </li>
          <li>
            <strong className="text-[#111111]">{tr("B2B Matchmaking:")}</strong>{" "}
            {tr(
              "You will receive an invitation link to download the official ADF Networking Mobile App closer to the event date."
            )}
          </li>
          <li>
            <strong className="text-[#111111]">{tr("Inquiries:")}</strong>{" "}
            {tr(
              "For assistance with any requests or administrative questions, please contact our secretariat at"
            )}{" "}
            <a
              href="mailto:contact@theafricadigitalforum.com"
              className="text-primary underline"
            >
              contact@theafricadigitalforum.com
            </a>
            .
          </li>
        </ul>
      </div>
    </Reveal>
  )
}
