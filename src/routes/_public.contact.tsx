import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { useI18n } from "@/i18n/context"
import { submitContact } from "@/domains/submissions"
import { Reveal } from "@/components/motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/brand-icons"
import heroBg from "@/assets/images/Image2.jpg"

const INFO_ICONS: LucideIcon[] = [MapPin, Mail, Phone]
const SOCIALS = [
  { icon: FacebookIcon, href: "https://www.facebook.com/theafricadigitalforum/" },
  { icon: XIcon, href: "https://x.com/theafricadigitalforum" },
  { icon: InstagramIcon, href: "https://www.instagram.com/theafricadigitalforum/" },
  { icon: YoutubeIcon, href: "https://youtube.com/@theafricadigitalforum" },
]

const INPUT_CLASS =
  "h-auto rounded-lg border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#111111] placeholder:text-[#a0aec0] focus-visible:border-primary focus-visible:bg-white focus-visible:ring-primary/[0.12] dark:border-[#e2e8f0] dark:bg-[#f8fafc]"
const LABEL_CLASS =
  "mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-[#2d3748] uppercase"

export const Route = createFileRoute("/_public/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Africa Digital Forum" },
      {
        name: "description",
        content: "Get in touch with the Africa Digital Forum team.",
      },
      { property: "og:title", content: "Contact | Africa Digital Forum" },
      {
        property: "og:description",
        content: "Get in touch with the Africa Digital Forum team.",
      },
    ],
  }),
  component: ContactRoute,
})

