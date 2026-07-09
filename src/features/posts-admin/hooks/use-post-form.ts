import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import {
  slugify,
  useCreatePostMutation,
  useUpdatePostMutation,
  type PostAdminDetail,
} from "@/domains/posts"
import { getErrorMessage } from "@/lib/error"
import {
  emptyLocaleValues,
  postFormSchema,
  toTranslationsInput,
  type PostFormValues,
} from "../model/post-form.schemas"

function toFormValues(post: PostAdminDetail | undefined): PostFormValues {
  const en = post?.translations.en
  const fr = post?.translations.fr
  return {
    slug: post?.slug ?? "",
    coverMediaId: post?.coverMediaId ?? null,
    en: en
      ? {
          title: en.title,
          excerpt: en.excerpt,
          category: en.category ?? "",
          body: en.body,
        }
      : { ...emptyLocaleValues },
    fr: fr
      ? {
          title: fr.title,
          excerpt: fr.excerpt,
          category: fr.category ?? "",
          body: fr.body,
        }
      : { ...emptyLocaleValues },
  }
}

export function usePostForm({ post }: { post?: PostAdminDetail }) {
  const navigate = useNavigate()
  const createMutation = useCreatePostMutation()
  const updateMutation = useUpdatePostMutation()

  // Slug follows the EN title until the user edits the slug by hand.
  const slugTouchedRef = React.useRef(!!post)

  const form = useForm({
    defaultValues: toFormValues(post),
    validators: { onSubmit: postFormSchema },
    onSubmit: async ({ value }) => {
      try {
        if (post) {
          await updateMutation.mutateAsync({
            id: post.id,
            slug: value.slug,
            coverMediaId: value.coverMediaId,
            translations: toTranslationsInput(value),
          })
          toast.success("Post saved.")
        } else {
          const created = await createMutation.mutateAsync({
            slug: value.slug,
            coverMediaId: value.coverMediaId,
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
