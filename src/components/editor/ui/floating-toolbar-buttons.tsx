import { BoldIcon, Code2Icon, ItalicIcon, UnderlineIcon } from "lucide-react"
import { KEYS } from "platejs"

import { LinkToolbarButton } from "./link-toolbar-button"
import { MarkToolbarButton } from "./mark-toolbar-button"
import { ToolbarGroup } from "./toolbar"
import { TurnIntoToolbarButton } from "./turn-into-toolbar-button"

export function FloatingToolbarButtons() {
  return (
    <>
      <ToolbarGroup>
        <TurnIntoToolbarButton />
      </ToolbarGroup>
      <ToolbarGroup>
        <MarkToolbarButton nodeType={KEYS.bold} tooltip="Bold (⌘+B)">
          <BoldIcon />
        </MarkToolbarButton>
        <MarkToolbarButton nodeType={KEYS.italic} tooltip="Italic (⌘+I)">
          <ItalicIcon />
        </MarkToolbarButton>
        <MarkToolbarButton nodeType={KEYS.underline} tooltip="Underline (⌘+U)">
          <UnderlineIcon />
        </MarkToolbarButton>
        <MarkToolbarButton nodeType={KEYS.code} tooltip="Code (⌘+E)">
          <Code2Icon />
        </MarkToolbarButton>
      </ToolbarGroup>
      <ToolbarGroup>
        <LinkToolbarButton />
      </ToolbarGroup>
    </>
  )
}
