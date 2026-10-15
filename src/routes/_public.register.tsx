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
  COUNTRIES,
  EVENT_AUDIENCE,
  EVENT_DATES,
  EVENT_HOST,
  EVENT_LOCATION,
  INTEREST_AREAS,
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
      title: `${PAGE_TITLE} | Africa Digital Forum`,
      description: PAGE_DESCRIPTION,
      path: "/register",
      locale: getLocale(),
    }),
  }),
  component: RegisterRoute,
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

  const submit = useMutation({
    mutationFn: (data: ReturnType<typeof registrationInput.parse>) =>
      submitRegistration({ data }),
    onSuccess: (result) => {
      setReference(result.reference)
      setWaived(result.waived)
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    onError: (error) =>
      toast.error("We could not complete your registration", {
        description:
          error instanceof Error ? error.message : "Please try again.",
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
        stepErrors[key] = issue.message
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
              {PAGE_TITLE}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto max-w-[680px] text-base leading-[1.6] text-white/85">
              {PAGE_DESCRIPTION}
            </p>
          </Reveal>
        </div>
      </section>

      <div className="relative z-[2] mx-auto -mt-16 max-w-[1100px] px-[5%] pb-20">
        {reference ? (
          <Confirmation reference={reference} waived={waived} />
        ) : (
          <>
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
                            ? "No payment required"
                            : "Online payment is not available yet"}
                        </strong>
                        <p className="mt-1">
                          {appliedCode
                            ? `${PASS_TIERS.find((tier) => tier.id === values.passTier)?.name} selected. Your access code covers this pass.`
                            : `${PASS_TIERS.find((tier) => tier.id === values.passTier)?.name} selected. You can still reserve it now; our team will email you payment instructions. No payment will be taken online at this stage.`}
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
                          Change pass
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
                        Back
                      </Button>
                      {step < STEPS.length - 1 ? (
                        <Button
                          type="button"
                          onClick={next}
                          className="h-auto px-8 py-3 text-sm font-bold"
                        >
                          Continue
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
                            ? "Complete registration"
                            : "Reserve my pass"}
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
                {label}
              </div>
              <div className="text-[15px] leading-[1.5] font-semibold text-white">
                {value}
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
        err instanceof Error ? err.message : "Could not check this code."
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
          Choose Your Pass
        </h2>
        <p className="mb-6 text-sm text-white/70">
          Select the participation tier that best aligns with your goals, or use
          an access code. The registration form appears once you choose.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {PASS_TIERS.map((tier, tierIndex) => {
            const selected = values.passTier === tier.id
            const disabled = locked !== null && locked !== tier.id
            return (
              <button
                key={tier.id}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => set("passTier", tier.id)}
                className={cn(
                  "flex cursor-pointer flex-col rounded-2xl border-2 p-5 text-left transition",
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-white/[0.04] hover:border-primary/60",
                  disabled &&
                    "cursor-not-allowed opacity-40 hover:border-white/10"
                )}
              >
                <div className="text-lg font-bold text-white">{tier.name}</div>
                <div className="mb-3 text-2xl font-extrabold text-primary">
                  ${tier.price}
                </div>
                <p className="mb-4 text-[13px] leading-[1.7] text-white/70">
                  {tier.audience}
                </p>
                <ul className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-4 text-[13px] leading-[1.4]">
                  {PASS_COMPARISON.map(([feature, ...cells]) => (
                    <li key={feature} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>
                        <span className="block text-[11px] tracking-[0.06em] text-white/50 uppercase">
                          {feature}
                        </span>
                        <span className="font-semibold text-white">
                          {cells[tierIndex]}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <span
                  className={cn(
                    "mt-5 rounded-lg px-4 py-2 text-center text-sm font-bold",
                    selected
                      ? "bg-primary text-white"
                      : "border border-white/20 text-white"
                  )}
                >
                  {selected ? "Selected" : `Select ${tier.name}`}
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
              I have an access code
            </span>
            <span className="text-[13px] text-white/70">
              For the ADF team, partners and organizations that registered on
              your behalf. Payment is waived.
            </span>
          </span>
          <span className="text-2xl font-extrabold text-primary">Free</span>
        </button>

        {codeOpen && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            {appliedCode ? (
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white">
                <span>
                  <Check className="mr-1.5 inline size-4 text-primary" />
                  Code <strong>{appliedCode.code}</strong> applied
                  {appliedCode.label ? ` (${appliedCode.label})` : ""}. No
                  payment is required
                  {appliedCode.passTier ? "." : " — now pick your pass above."}
                </span>
                <button
                  type="button"
                  onClick={clearCode}
                  className="text-xs font-bold text-primary underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Input
                  id="accessCode"
                  aria-label="Access code"
                  value={values.accessCode}
                  onChange={(event) => set("accessCode", event.target.value)}
                  placeholder="Enter your access code"
                  className={cn(INPUT_CLASS, "max-w-xs uppercase")}
                  autoComplete="off"
                />
                <Button
                  type="button"
                  onClick={applyCode}
                  disabled={checking || !values.accessCode.trim()}
                  className="h-auto px-5 py-2.5 text-sm font-bold"
                >
                  {checking && <Spinner />}
                  Apply
                </Button>
              </div>
            )}
          </div>
        )}
        <FieldError message={error} />

        {!values.passTier && (
          <p className="mt-5 text-center text-sm text-white/60">
            Choose a pass above to continue to the registration form.
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
              {label}
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
      className={cn("size-4 shrink-0 accent-[#7c3aed]", className)}
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
        {label}
        {optional && (
          <span className="ml-1 font-medium normal-case opacity-60">
            (optional)
          </span>
        )}
      </label>
      <Input
        id={id}
        type={type}
        value={values[id]}
        onChange={(event) => set(id, event.target.value)}
        placeholder={placeholder}
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
        Title
        <span className="ml-1 font-medium normal-case opacity-60">
          (optional)
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
        <option value="">No title</option>
        {TITLES.map((title) => (
          <option key={title} value={title}>
            {title}
          </option>
        ))}
        <option value="__other">Other…</option>
      </select>
      {custom && (
        <Input
          aria-label="Your title"
          value={values.title}
          maxLength={40}
          onChange={(event) => set("title", event.target.value)}
          placeholder="Type your title"
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
      <SectionTitle>Personal &amp; Professional Information</SectionTitle>
      <div className="grid gap-5 sm:grid-cols-2">
        <TitleField {...props} />
        <TextField
          {...props}
          id="fullName"
          label="Full Name"
          placeholder="First and last name"
          autoComplete="name"
        />
        <TextField
          {...props}
          id="email"
          label="Business Email"
          type="email"
          placeholder="you@organization.com"
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
            Country of Residence
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
            <option value="">Select a country</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <FieldError message={errors.country} />
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

function RadioGroup({
  legend,
  name,
  options,
  value,
  error,
  onChange,
}: {
  legend: string
  name: string
  options: ReadonlyArray<string>
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <fieldset className="mb-8">
      <legend className={LABEL_CLASS}>{legend}</legend>
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
              className="size-4 accent-[#7c3aed]"
            />
            {option}
          </label>
        ))}
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

  return (
    <div>
      <SectionTitle>Participation Profile &amp; Area of Interest</SectionTitle>

      <fieldset className="mb-8">
        <legend className={LABEL_CLASS}>
          Primary Interest Area (select all that apply)
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
              {area}
            </label>
          ))}
        </div>
      </fieldset>

      <RadioGroup
        legend="How do you wish to participate?"
        name="participationType"
        options={PARTICIPATION_TYPES}
        value={values.participationType}
        error={errors.participationType}
        onChange={(value) => set("participationType", value)}
      />
      <RadioGroup
        legend="Primary Goal for Attending"
        name="primaryGoal"
        options={PRIMARY_GOALS}
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
      <SectionTitle>Sponsorship Interest &amp; Data Consent</SectionTitle>

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
              <strong>Data Consent:</strong> I agree to receive official
              communications from the Media and Digital Institute (MDI)
              regarding ADF and related initiatives.
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
              <strong>Terms Acceptance:</strong> I accept the Africa Digital
              Forum{" "}
              <Link
                to="/privacy"
                target="_blank"
                className="text-primary underline"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                to="/terms"
                target="_blank"
                className="text-primary underline"
              >
                Event Terms of Use
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
}: {
  reference: string
  waived: boolean
}) {
  return (
    <Reveal>
      <div className="rounded-2xl bg-white px-6 py-10 shadow-[0_8px_48px_rgba(0,0,0,0.25)] sm:px-12 sm:py-14">
        <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-7" />
        </div>
        <h2 className="mb-3 text-[clamp(24px,3vw,34px)] font-extrabold tracking-[-0.02em] text-[#111111]">
          {waived
            ? "Registration confirmed! Welcome to ADF."
            : "Your pass is reserved!"}
        </h2>
        <p className="mb-2 text-[15px] leading-[1.7] text-[#2d3748]">
          Thank you for registering for the Africa Digital Forum!
        </p>
        <p className="mb-6 text-[15px] leading-[1.7] text-[#4a5568]">
          {waived
            ? "Your participation pass is confirmed, and no payment is required. A confirmation email has been sent to your email address."
            : "Your participation pass reservation is confirmed. Online payment is not available yet, and no payment has been taken. Our team will email you payment instructions. A confirmation email has been sent to your email address."}
        </p>
        <div className="mb-8 inline-block rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-sm text-[#2d3748]">
          Registration reference:{" "}
          <strong className="tracking-[0.06em]">{reference}</strong>
        </div>

        <h3 className="mb-3 text-sm font-bold tracking-[0.08em] text-[#111111] uppercase">
          Next Steps
        </h3>
        <ul className="flex flex-col gap-3 text-[14px] leading-[1.7] text-[#4a5568]">
          <li>
            <strong className="text-[#111111]">Official Program:</strong> The
            complete speaker schedule and breakout agenda will be published
            ahead of the event.
          </li>
          <li>
            <strong className="text-[#111111]">B2B Matchmaking:</strong> You
            will receive an invitation link to download the official ADF
            Networking Mobile App closer to the event date.
          </li>
          <li>
            <strong className="text-[#111111]">Inquiries:</strong> For
            assistance with any requests or administrative questions, please
            contact our secretariat at{" "}
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