function ContactRoute() {
  const { t } = useI18n()
  const contact = t.contact

  return (
    <div className="bg-black font-nav">
      {/* Hero */}
      <section
        className="relative -mt-[85px] flex h-[405px] items-center justify-center overflow-hidden bg-cover bg-center pt-[85px] text-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative px-5">
          <Reveal>
            <h1 className="mb-3 text-[clamp(32px,4vw,56px)] leading-[1.1] font-extrabold tracking-[0.05em] text-white capitalize">
              {contact.hero.title}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto max-w-[520px] text-base leading-[1.6] text-white/85">
              {contact.hero.subtitle}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Panel */}
      <div className="relative z-[2] mx-auto -mt-16 max-w-[1200px] px-[5%] pb-20">
        <Reveal delay={0.1}>
          <div className="grid overflow-hidden rounded-2xl bg-white shadow-[0_8px_48px_rgba(0,0,0,0.25)] md:grid-cols-[360px_1fr]">
            {/* Info */}
            <div className="border-b border-[#eaeef5] bg-white px-10 py-12 md:border-r md:border-b-0">
              <h2 className="mb-2.5 text-[26px] font-extrabold tracking-[-0.02em] text-[#111111]">
                {contact.info.title}
              </h2>
              <p className="mb-8 text-sm leading-[1.7] text-[#4a5568]">
                {contact.info.subtext}
              </p>
              <div className="mb-8 h-px bg-[#eaeef5]" />

              <div className="mb-9 flex flex-col gap-6">
                {contact.info.items.map((item, i) => {
                  const Icon = INFO_ICONS[i % INFO_ICONS.length]
                  return (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                        <Icon className="size-[18px]" />
                      </div>
                      <div>
                        <div className="mb-1 text-sm font-bold text-[#111111]">
                          {item.title}
                        </div>
                        {item.lines.map((line) => (
                          <p
                            key={line}
                            className="text-[13px] leading-[1.6] text-[#4a5568]"
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mb-8 h-px bg-[#eaeef5]" />
              <p className="mb-3.5 text-xs font-bold tracking-[0.1em] text-[#718096] uppercase">
                {contact.info.socialLabel}
              </p>
              <div className="flex gap-2.5">
                {SOCIALS.map(({ icon: Icon, href }, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="icon"
                    render={
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="social link"
                      />
                    }
                    className="size-9 rounded-full border-primary/25 bg-primary/10 text-primary hover:scale-110 hover:border-primary hover:bg-primary hover:text-white dark:border-primary/25 dark:bg-primary/10 dark:hover:bg-primary"
                  >
                    <Icon className="size-4" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="bg-white px-10 py-12">
              <h2 className="mb-7 text-[26px] font-extrabold tracking-[-0.02em] text-[#111111]">
                {contact.form.title}
              </h2>
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </div>

      {/* Full-width map */}
      <Reveal delay={0.15}>
        <iframe
          title={contact.map.title}
          className="block h-[420px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31780.932847517635!2d1.2063658!3d6.1374804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1023e1c113185419%3A0x3224b5422caf411e!2sLom%C3%A9%2C%20Togo!5e0!3m2!1sen!2sus!4v1700000000000"
        />
      </Reveal>
    </div>
  )
}

const contactSchema = z.object({
  name: z.string().min(1),
  company: z.string(),
  phone: z.string(),
  email: z.string().min(1).email(),
  subject: z.string().min(1),
  message: z.string().min(1),
})

function ContactForm() {
  const { t } = useI18n()
  const copy = t.contact.form

  const submit = useMutation({
    mutationFn: (value: z.infer<typeof contactSchema>) => {
      const extra = [
        value.company && `Company: ${value.company}`,
        value.phone && `Phone: ${value.phone}`,
      ]
        .filter(Boolean)
        .join(" · ")
      return submitContact({
        data: {
          name: value.name,
          email: value.email,
          subject: value.subject,
          message: extra ? `${value.message}\n\n${extra}` : value.message,
        },
      })
    },
    onSuccess: () =>
      toast.success(copy.success.title, { description: copy.success.text }),
    onError: (error) =>
      toast.error(copy.error.title, {
        description: error instanceof Error ? error.message : undefined,
      }),
  })

  const form = useForm({
    defaultValues: {
      name: "",
      company: "",
      phone: "",
      email: "",
      subject: "",
      message: "",
    },
    validators: { onSubmit: contactSchema },
    onSubmit: async ({ value, formApi }) => {
      await submit
        .mutateAsync(value)
        .then(() => formApi.reset())
        .catch(() => {})
    },
  })

  const textField = (
    name: "name" | "company" | "phone" | "email" | "subject",
    field: { label: string; placeholder: string },
    type = "text"
  ) => (
    <form.Field name={name}>
      {(f) => (
        <div>
          <label htmlFor={name} className={LABEL_CLASS}>
            {field.label}
          </label>
          <Input
            id={name}
            type={type}
            value={f.state.value}
            onChange={(e) => f.handleChange(e.target.value)}
            onBlur={f.handleBlur}
            placeholder={field.placeholder}
            aria-invalid={f.state.meta.errors.length > 0}
            disabled={submit.isPending}
            className={INPUT_CLASS}
          />
        </div>
      )}
    </form.Field>
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        {textField("name", copy.name)}
        {textField("company", copy.company)}
        {textField("phone", copy.phone, "tel")}
        {textField("email", copy.email, "email")}
      </div>
      <div className="mb-4">{textField("subject", copy.subject)}</div>
      <div className="mb-4">
        <form.Field name="message">
          {(f) => (
            <div>
              <label htmlFor="message" className={LABEL_CLASS}>
                {copy.message.label}
              </label>
              <Textarea
                id="message"
                rows={5}
                value={f.state.value}
                onChange={(e) => f.handleChange(e.target.value)}
                onBlur={f.handleBlur}
                placeholder={copy.message.placeholder}
                aria-invalid={f.state.meta.errors.length > 0}
                disabled={submit.isPending}
                className={`${INPUT_CLASS} resize-y`}
              />
            </div>
          )}
        </form.Field>
      </div>
      <div className="text-right">
        <Button
          type="submit"
          disabled={submit.isPending}
          className="h-auto min-w-[180px] rounded-lg px-6 py-3.5 text-[15px] font-extrabold tracking-[0.04em] hover:bg-[#5b21b6]"
        >
          {submit.isPending && <Spinner data-icon="inline-start" />}
          {submit.isPending ? copy.sending : copy.submit}
        </Button>
      </div>
    </form>
  )
}
