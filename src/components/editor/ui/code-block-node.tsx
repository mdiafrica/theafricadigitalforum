import * as React from "react"
import { Combobox } from "@base-ui/react/combobox"
import { formatCodeBlock, isLangSupported } from "@platejs/code-block"
import { BracesIcon, Check, ChevronsUpDown, CopyIcon } from "lucide-react"
import { NodeApi, type TCodeBlockElement } from "platejs"
import {
  PlateElement,
  type PlateElementProps,
  PlateLeaf,
  type PlateLeafProps,
  useEditorRef,
  useElement,
  useReadOnly,
} from "platejs/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const codeBlockLanguages: Array<{ label: string; value: string }> = [
  { label: "Auto", value: "auto" },
  { label: "Plain Text", value: "plaintext" },
  { label: "Bash", value: "bash" },
  { label: "C", value: "c" },
  { label: "C#", value: "csharp" },
  { label: "C++", value: "cpp" },
  { label: "CSS", value: "css" },
  { label: "Dart", value: "dart" },
  { label: "Diff", value: "diff" },
  { label: "Docker", value: "dockerfile" },
  { label: "Elixir", value: "elixir" },
  { label: "Go", value: "go" },
  { label: "GraphQL", value: "graphql" },
  { label: "HTML", value: "html" },
  { label: "Java", value: "java" },
  { label: "JavaScript", value: "javascript" },
  { label: "JSON", value: "json" },
  { label: "Kotlin", value: "kotlin" },
  { label: "LaTeX", value: "latex" },
  { label: "Lua", value: "lua" },
  { label: "Makefile", value: "makefile" },
  { label: "Markdown", value: "markdown" },
  { label: "PHP", value: "php" },
  { label: "PowerShell", value: "powershell" },
  { label: "Python", value: "python" },
  { label: "R", value: "r" },
  { label: "Ruby", value: "ruby" },
  { label: "Rust", value: "rust" },
  { label: "SCSS", value: "scss" },
  { label: "Shell", value: "shell" },
  { label: "SQL", value: "sql" },
  { label: "Swift", value: "swift" },
  { label: "TOML", value: "toml" },
  { label: "TypeScript", value: "typescript" },
  { label: "XML", value: "xml" },
  { label: "YAML", value: "yaml" },
]

export function CodeBlockElement(props: PlateElementProps<TCodeBlockElement>) {
  const { editor, element } = props

  return (
    <PlateElement className="adf-code-block py-1" {...props}>
      <div className="relative rounded-md bg-muted/50">
        <pre className="overflow-x-auto p-8 pr-4 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid">
          <code>{props.children}</code>
        </pre>

        <div
          className="absolute top-1 right-1 z-10 flex gap-0.5 select-none"
          contentEditable={false}
        >
          {isLangSupported(element.lang) && (
            <Button
              className="size-6 text-xs"
              onClick={() => formatCodeBlock(editor, { element })}
              size="icon"
              title="Format code"
              variant="ghost"
            >
              <BracesIcon className="!size-3.5 text-muted-foreground" />
            </Button>
          )}

          <CodeBlockLanguageCombobox />

          <CopyButton value={() => NodeApi.string(element)} />
        </div>
      </div>
    </PlateElement>
  )
}

function CodeBlockLanguageCombobox() {
  const editor = useEditorRef()
  const element = useElement<TCodeBlockElement>()
  const readOnly = useReadOnly()
  const [open, setOpen] = React.useState(false)

  const value = element.lang ?? "auto"
  const label =
    codeBlockLanguages.find((language) => language.value === value)?.label ??
    value

  if (readOnly) return null

  return (
    <Combobox.Root
      items={codeBlockLanguages}
      itemToStringLabel={(item) => item.label}
      value={codeBlockLanguages.find((l) => l.value === value) ?? null}
      onValueChange={(item) => {
        if (item) {
          editor.tf.setNodes({ lang: item.value }, { at: element })
        }
        setOpen(false)
      }}
      open={open}
      onOpenChange={setOpen}
    >
      <Combobox.Trigger
        render={
          <Button
            className="h-6 justify-between gap-1 px-2 text-xs text-muted-foreground select-none"
            size="xs"
            variant="ghost"
          />
        }
      >
        {label}
        <ChevronsUpDown className="!size-3" />
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner
          align="end"
          sideOffset={4}
          className="isolate z-50"
        >
          <Combobox.Popup className="w-[220px] rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
            <div className="border-b p-1">
              <Combobox.Input
                placeholder="Search language…"
                className="h-7 w-full rounded-sm bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Combobox.Empty className="px-2 py-3 text-center text-sm text-muted-foreground empty:hidden">
              No language found.
            </Combobox.Empty>
            <Combobox.List className="max-h-[300px] overflow-y-auto p-1">
              {(item: (typeof codeBlockLanguages)[number]) => (
                <Combobox.Item
                  key={item.value}
                  value={item}
                  className="flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <Check
                    className={cn(
                      "size-3.5",
                      item.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}

function CopyButton({ value }: { value: () => string }) {
  const [copied, setCopied] = React.useState(false)

  return (
    <Button
      className="size-6 gap-1 text-xs text-muted-foreground"
      onClick={() => {
        void navigator.clipboard.writeText(value()).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      size="icon"
      title="Copy code"
      variant="ghost"
    >
      {copied ? (
        <Check className="!size-3.5" />
      ) : (
        <CopyIcon className="!size-3.5" />
      )}
    </Button>
  )
}

export function CodeLineElement(props: PlateElementProps) {
  return <PlateElement {...props} />
}

export function CodeSyntaxLeaf(props: PlateLeafProps) {
  const tokenClassName = props.leaf.className as string

  return (
    <PlateLeaf className={tokenClassName} {...props}>
      {props.children}
    </PlateLeaf>
  )
}
