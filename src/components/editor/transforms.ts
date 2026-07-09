import { insertCodeBlock, toggleCodeBlock } from "@platejs/code-block"
import { insertColumnGroup, toggleColumnGroup } from "@platejs/layout"
import { triggerFloatingLink } from "@platejs/link/react"
import { insertEquation, insertInlineEquation } from "@platejs/math"
import {
  KEYS,
  nanoid,
  PathApi,
  type NodeEntry,
  type Path,
  type TElement,
} from "platejs"
import type { PlateEditor } from "platejs/react"

/**
 * Block/inline insertion + turn-into transforms (trimmed from the Plate
 * registry's transforms.ts to our plugin set — no tables, callouts or
 * suggestions).
 */

export const ACTION_THREE_COLUMNS = "action_three_columns"

const insertList = (editor: PlateEditor, type: string) => {
  editor.tf.insertNodes(
    editor.api.create.block({ indent: 1, listStyleType: type }),
    { select: true }
  )
}

const createBlockquote = (editor: PlateEditor) => ({
  children: [editor.api.create.block({ type: KEYS.p })],
  type: KEYS.blockquote,
})

const selectBlockquoteStart = (editor: PlateEditor, path: Path) => {
  const start = editor.api.start(path.concat([0]))
  if (start) editor.tf.select(start)
}

const insertBlockMap: Record<
  string,
  (editor: PlateEditor, type: string) => void
> = {
  [KEYS.listTodo]: insertList,
  [KEYS.ol]: insertList,
  [KEYS.ul]: insertList,
  [KEYS.codeBlock]: (editor) => insertCodeBlock(editor, { select: true }),
  [KEYS.equation]: (editor) => insertEquation(editor, { select: true }),
  [ACTION_THREE_COLUMNS]: (editor) =>
    insertColumnGroup(editor, { columns: 3, select: true }),
  // NOT @platejs/media's insertMedia — that one window.prompt()s for a URL
  // (blocking dialog). Insert an upload placeholder; clicking it opens the
  // file picker (media-placeholder-node).
  [KEYS.img]: (editor) => {
    editor.tf.insertNodes(
      {
        id: nanoid(),
        children: [{ text: "" }],
        mediaType: KEYS.img,
        type: editor.getType(KEYS.placeholder),
      },
      { nextBlock: true, select: true }
    )
  },
}

const insertInlineMap: Record<
  string,
  (editor: PlateEditor, type: string) => void
> = {
  [KEYS.link]: (editor) => triggerFloatingLink(editor, { focused: true }),
  [KEYS.inlineEquation]: (editor) =>
    insertInlineEquation(editor, "", { select: true }),
}

export const insertBlock = (editor: PlateEditor, type: string) => {
  editor.tf.withoutNormalizing(() => {
    const block = editor.api.block()
    if (!block) return

    const [currentNode, path] = block
    const isCurrentBlockEmpty = editor.api.isEmpty(currentNode)
    const isSameBlockType = type === getBlockType(currentNode)

    if (type === KEYS.blockquote) {
      const insertPath = PathApi.next(path)
      editor.tf.insertNodes(createBlockquote(editor), { at: insertPath })
      if (!isSameBlockType && isCurrentBlockEmpty) {
        editor.tf.removeNodes({ at: path })
      }
      selectBlockquoteStart(
        editor,
        isCurrentBlockEmpty && !isSameBlockType ? path : insertPath
      )
      return
    }

    if (type in insertBlockMap) {
      insertBlockMap[type](editor, type)
    } else {
      editor.tf.insertNodes(editor.api.create.block({ type }), {
        at: PathApi.next(path),
        select: true,
      })
    }

    if (!isSameBlockType) {
      editor.tf.removeNodes({ previousEmptyBlock: true })
    }
  })
}

export const insertInlineElement = (editor: PlateEditor, type: string) => {
  insertInlineMap[type]?.(editor, type)
}

const setList = (
  editor: PlateEditor,
  type: string,
  entry: NodeEntry<TElement>
) => {
  editor.tf.setNodes(
    editor.api.create.block({ indent: 1, listStyleType: type }),
    { at: entry[1] }
  )
}

const setBlockMap: Record<
  string,
  (editor: PlateEditor, type: string, entry: NodeEntry<TElement>) => void
> = {
  [KEYS.listTodo]: setList,
  [KEYS.ol]: setList,
  [KEYS.ul]: setList,
  [KEYS.codeBlock]: (editor) => toggleCodeBlock(editor),
  [ACTION_THREE_COLUMNS]: (editor) => toggleColumnGroup(editor, { columns: 3 }),
}

export const setBlockType = (
  editor: PlateEditor,
  type: string,
  { at }: { at?: Path } = {}
) => {
  editor.tf.withoutNormalizing(() => {
    if (type === KEYS.blockquote) {
      const target = at ?? editor.selection
      if (!target || editor.api.some({ at: target, match: { type } })) return
      editor.tf.toggleBlock(type, { ...(at ? { at } : {}), wrap: true })
      return
    }

    const setEntry = (entry: NodeEntry<TElement>) => {
      const [node, path] = entry
      if (node[KEYS.listType]) {
        editor.tf.unsetNodes([KEYS.listType, "indent"], { at: path })
      }
      if (type in setBlockMap) {
        return setBlockMap[type](editor, type, entry)
      }
      if (node.type !== type) {
        editor.tf.setNodes({ type }, { at: path })
      }
    }

    if (at) {
      const entry = editor.api.node<TElement>(at)
      if (entry) {
        setEntry(entry)
        return
      }
    }

    editor.api.blocks({ mode: "lowest" }).forEach(setEntry)
  })
}

export const getBlockType = (block: TElement) => {
  if (block[KEYS.listType]) {
    if (block[KEYS.listType] === KEYS.ol) return KEYS.ol
    if (block[KEYS.listType] === KEYS.listTodo) return KEYS.listTodo
    return KEYS.ul
  }
  return block.type
}
