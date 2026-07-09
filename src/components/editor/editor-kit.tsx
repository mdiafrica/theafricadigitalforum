import { TrailingBlockPlugin, type Value } from "platejs"
import type { TPlateEditor } from "platejs/react"

import { AutoformatKit } from "./kits/autoformat-kit"
import { BasicBlocksKit } from "./kits/basic-blocks-kit"
import { BasicMarksKit } from "./kits/basic-marks-kit"
import { CodeBlockKit } from "./kits/code-block-kit"
import { ColumnKit } from "./kits/column-kit"
import { EmojiKit } from "./kits/emoji-kit"
import { FontKit } from "./kits/font-kit"
import { LinkKit } from "./kits/link-kit"
import { ListKit } from "./kits/list-kit"
import { MathKit } from "./kits/math-kit"
import { MediaKit } from "./kits/media-kit"
import { SlashKit } from "./kits/slash-kit"
import { FixedToolbarKit, FloatingToolbarKit } from "./kits/toolbar-kit"

/**
 * Content plugins shared by the editor and the read-only viewer
 * (rich-text-view.tsx): headings, marks, blockquote, hr, lists (+todo),
 * links (+autolink), images, code blocks, equations, columns, font
 * color/size.
 */
export const ContentKit = [
  ...BasicBlocksKit,
  ...BasicMarksKit,
  ...CodeBlockKit,
  ...ColumnKit,
  ...ListKit,
  ...LinkKit,
  ...MediaKit,
  ...MathKit,
  ...FontKit,
]

/** The full ADF editor: content plugins plus editing chrome. */
export const EditorKit = [
  ...ContentKit,
  TrailingBlockPlugin,
  ...SlashKit,
  ...AutoformatKit,
  ...EmojiKit,
  ...FixedToolbarKit,
  ...FloatingToolbarKit,
]

export type ADFEditor = TPlateEditor<Value, (typeof EditorKit)[number]>
