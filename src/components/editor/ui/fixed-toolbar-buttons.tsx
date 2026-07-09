import {
  BoldIcon,
  Code2Icon,
  HighlighterIcon,
  ItalicIcon,
  PaintBucketIcon,
  StrikethroughIcon,
  TypeIcon,
  UnderlineIcon,
} from "lucide-react"
import { KEYS } from "platejs"

import { FontColorToolbarButton } from "./font-color-toolbar-button"
import { FontSizeToolbarButton } from "./font-size-toolbar-button"
import { LinkToolbarButton } from "./link-toolbar-button"
import {
  BulletedListToolbarButton,
  NumberedListToolbarButton,
  TodoListToolbarButton,
} from "./list-toolbar-button"
import { MarkToolbarButton } from "./mark-toolbar-button"
import { MediaToolbarButton } from "./media-toolbar-button"
import { ToolbarGroup } from "./toolbar"
import { TurnIntoToolbarButton } from "./turn-into-toolbar-button"

export function FixedToolbarButtons() {
  return (
    <div className="flex w-full">
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
        <MarkToolbarButton
          nodeType={KEYS.strikethrough}
          tooltip="Strikethrough (⌘+⇧+X)"
        >
          <StrikethroughIcon />
        </MarkToolbarButton>
        <MarkToolbarButton nodeType={KEYS.code} tooltip="Code (⌘+E)">
          <Code2Icon />
        </MarkToolbarButton>
        <MarkToolbarButton
          nodeType={KEYS.highlight}
          tooltip="Highlight (⌘+⇧+H)"
        >
          <HighlighterIcon />
        </MarkToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <FontSizeToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <FontColorToolbarButton nodeType={KEYS.color} tooltip="Text color">
          <TypeIcon />
        </FontColorToolbarButton>
        <FontColorToolbarButton
          nodeType={KEYS.backgroundColor}
          tooltip="Background color"
        >
          <PaintBucketIcon />
        </FontColorToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <BulletedListToolbarButton />
        <NumberedListToolbarButton />
        <TodoListToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <LinkToolbarButton />
        <MediaToolbarButton />
      </ToolbarGroup>
    </div>
  )
}
