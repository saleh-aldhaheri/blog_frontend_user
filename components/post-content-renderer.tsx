
import type { PostContentBlock } from '@/src/v1/types/response/post'

type PostContentRendererProps = {
  blocks: PostContentBlock[]
  postTitle: string
}

function byOrder(a: PostContentBlock, b: PostContentBlock) {
  return Number(a.order) - Number(b.order)
}

function toAbsoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  if (path.startsWith('//')) return `https:${path}`
  const base = import.meta.env.VITE_API_URL_V1 ?? ''
  const origin = base.replace(/\/api\/v1\/?$/, '')
  if (!origin) return path
  if (path.startsWith('/')) return `${origin}${path}`
  return `${origin}/${path}`
}

function collectStringCandidates(value: unknown, depth = 0): string[] {
  if (depth > 4 || value == null) return []
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStringCandidates(item, depth + 1))
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const preferredKeys = [
      'url',
      'path',
      'src',
      'file',
      'file_path',
      'media',
      'image',
      'value',
    ]
    const preferred = preferredKeys.flatMap((key) =>
      key in obj ? collectStringCandidates(obj[key], depth + 1) : [],
    )
    const rest = Object.values(obj).flatMap((item) =>
      collectStringCandidates(item, depth + 1),
    )
    return [...preferred, ...rest]
  }
  return []
}

function resolveMediaUrl(block: PostContentBlock) {
  const rawCandidates = collectStringCandidates({
    file: block.file,
    value: block.value,
    url: (block as { url?: unknown }).url,
    media: (block as { media?: unknown }).media,
    src: (block as { src?: unknown }).src,
    path: (block as { path?: unknown }).path,
  })

  for (const candidate of rawCandidates) {
    const trimmed = candidate.trim()
    if (!trimmed) continue
    if (
      /^https?:\/\//i.test(trimmed) ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('storage/') ||
      trimmed.startsWith('uploads/')
    ) {
      return toAbsoluteUrl(trimmed)
    }
  }
  return ''
}

export default function PostContentRenderer({
  blocks,
  postTitle,
}: PostContentRendererProps) {
  const orderedBlocks = [...blocks].sort(byOrder)

  return (
    <div className="space-y-5">
      {orderedBlocks.map((block, index) => {
        const blockType = String(block.type).toLowerCase()
        const key = `${blockType}-${block.order}-${index}`

        if (blockType === 'heading') {
          return (
            <h2 key={key} className="text-2xl font-semibold leading-snug text-foreground">
              {typeof block.value === 'string' && block.value.trim()
                ? block.value
                : 'Untitled section'}
            </h2>
          )
        }

        if (blockType === 'text') {
          return (
            <p key={key} className="whitespace-pre-line leading-8 text-foreground/90">
              {typeof block.value === 'string' && block.value.trim()
                ? block.value
                : ''}
            </p>
          )
        }

        if (blockType === 'media' || blockType === 'image' || blockType === 'photo') {
          const mediaUrl = resolveMediaUrl(block)

          if (!mediaUrl) return null

          return (
            <div key={key} className="overflow-hidden rounded-2xl border border-border">
              <img
                src={mediaUrl}
                alt={postTitle}
                className="max-h-[32rem] w-full object-cover"
              />
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
