import { PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

/**
 * Schema-less form over a JSON section blob: string leaves become inputs
 * (textareas when long), numbers become number inputs, arrays of objects
 * become repeatable fieldsets. Covers every page_content section shape
 * (they're string/number leaves at most two levels deep).
 */

export type Json =
  string | number | boolean | null | Json[] | { [key: string]: Json }
export type JsonObject = Record<string, Json>

function labelize(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
}

function LeafField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string | number
  onChange: (next: string | number) => void
}) {
  if (typeof value === "number") {
    return (
      <Field>
        <FieldLabel>{label}</FieldLabel>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
      </Field>
    )
  }
  const long = value.length > 80
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      {long ? (
        <Textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  )
}

function emptyClone(item: Json): Json {
  if (Array.isArray(item)) return []
  if (item && typeof item === "object") {
    return Object.fromEntries(
      Object.entries(item).map(([key, value]) => [key, emptyClone(value)])
    )
  }
  if (typeof item === "number") return 0
  if (typeof item === "boolean") return false
  return ""
}

function ArrayField({
  label,
  value,
  onChange,
}: {
  label: string
  value: Json[]
  onChange: (next: Json[]) => void
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <p className="text-sm font-semibold">{label}</p>
      {value.map((item, index) => (
        <div
          key={index}
          className="relative space-y-3 rounded-md border border-border/60 bg-muted/20 p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {label} {index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${label} ${index + 1}`}
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              <Trash2Icon />
            </Button>
          </div>
          <JsonValueField
            label=""
            value={item}
            onChange={(next) =>
              onChange(value.map((v, i) => (i === index ? next : v)))
            }
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([...value, value.length > 0 ? emptyClone(value[0]) : ""])
        }
      >
        <PlusIcon data-icon="inline-start" />
        Add {label.toLowerCase()}
      </Button>
    </div>
  )
}

function JsonValueField({
  label,
  value,
  onChange,
}: {
  label: string
  value: Json
  onChange: (next: Json) => void
}) {
  if (typeof value === "string" || typeof value === "number") {
    return <LeafField label={label} value={value} onChange={onChange} />
  }
  if (Array.isArray(value)) {
    return <ArrayField label={label} value={value} onChange={onChange} />
  }
  if (value && typeof value === "object") {
    return (
      <div className="space-y-3">
        {Object.entries(value).map(([key, child]) => (
          <JsonValueField
            key={key}
            label={labelize(key)}
            value={child}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        ))}
      </div>
    )
  }
  // booleans/null don't occur in our sections — render nothing.
  return null
}

export function JsonSectionForm({
  value,
  onChange,
}: {
  value: JsonObject
  onChange: (next: JsonObject) => void
}) {
  return (
    <JsonValueField
      label=""
      value={value}
      onChange={(next) => onChange(next as JsonObject)}
    />
  )
}
