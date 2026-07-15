import { useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Heart, Image, X, Images, Camera, Film, Play } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/common/PageHeader'
import { StatStrip } from '@/components/common/StatStrip'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/use-auth'
import { resolveClient } from '@/lib/client-scope'
import { galleries } from '@/data/finance'

const statusVariant = {
  Delivered: 'secondary',
  Editing: 'outline',
  'In Progress': 'outline',
}

// Real demo media (no backend yet) — cycled across the grid.
const GALLERY_PHOTOS = [
  '/images/gallery/g1.jpg', '/images/gallery/g2.jpg', '/images/gallery/g3.jpg',
  '/images/gallery/g4.jpg', '/images/gallery/g5.jpg', '/images/gallery/g6.jpg',
]
const VIDEO_DURATIONS = ['1:24', '3:05', '2:38', '4:12', '0:58', '2:15']

function demoPhotos(gallery) {
  return Array.from({ length: Math.min(gallery.photoCount, 12) }, (_, i) => ({
    id: `${gallery.id}-photo-${i + 1}`,
    name: `Photo ${i + 1} of ${gallery.photoCount}`,
    src: GALLERY_PHOTOS[i % GALLERY_PHOTOS.length],
  }))
}

function demoVideos(gallery) {
  return Array.from({ length: Math.min(gallery.videoCount, 8) }, (_, i) => ({
    id: `${gallery.id}-video-${i + 1}`,
    name: `Film ${i + 1} of ${gallery.videoCount}`,
    src: GALLERY_PHOTOS[(i + 2) % GALLERY_PHOTOS.length],
    duration: VIDEO_DURATIONS[i % VIDEO_DURATIONS.length],
    isVideo: true,
  }))
}

