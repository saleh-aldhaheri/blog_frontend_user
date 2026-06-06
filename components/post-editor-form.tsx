
import { useMemo, useState, useEffect, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { categoryApi } from '@/src/v1/api/catetory.api'
import type { PostDetail } from '@/src/v1/types/response/post'
import type { Category } from '@/src/v1/types/response/category'

type EditorGroup = {
  id: string
  heading: string
  text: string
  mediaFile: File | null
  mediaId: number | null
  existingMediaUrl: string
  previewUrl: string
}

type PostEditorFormProps = {
  mode: 'create' | 'edit'
  initialPost?: PostDetail
  submitting?: boolean
  onSubmitCreate?: (formData: FormData) => Promise<void>
  onSubmitEdit?: (formData: FormData) => Promise<void>
}

const MAX_BLOCKS = 10

function emptyGroup(): EditorGroup {
  return {
    id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    heading: '',
    text: '',
    mediaFile: null,
    mediaId: null,
    existingMediaUrl: '',
    previewUrl: '',
  }
}

function toGroups(post?: PostDetail): EditorGroup[] {
  if (!post?.content?.length) return [emptyGroup()]

  const sorted = post.content.slice().sort((a, b) => Number(a.order) - Number(b.order))
  const groups: EditorGroup[] = []
  let current: EditorGroup | null = null

  sorted.forEach((block) => {
    if (block.type === 'heading') {
      if (current) groups.push(current)
      current = { ...emptyGroup(), heading: typeof block.value === 'string' ? block.value : '' }
      return
    }
    if (!current) current = emptyGroup()
    if (block.type === 'text') {
      const value = typeof block.value === 'string' ? block.value : ''
      current.text = current.text ? `${current.text}\n${value}` : value
      return
    }
    if (block.type === 'media') {
      const mediaObj =
        typeof (block as { media?: unknown }).media === 'object' &&
        (block as { media?: unknown }).media
          ? ((block as { media?: unknown }).media as { id?: unknown; url?: unknown })
          : null
      const url =
        typeof mediaObj?.url === 'string'
          ? mediaObj.url
          : typeof block.file === 'string'
            ? block.file
            : typeof block.value === 'string'
              ? block.value
              : ''
      const mediaId =
        typeof mediaObj?.id === 'number'
          ? mediaObj.id
          : typeof mediaObj?.id === 'string'
            ? Number(mediaObj.id)
            : null
      if (url) {
        current.mediaId = Number.isFinite(mediaId ?? Number.NaN) ? mediaId : null
        current.existingMediaUrl = url
        current.previewUrl = url
      }
    }
  })

  if (current) groups.push(current)
  return groups.length ? groups : [emptyGroup()]
}

export default function PostEditorForm({
  mode,
  initialPost,
  submitting = false,
  onSubmitCreate,
  onSubmitEdit,
}: PostEditorFormProps) {
  const [title, setTitle] = useState(initialPost?.title ?? '')
  const [categoryId, setCategoryId] = useState(
    initialPost?.category_id ? String(initialPost.category_id) : '1',
  )
  const [status, setStatus] = useState<'draft' | 'published'>(
    initialPost?.status === 'draft' ? 'draft' : 'published',
  )
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [groups, setGroups] = useState<EditorGroup[]>(toGroups(initialPost))
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await categoryApi.getCategories()
        setCategories(data.data)
        if (!initialPost?.category_id && data.data.length > 0) {
          setCategoryId(String(data.data[0].id))
        }
      } catch {
        toast.error('Unable to load categories.')
      } finally {
        setCategoriesLoading(false)
      }
    }
    void loadCategories()
  }, [initialPost?.category_id])

  useEffect(() => {
    return () => {
      groups.forEach((group) => {
        if (group.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(group.previewUrl)
        }
      })
    }
  }, [groups])

  const hasExistingThumbnail = Boolean(initialPost?.thumbnail)
  const hasAtLeastOneFilledGroup = useMemo(
    () => groups.some((group) => group.heading.trim() || group.text.trim()),
    [groups],
  )

  const addGroup = () => {
    if (groups.length >= MAX_BLOCKS) {
      toast.error(`Maximum ${MAX_BLOCKS} blocks allowed.`)
      return
    }
    setGroups((prev) => [...prev, emptyGroup()])
  }

  const removeGroup = (id: string) => {
    setGroups((prev) => {
      const next = prev.filter((group) => group.id !== id)
      return next.length ? next : [emptyGroup()]
    })
  }

  const updateGroup = (id: string, patch: Partial<EditorGroup>) => {
    setGroups((prev) => prev.map((group) => (group.id === id ? { ...group, ...patch } : group)))
  }

  const buildFormData = () => {
    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('categoryId', String(Number(categoryId)))
    formData.append('status', status)
    if (thumbnail) {
      formData.append('thumbnails', thumbnail)
    }

    let order = 1
    let contentIndex = 0
    groups.forEach((group) => {
      formData.append(`content[${contentIndex}][type]`, 'heading')
      formData.append(`content[${contentIndex}][order]`, String(order++))
      formData.append(`content[${contentIndex}][value]`, group.heading.trim())
      contentIndex += 1

      if (group.mediaFile || group.existingMediaUrl.trim()) {
        formData.append(`content[${contentIndex}][type]`, 'media')
        formData.append(`content[${contentIndex}][order]`, String(order++))
        if (group.mediaId !== null) {
          formData.append(`content[${contentIndex}][media][id]`, String(group.mediaId))
        }
        if (group.existingMediaUrl.trim()) {
          formData.append(`content[${contentIndex}][media][url]`, group.existingMediaUrl.trim())
        }
        if (group.mediaFile) {
          formData.append(`content[${contentIndex}][media][newMedia]`, group.mediaFile)
        }
        contentIndex += 1
      }

      formData.append(`content[${contentIndex}][type]`, 'text')
      formData.append(`content[${contentIndex}][order]`, String(order++))
      formData.append(`content[${contentIndex}][value]`, group.text.trim())
      contentIndex += 1
    })
    return formData
  }

  const validate = () => {
    if (!title.trim()) {
      toast.error('Title is required.')
      return false
    }
    if (!categoryId.trim() || Number.isNaN(Number(categoryId))) {
      toast.error('Category id is required.')
      return false
    }
    if (mode === 'create' && !thumbnail) {
      toast.error('Thumbnail is required.')
      return false
    }
    if (mode === 'edit' && !thumbnail && !hasExistingThumbnail) {
      toast.error('Thumbnail is required.')
      return false
    }
    if (groups.length === 0 || !hasAtLeastOneFilledGroup) {
      toast.error('Add at least one block.')
      return false
    }
    if (groups.length > MAX_BLOCKS) {
      toast.error(`Maximum ${MAX_BLOCKS} blocks allowed.`)
      return false
    }
    const hasInvalid = groups.some(
      (group) => !group.heading.trim().length || !group.text.trim().length,
    )
    if (hasInvalid) {
      toast.error('Each block requires heading and text. Image is optional.')
      return false
    }
    if (thumbnail && !thumbnail.type.startsWith('image/')) {
      toast.error('Thumbnail must be an image file.')
      return false
    }
    const hasInvalidMediaType = groups.some(
      (group) => group.mediaFile !== null && !group.mediaFile.type.startsWith('image/'),
    )
    if (hasInvalidMediaType) {
      toast.error('Block media must be image files only.')
      return false
    }
    return true
  }

  const submit = async () => {
    if (!validate()) return
    const formData = buildFormData()

    if (mode === 'create') {
      if (!onSubmitCreate) return
      await onSubmitCreate(formData)
      return
    }

    if (!onSubmitEdit) return
    await onSubmitEdit(formData)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await submit()
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="post-title">Title</Label>
          <Input
            id="post-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter post title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="post-category-id">Category</Label>
          <select
            id="post-category-id"
            value={categoryId}
            disabled={categoriesLoading}
            onChange={(event) => setCategoryId(event.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
          >
            {categoriesLoading ? <option value="">Loading categories...</option> : null}
            {!categoriesLoading && categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : null}
            {!categoriesLoading
              ? categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))
              : null}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="post-status">Status</Label>
          <select
            id="post-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as 'draft' | 'published')}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="post-thumbnail">Thumbnail (required)</Label>
          <Input
            id="post-thumbnail"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              if (file && !file.type.startsWith('image/')) {
                toast.error('Thumbnail must be an image file.')
                event.currentTarget.value = ''
                setThumbnail(null)
                return
              }
              setThumbnail(file)
            }}
          />
          {mode === 'edit' && hasExistingThumbnail ? (
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <img
                src={initialPost?.thumbnail}
                alt="Current thumbnail"
                className="max-h-56 w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Blocks: heading + text required. Image is optional.
          </p>
          <Button type="button" size="sm" variant="outline" onClick={addGroup}>
            + Add Block
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {groups.length}/{MAX_BLOCKS} blocks used
        </p>

        <div className="space-y-3">
          {groups.map((group, index) => (
            <div key={group.id} className="space-y-3 rounded-lg border border-border/70 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Block #{index + 1}
                </p>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => removeGroup(group.id)}
                >
                  Remove
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Heading</Label>
                <Input
                  value={group.heading}
                  onChange={(event) => updateGroup(group.id, { heading: event.target.value })}
                  placeholder="Heading"
                />
              </div>

              <div className="space-y-2">
                <Label>Image (optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    if (file && !file.type.startsWith('image/')) {
                      toast.error('Block media must be an image file.')
                      event.currentTarget.value = ''
                      return
                    }
                    const prev = groups.find((item) => item.id === group.id)
                    if (prev?.previewUrl.startsWith('blob:')) {
                      URL.revokeObjectURL(prev.previewUrl)
                    }
                    updateGroup(group.id, {
                      mediaFile: file,
                      previewUrl: file ? URL.createObjectURL(file) : group.existingMediaUrl,
                    })
                  }}
                />
                {group.previewUrl ? (
                  <div className="overflow-hidden rounded-xl border border-border bg-surface">
                    <img
                      src={group.previewUrl}
                      alt="Block preview"
                      className="max-h-80 w-full object-cover"
                    />
                  </div>
                ) : null}
                {group.existingMediaUrl ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">Existing image attached.</span>
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        if (group.previewUrl.startsWith('blob:')) {
                          URL.revokeObjectURL(group.previewUrl)
                        }
                        updateGroup(group.id, {
                          mediaId: null,
                          existingMediaUrl: '',
                          mediaFile: null,
                          previewUrl: '',
                        })
                      }}
                    >
                      Remove image
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Text</Label>
                <textarea
                  value={group.text}
                  onChange={(event) => updateGroup(group.id, { text: event.target.value })}
                  className="min-h-56 w-full rounded-xl border border-input bg-background px-4 py-3 text-base leading-8 outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="Text"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? mode === 'create'
              ? 'Creating...'
              : 'Updating...'
            : mode === 'create'
              ? 'Create Post'
              : 'Update Post'}
        </Button>
      </div>
    </form>
  )
}
