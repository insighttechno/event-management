import { useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Heart, Image, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/common/PageHeader'
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
import { events } from '@/data/events'
import { galleries } from '@/data/finance'

const statusVariant = {
  Delivered: 'secondary',
  Editing: 'outline',
  'In Progress': 'outline',
}

// Demo photo tiles — gradient placeholders stand in for real images (no backend yet).
const photoGradients = [
  ['#f6d365', '#fda085'],
  ['#a1c4fd', '#c2e9fb'],
  ['#fbc2eb', '#a6c1ee'],
  ['#84fab0', '#8fd3f4'],
  ['#fccb90', '#d57eeb'],
  ['#e0c3fc', '#8ec5fc'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#fa709a', '#fee140'],
  ['#30cfd0', '#330867'],
  ['#ff9a9e', '#fecfef'],
  ['#fdcbf1', '#e6dee9'],
]

function demoPhotos(gallery) {
  return Array.from({ length: Math.min(gallery.photoCount, 12) }, (_, i) => ({
    id: `${gallery.id}-photo-${i + 1}`,
    name: `Photo ${i + 1} of ${gallery.photoCount}`,
    gradient: photoGradients[i % photoGradients.length],
  }))
}

export default function ClientGallery() {
  const event = events[0]
  const myGalleries = galleries.filter((g) => g.client === event.client)
  const [openGallery, setOpenGallery] = useState(null)
  const [favorites, setFavorites] = useState({})
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const photos = openGallery ? demoPhotos(openGallery) : []

  const toggleFavorite = (photoId) => {
    setFavorites((prev) => {
      const next = { ...prev, [photoId]: !prev[photoId] }
      if (next[photoId]) toast.success('Added to favorites.')
      return next
    })
  }

  const downloadPhoto = (photo) => {
    toast.success(`Downloading ${photo.name}...`)
  }

  const favoriteCount = Object.values(favorites).filter(Boolean).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Photo Gallery"
        description="Access photo galleries from your sessions and event."
      />

      {!openGallery ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {myGalleries.map((gallery) => (
            <Card key={gallery.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{gallery.title}</CardTitle>
                    <CardDescription>{gallery.photographer}</CardDescription>
                  </div>
                  <Badge variant={statusVariant[gallery.status] ?? 'outline'}>
                    {gallery.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {gallery.photoCount > 0 ? `${gallery.photoCount} photos` : 'Not yet available'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={gallery.status !== 'Delivered'}
                  onClick={() => setOpenGallery(gallery)}
                >
                  <Image className="size-4" />
                  View Gallery
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>{openGallery.title}</CardTitle>
                <CardDescription>
                  {openGallery.photoCount} photos · {favoriteCount} favorited
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setOpenGallery(null)}>
                <X className="size-4" />
                Close gallery
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo, index) => (
                <div key={photo.id} className="group relative">
                  <button
                    type="button"
                    className="block aspect-square w-full rounded-lg transition-transform hover:scale-[1.02]"
                    style={{
                      background: `linear-gradient(135deg, ${photo.gradient[0]}, ${photo.gradient[1]})`,
                    }}
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`Open ${photo.name}`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleFavorite(photo.id)}
                    className="absolute top-2 right-2 rounded-full bg-black/30 p-1.5 backdrop-blur-sm transition-colors hover:bg-black/50"
                    aria-label="Toggle favorite"
                  >
                    <Heart
                      className={cn(
                        'size-4',
                        favorites[photo.id] ? 'fill-red-500 text-red-500' : 'text-white'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
            {openGallery.photoCount > photos.length && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Showing {photos.length} of {openGallery.photoCount} photos (demo preview)
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={(open) => !open && setLightboxIndex(null)}
      >
        <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
          {lightboxIndex !== null && photos[lightboxIndex] && (
            <>
              <DialogTitle className="sr-only">{photos[lightboxIndex].name}</DialogTitle>
              <div
                className="aspect-[4/3] w-full rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${photos[lightboxIndex].gradient[0]}, ${photos[lightboxIndex].gradient[1]})`,
                }}
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{photos[lightboxIndex].name}</p>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() =>
                      setLightboxIndex((i) => (i - 1 + photos.length) % photos.length)
                    }
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => setLightboxIndex((i) => (i + 1) % photos.length)}
                    aria-label="Next photo"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => toggleFavorite(photos[lightboxIndex].id)}
                  >
                    <Heart
                      className={cn(
                        'size-4',
                        favorites[photos[lightboxIndex].id] && 'fill-red-500 text-red-500'
                      )}
                    />
                    {favorites[photos[lightboxIndex].id] ? 'Favorited' : 'Favorite'}
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => downloadPhoto(photos[lightboxIndex])}
                  >
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