export default function ClientGallery() {
  const { user, brand } = useAuth()
  const { me } = resolveClient(brand, user?.name)
  const myGalleries = galleries.filter((g) => g.client === me?.name)
  const [open, setOpen] = useState(null) // { gallery, type: 'photos' | 'videos' }
  const [favorites, setFavorites] = useState({})
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Each gallery becomes a photo collection + (if it has videos) a film collection.
  const collections = myGalleries.flatMap((g) => {
    const delivered = g.status === 'Delivered'
    const list = [{
      key: `${g.id}-photos`, gallery: g, type: 'photos', delivered,
      title: g.title, subtitle: g.photoCount > 0 ? `${g.photoCount} photos` : 'Not yet available',
      cover: g.cover || GALLERY_PHOTOS[0], status: g.status, photographer: g.photographer,
    }]
    if (g.videoCount > 0) {
      list.push({
        key: `${g.id}-videos`, gallery: g, type: 'videos', delivered,
        title: `${g.title} — Films`, subtitle: `${g.videoCount} videos`,
        cover: GALLERY_PHOTOS[3], status: g.status, photographer: g.photographer,
      })
    }
    return list
  })

  const media = open ? (open.type === 'videos' ? demoVideos(open.gallery) : demoPhotos(open.gallery)) : []

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      if (next[id]) toast.success('Added to favorites.')
      return next
    })
  }

  const downloadItem = (item) => toast.success(`Downloading ${item.name}...`)
  const favoriteCount = Object.values(favorites).filter(Boolean).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Gallery"
        description="Photos and films from your sessions and event."
      />

      {!open && (
        <StatStrip items={[
          { label: 'Your galleries', value: myGalleries.length, icon: Images, accent: 'navy' },
          { label: 'Total photos', value: myGalleries.reduce((s, g) => s + g.photoCount, 0), icon: Camera, accent: 'primary' },
          { label: 'Total films', value: myGalleries.reduce((s, g) => s + g.videoCount, 0), icon: Film, accent: 'secondary' },
        ]} />
      )}

      {!open ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((c) => {
            const isVideo = c.type === 'videos'
            return (
              <button
                key={c.key}
                type="button"
                disabled={!c.delivered}
                onClick={() => c.delivered && setOpen({ gallery: c.gallery, type: c.type })}
                className={cn(
                  'group relative block aspect-[4/5] overflow-hidden rounded-2xl text-left ring-1 ring-border transition-all',
                  c.delivered ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : 'cursor-not-allowed',
                )}
              >
                <img src={c.cover} alt={c.title}
                  className={cn('size-full object-cover transition-transform duration-500', c.delivered ? 'group-hover:scale-105' : 'blur-[3px] brightness-75')} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                {/* Media-type chip */}
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                  {isVideo ? <Film className="size-3" /> : <Camera className="size-3" />}
                  {isVideo ? 'Films' : 'Photos'}
                </span>
                <Badge variant={statusVariant[c.status] ?? 'outline'} className="absolute right-3 top-3 shadow-sm">{c.status}</Badge>

                {/* Play button for video boxes */}
                {isVideo && c.delivered && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-lg transition-transform group-hover:scale-110">
                      <Play className="size-6 translate-x-0.5 fill-current" />
                    </span>
                  </span>
                )}

                {!c.delivered && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full bg-black/50 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">Being prepared ✨</span>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="font-display text-lg font-semibold leading-tight drop-shadow">{c.title}</p>
                  <p className="mt-0.5 text-xs text-white/85">{c.photographer} · {c.subtitle}</p>
                  {c.delivered && (
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-sm transition-colors group-hover:bg-white">
                      {isVideo ? <><Play className="size-3.5 fill-current" />Watch films</> : <><Image className="size-3.5" />View gallery</>}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {open.type === 'videos' ? <Film className="size-5 text-muted-foreground" /> : <Camera className="size-5 text-muted-foreground" />}
                  {open.type === 'videos' ? `${open.gallery.title} — Films` : open.gallery.title}
                </CardTitle>
                <CardDescription>
                  {open.type === 'videos'
                    ? `${open.gallery.videoCount} films`
                    : `${open.gallery.photoCount} photos · ${favoriteCount} favorited`}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setOpen(null)}>
                <X className="size-4" />
                Back to gallery
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {media.map((item, index) => (
                <div key={item.id} className="group relative">
                  <button
                    type="button"
                    className="block aspect-square w-full overflow-hidden rounded-lg"
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`Open ${item.name}`}
                  >
                    <img src={item.src} alt={item.name} loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    {item.isVideo && (
                      <>
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="flex size-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
                            <Play className="size-4 translate-x-0.5 fill-current" />
                          </span>
                        </span>
                        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">{item.duration}</span>
                      </>
                    )}
                  </button>
                  {!item.isVideo && (
                    <button
                      type="button"
                      onClick={() => toggleFavorite(item.id)}
                      className="absolute top-2 right-2 rounded-full bg-black/30 p-1.5 backdrop-blur-sm transition-colors hover:bg-black/50"
                      aria-label="Toggle favorite"
                    >
                      <Heart className={cn('size-4', favorites[item.id] ? 'fill-red-500 text-red-500' : 'text-white')} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={lightboxIndex !== null} onOpenChange={(o) => !o && setLightboxIndex(null)}>
        <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
          {lightboxIndex !== null && media[lightboxIndex] && (
            <>
              <DialogTitle className="sr-only">{media[lightboxIndex].name}</DialogTitle>
              <div className="relative">
                <img
                  src={media[lightboxIndex].src}
                  alt={media[lightboxIndex].name}
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Close"
                  className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-black/50 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <X className="size-5" />
                </button>
                {media[lightboxIndex].isVideo && (
                  <button
                    type="button"
                    onClick={() => toast.success('Playing film…', { description: 'Video streaming connects during development.' })}
                    className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 transition-colors hover:bg-black/30"
                    aria-label="Play film"
                  >
                    <span className="flex size-16 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-xl">
                      <Play className="size-7 translate-x-0.5 fill-current" />
                    </span>
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {media[lightboxIndex].name}
                  {media[lightboxIndex].isVideo && <> · {media[lightboxIndex].duration}</>}
                </p>
                <div className="flex items-center gap-2">
                  <Button size="icon-sm" variant="outline" onClick={() => setLightboxIndex((i) => (i - 1 + media.length) % media.length)} aria-label="Previous">
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button size="icon-sm" variant="outline" onClick={() => setLightboxIndex((i) => (i + 1) % media.length)} aria-label="Next">
                    <ChevronRight className="size-4" />
                  </Button>
                  {!media[lightboxIndex].isVideo && (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toggleFavorite(media[lightboxIndex].id)}>
                      <Heart className={cn('size-4', favorites[media[lightboxIndex].id] && 'fill-red-500 text-red-500')} />
                      {favorites[media[lightboxIndex].id] ? 'Favorited' : 'Favorite'}
                    </Button>
                  )}
                  <Button size="sm" className="gap-1.5" onClick={() => downloadItem(media[lightboxIndex])}>
                    <Download className="size-4" />
                    Download
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
