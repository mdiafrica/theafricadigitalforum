import * as React from "react"
import type { Value } from "platejs"

import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { PostAdminDetail } from "@/domains/posts"
import type { Locale } from "@/lib/schemas"
import { usePostForm } from "../hooks/use-post-form"
import { MediaPickerDialog } from "@/components/media-picker-dialog"

/**
 * Bilingual post form: EN|FR tabs over per-locale title / excerpt / category
 * / rich-text body; shared slug + cover image. Both panels stay mounted
 * (keepMounted) so editor state survives tab switches.
 */
export function PostForm({
  post,
  headerActions,
}: {
  post?: PostAdminDetail
  headerActions?: React.ReactNode
}) {
  const { form, onEnTitleChange, onSlugChange, isSubmitting } = usePostForm({
    post,
  })
  const [coverUrl, setCoverUrl] = React.useState<string | null>(
    post?.coverUrl ?? null
  )

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            {post ? "Save changes" : "Create post"}
          </Button>
          {headerActions}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>
            English is the source language; add French when it&apos;s ready. The
            French tab is published only once it has a title.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="en">
            <TabsList>
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="fr">Français</TabsTrigger>
            </TabsList>
            <TabsContent value="en" keepMounted className="pt-4">
              <LocaleFields
                form={form}
                locale="en"
                onTitleChange={onEnTitleChange}
              />
            </TabsContent>
            <TabsContent value="fr" keepMounted className="pt-4">
              <LocaleFields form={form} locale="fr" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <form.Field name="slug">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor="post-slug">Slug</FieldLabel>
                  <Input
                    id="post-slug"
                    value={field.state.value}
                    onChange={(event) => onSlugChange(event.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="my-post-title"
                    aria-invalid={field.state.meta.errors.length > 0}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    /blog/{field.state.value || "…"}
                  </p>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="coverMediaId">
              {(field) => (
                <Field>
                  <FieldLabel>Cover image</FieldLabel>
                  <MediaPickerDialog
                    label="Choose a cover image"
                    imageUrl={coverUrl}
                    onSelect={(item) => {
                      field.handleChange(item.id)
                      setCoverUrl(item.url)
                    }}
                    onClear={() => {
                      field.handleChange(null)
                      setCoverUrl(null)
                    }}
                  />
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  )
}

function LocaleFields({
  form,
  locale,
  onTitleChange,
}: {
  form: ReturnType<typeof usePostForm>["form"]
  locale: Locale
  onTitleChange?: (title: string) => void
}) {
  const label = locale === "en" ? "English" : "French"

  return (
    <FieldGroup>
      <form.Field name={`${locale}.title`}>
        {(field) => (
          <Field data-invalid={field.state.meta.errors.length > 0}>
            <FieldLabel htmlFor={`${locale}-title`}>Title</FieldLabel>
            <Input
              id={`${locale}-title`}
              value={field.state.value}
              onChange={(event) =>
                onTitleChange
                  ? onTitleChange(event.target.value)
                  : field.handleChange(event.target.value)
              }
              onBlur={field.handleBlur}
              placeholder={`${label} title`}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      <form.Field name={`${locale}.excerpt`}>
        {(field) => (
          <Field data-invalid={field.state.meta.errors.length > 0}>
            <FieldLabel htmlFor={`${locale}-excerpt`}>Excerpt</FieldLabel>
            <Textarea
              id={`${locale}-excerpt`}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              rows={3}
              placeholder="Short summary shown on cards and in search results"
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      <form.Field name={`${locale}.category`}>
        {(field) => (
          <Field data-invalid={field.state.meta.errors.length > 0}>
            <FieldLabel htmlFor={`${locale}-category`}>Category</FieldLabel>
            <Input
              id={`${locale}-category`}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              placeholder={
                locale === "en" ? "Digital Policy" : "Politique numérique"
              }
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      <form.Field name={`${locale}.body`}>
        {(field) => (
          <Field>
            <FieldLabel>Body</FieldLabel>
            <RichTextEditor
              initialValue={
                field.state.value.length > 0
                  ? (field.state.value as Value)
                  : undefined
              }
              onChange={(value) => field.handleChange(value)}
            />
          </Field>
        )}
      </form.Field>
    </FieldGroup>
  )
}
