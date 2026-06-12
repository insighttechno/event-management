import { useMemo, useState } from 'react'
import { Download, Eye, FileText, History, Image } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { documents } from '@/data/documents'
import { events } from '@/data/events'
import { formatDate } from '@/lib/utils'

export default function ClientDocuments() {
  const event = events[0]
  const sharedDocs = useMemo(
    () => documents.filter((doc) => doc.sharedWithClient && doc.client === event.client),
    [event.client]
  )
  const folders = useMemo(
    () => [...new Set(sharedDocs.map((doc) => doc.folder))],
    [sharedDocs]
  )

  const [folderFilter, setFolderFilter] = useState('All')
  const [previewTarget, setPreviewTarget] = useState(null)
  const [downloads, setDownloads] = useState([])

  const visibleDocs =
    folderFilter === 'All'
      ? sharedDocs
      : sharedDocs.filter((doc) => doc.folder === folderFilter)

  const downloadDocument = (doc) => {
    setDownloads((prev) => [
      { id: prev.length + 1, name: doc.name, date: new Date().toISOString().slice(0, 10) },
      ...prev,
    ])
    toast.success(`Downloading "${doc.name}"...`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Documents"
        description="Files shared with you by the planning team."
      />

      <Card>
        <CardHeader>
          <CardTitle>Shared Files</CardTitle>
          <CardDescription>{visibleDocs.length} documents available</CardDescription>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {['All', ...folders].map((folder) => (
              <button
                key={folder}
                type="button"
                onClick={() => setFolderFilter(folder)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  folderFilter === folder
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                )}
              >
                {folder}
                <span className="ml-1.5 opacity-70">
                  {folder === 'All'
                    ? sharedDocs.length
                    : sharedDocs.filter((doc) => doc.folder === folder).length}
                </span>
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {visibleDocs.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No documents in this folder.
            </p>
          )}
          {visibleDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                {doc.name.match(/\.(png|jpe?g|gif)$/i) ? (
                  <Image className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.folder} · {doc.size} · Updated {formatDate(doc.uploadedAt)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setPreviewTarget(doc)}
                  aria-label={`Preview ${doc.name}`}
                >
                  <Eye className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => downloadDocument(doc)}
                  aria-label={`Download ${doc.name}`}
                >
                  <Download className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5 text-muted-foreground" />
            Download History
          </CardTitle>
          <CardDescription>
            {downloads.length} download{downloads.length !== 1 ? 's' : ''} this session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {downloads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Files you download will be listed here.
            </p>
          ) : (
            downloads.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <p className="truncate">{entry.name}</p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(entry.date)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewTarget} onOpenChange={(open) => !open && setPreviewTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          {previewTarget && (
            <>
              <DialogHeader>
                <DialogTitle>{previewTarget.name}</DialogTitle>
                <DialogDescription>
                  {previewTarget.folder} · {previewTarget.size} · Updated{' '}
                  {formatDate(previewTarget.uploadedAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
                <div className="text-center">
                  {previewTarget.name.match(/\.(png|jpe?g|gif)$/i) ? (
                    <Image className="mx-auto size-10 text-muted-foreground/50" />
                  ) : (
                    <FileText className="mx-auto size-10 text-muted-foreground/50" />
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    Document preview (demo placeholder)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => downloadDocument(previewTarget)}
                  className="gap-1.5"
                >
                  <Download className="size-4" />
                  Download
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
