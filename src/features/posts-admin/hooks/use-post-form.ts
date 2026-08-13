import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import {
  slugify,
  useCreatePostMutation,
  useUpdatePostMutation,
} from "@/domains/posts"
import type { PostAdminDetail } from "@/domains/posts"
import { getErrorMessage } from "@/lib/error"
import {
  emptyLocaleValues,
  postFormSchema,
  toTranslationsInput,
} from "../model/post-form.schemas"
import type { PostFormValues } from "../model/post-form.schemas"

function toFormValues(post: PostAdminDetail | undefined): PostFormValues {
  const en = post?.translations.en
  const fr = post?.translations.fr
  return {
    slug: post?.slug ?? "",
    coverMediaId: post?.coverMediaId ?? null,
    authorId: post?.authorId ?? "",
    categoryIds: post?.categoryIds ?? [],
    en: en
      ? { title: en.title, excerpt: en.excerpt, body: en.body }
      : { ...emptyLocaleValues },
    fr: fr
      ? { title: fr.title, excerpt: fr.excerpt, body: fr.body }
      : { ...emptyLocaleValues },
  }
}

export function usePostForm({
  post,
  canAssignAuthor,
}: {
  post?: PostAdminDetail
  canAssignAuthor: boolean
}) {
  const navigate = useNavigate()
  const createMutation = useCreatePostMutation()
  const updateMutation = useUpdatePostMutation()

  // Slug follows the EN title until the user edits the slug by hand.
  const slugTouchedRef = React.useRef(!!post)

  const form = useForm({
    defaultValues: toFormValues(post),
    validators: { onSubmit: postFormSchema },
    onSubmit: async ({ value }) => {
      // Only admins may send authorId — the server rejects it otherwise.
      const authorId =
        canAssignAuthor && value.authorId ? value.authorId : undefined
      try {
        if (post) {
          await updateMutation.mutateAsync({
            id: post.id,
            slug: value.slug,
            coverMediaId: value.coverMediaId,
            authorId,
            categoryIds: value.categoryIds,
            translations: toTranslationsInput(value),
          })
          toast.success("Post saved.")
        } else {
          const created = await createMutation.mutateAsync({
            slug: value.slug,
            coverMediaId: value.coverMediaId,
            authorId,
            categoryIds: value.categoryIds,
            translations: toTranslationsInput(value),
          })
          toast.success("Post created.")
          void navigate({
            to: "/admin/posts/$id",
            params: { id: created.id },
          })
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Couldn't save the post."))
      }
    },
  })

  const onEnTitleChange = (title: string) => {
    form.setFieldValue("en.title", title)
    if (!slugTouchedRef.current) {
      form.setFieldValue("slug", slugify(title))
    }
  }

  const onSlugChange = (slug: string) => {
    slugTouchedRef.current = true
    form.setFieldValue("slug", slug)
  }

  return {
    form,
    onEnTitleChange,
    onSlugChange,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
  }
}
