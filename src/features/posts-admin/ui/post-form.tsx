import * as React from "react"
import type { Value } from "platejs"

import { useQuery } from "@tanstack/react-query"

import { useSessionQuery } from "@/domains/auth"
import { publicCategoriesQueryOptions } from "@/domains/categories"
import { useAssignableAuthorsQuery } from "@/domains/posts"
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
import { MultiSelect } from "@/components/ui/multi-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { PostAdminDetail } from "@/domains/posts"
import { hasOrgPermission } from "@/lib/auth/permissions"
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
  const sessionQuery = useSessionQuery()
  const session = sessionQuery.data
  const canAssignAuthor = hasOrgPermission(
    { globalRole: session?.user.role, orgRole: session?.orgRole },
    { post: ["assignAuthor"] }
  )

  const { form, onEnTitleChange, onSlugChange, isSubmitting } = usePostForm({
    post,
    canAssignAuthor,
  })
  const [coverUrl, setCoverUrl] = React.useState<string | null>(
    post?.coverUrl ?? null
  )

  const authorsQuery = useAssignableAuthorsQuery(canAssignAuthor)
  const authorItems = (authorsQuery.data ?? []).map((member) => ({
    value: member.userId,
    label: member.isBoard
      ? `ADF Editorial Board (${member.name})`
      : member.name,
  }))
  const categoriesQuery = useQuery(publicCategoriesQueryOptions("en"))
  const categoryOptions = (categoriesQuery.data ?? []).map((category) => ({
    value: category.id,
    label: category.name,
    color: category.color,
  }))

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
                    placeholder="auto-generated from title"
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

            <form.Field name="categoryIds">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="post-categories">Categories</FieldLabel>
                  <MultiSelect
                    id="post-categories"
                    options={categoryOptions}
                    values={field.state.value}
                    onValuesChange={(values) => field.handleChange(values)}
                    placeholder="Pick one or more categories"
                    disabled={isSubmitting}
                  />
                </Field>
              )}
            </form.Field>

            {canAssignAuthor && (
              <form.Field name="authorId">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="post-author">Author</FieldLabel>
                    <Select
                      items={authorItems}
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value ?? "")}
                    >
                      <SelectTrigger id="post-author" className="w-full">
                        <SelectValue
                          placeholder={post ? "Keep current author" : "Me"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {authorItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Admin and owner bylines appear on the site as the ADF
                      Editorial Board.
                    </p>
                  </Field>
                )}
              </form.Field>
            )}

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
