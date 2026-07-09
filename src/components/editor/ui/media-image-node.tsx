import { Image, useMediaState } from "@platejs/media/react"
import { ResizableProvider, useResizableValue } from "@platejs/resizable"
import type { TImageElement } from "platejs"
import type { PlateElementProps } from "platejs/react"
import { PlateElement, withHOC } from "platejs/react"

import { cn } from "@/lib/utils"

import { Caption, CaptionTextarea } from "./caption"
import { MediaToolbar } from "./media-toolbar"
import {
  mediaResizeHandleVariants,
  Resizable,
  ResizeHandle,
} from "./resize-handle"

/**
 * Image node with resize handles, caption and floating toolbar.
 * Drag-and-drop stays deferred.
 */
export const ImageElement = withHOC(
  ResizableProvider,
  function ImageElement(props: PlateElementProps<TImageElement>) {
    const { align = "center", focused, readOnly, selected } = useMediaState()
    const width = useResizableValue("width")

    return (
      <MediaToolbar>
        <PlateElement {...props} className="py-2.5">
          <figure className="group relative m-0" contentEditable={false}>
            <Resizable
              align={align}
              options={{
                align,
                readOnly,
              }}
            >
              <ResizeHandle
                className={mediaResizeHandleVariants({ direction: "left" })}
                options={{ direction: "left" }}
              />
              <div>
                <Image
                  alt={props.attributes.alt as string | undefined}
                  className={cn(
                    "block w-full max-w-full cursor-pointer rounded-md object-cover px-0",
                    focused && selected && "ring-2 ring-ring ring-offset-2"
                  )}
                />
              </div>
              <ResizeHandle
                className={mediaResizeHandleVariants({ direction: "right" })}
                options={{ direction: "right" }}
              />
            </Resizable>

            <Caption align={align} style={{ width }}>
              <CaptionTextarea
                onFocus={(event) => {
                  event.preventDefault()
                }}
                placeholder="Write a caption..."
                readOnly={readOnly}
              />
            </Caption>
          </figure>

          {props.children}
        </PlateElement>
      </MediaToolbar>
    )
  }
)
