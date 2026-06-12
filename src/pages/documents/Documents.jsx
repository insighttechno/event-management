import { useMemo, useRef, useState } from 'react'
import {
  Download,
  FilePlus2,
  FileText,
  FolderOpen,
  Image,
  LayoutTemplate,
  Send,
  Share2,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/common/PageHeader'
import { EntityFormDialog } from '@/components/common/EntityFormDialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { RowActions } from '@/components/common/RowActions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { documentFolders } from '@/data/documents'
import { documentsService, templatesService } from '@/services/documents'
import { contractsService } from '@/services/finance'
import { formatDate } from '@/lib/utils'

const statusVariant = {
  Signed: 'secondary',
  'Awaiting Signature': 'outline',
}

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

const generateFields = [
  { name: 'title', label: 'Contract title', span: 'full', required: true },
  { name: 'client', label: 'Client', span: 'full', required: true, placeholder: 'e.g. Sarah & James Whitfield' },
  { name: 'event', label: 'Event', span: 'full', placeholder: 'e.g. Whitfield Wedding' },
]

export default function Documents() {
  const contractTemplates = templatesService.list()
  const [contracts, setContracts] = useState(() => contractsService.list())
  const [documents, setDocuments] = useState(() => documentsService.list())
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [folderFilter, setFolderFilter] = useState('All')
  const [signTarget, setSignTarget] = useState(null)
  const [generateTemplate, setGenerateTemplate] = useState(null)

  const filteredDocuments = useMemo(
    () =>
      folderFilter === 'All'
        ? documents
        : documents.filter((doc) => doc.folder === folderFilter),
    [documents, folderFilter]
  )

  const handleUpload = (files, { folder, client }) => {
    for (const file of files) {
      documentsService.create({
        name: file.name,
        size: formatFileSize(file.size),
        folder,
        client,
        uploadedAt: new Date().toISOString().slice(0, 10),
        sharedWithClient: false,
      })
    }
    setDocuments(documentsService.list())
    toast.success(
      files.length === 1
        ? `"${files[0].name}" uploaded.`
        : `${files.length} files uploaded to ${folder}.`
    )
  }

  const toggleShare = (doc) => {
    documentsService.update(doc.id, { sharedWithClient: !doc.sharedWithClient })
    setDocuments(documentsService.list())
    toast.success(
      doc.sharedWithClient
        ? `"${doc.name}" is no longer shared with the client.`
        : `"${doc.name}" shared with ${doc.client || 'the client'}.`
    )
  }

  const downloadDocument = (doc) => {
    toast.success(`Downloading "${doc.name}"...`)
  }

  const handleDelete = () => {
    documentsService.remove(deleteTarget.id)
    setDocuments(documentsService.list())
    toast.success(`"${deleteTarget.name}" deleted.`)
  }

  const generateContract = (values) => {
    contractsService.create({
      ...values,
      status: 'Draft',
      sentDate: null,
      signedDate: null,
    })
    setContracts(contractsService.list())
    toast.success(`"${values.title}" generated from the "${generateTemplate.name}" template.`)
  }

  const markSent = (contract) => {
    contractsService.update(contract.id, {
      status: 'Awaiting Signature',
      sentDate: new Date().toISOString().slice(0, 10),
    })
    setContracts(contractsService.list())
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Documents & Contracts"
        description="Client files, contract templates and the e-signature workflow."
        action={
          <Button onClick={() => setUploadOpen(true)} className="gap-1.5">
            <Upload className="size-4" />
            Upload Document
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="size-5 text-muted-foreground" />
            Document Library
          </CardTitle>
          <CardDescription>{filteredDocuments.length} files</CardDescription>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {['All', ...documentFolders].map((folder) => (
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
                    ? documents.length
                    : documents.filter((doc) => doc.folder === folder).length}
                </span>
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredDocuments.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No documents in this folder yet.
            </p>
          )}
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                {doc.name.match(/\.(png|jpe?g|gif)$/i) ? (
                  <Image className="size-5 shrink-0 text-muted-foreground" />
                ) : (
                  <FileText className="size-5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.folder} · {doc.client || 'Internal'} · {doc.size} ·{' '}
                    {formatDate(doc.uploadedAt)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {doc.sharedWithClient && (
                  <Badge variant="secondary" className="gap-1">
                    <Share2 className="size-3" />
                    Shared
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => toggleShare(doc)}
                >
                  <Share2 className="size-3.5" />
                  {doc.sharedWithClient ? 'Unshare' : 'Share'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => downloadDocument(doc)}>
                  <Download className="size-4" />
                  <span className="sr-only">Download</span>
                </Button>
                <RowActions onDelete={() => setDeleteTarget(doc)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutTemplate className="size-5 text-muted-foreground" />
            Contract Templates
          </CardTitle>
          <CardDescription>
            Reusable templates — generate a new contract for any client in seconds
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {contractTemplates.map((template) => (
            <div
              key={template.id}
              className="flex flex-col gap-2 rounded-lg border border-border p-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  Updated {formatDate(template.updatedAt)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setGenerateTemplate(template)}
                >
                  <FilePlus2 className="size-3.5" />
                  Generate contract
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contracts & E-Signature</CardTitle>
          <CardDescription>{contracts.length} contracts on file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium">{contract.title}</p>
                <p className="text-xs text-muted-foreground">
                  {contract.client} &middot; {contract.event}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                  {contract.sentDate ? `Sent ${formatDate(contract.sentDate)}` : 'Not sent yet'}
                </span>
                <Badge variant={statusVariant[contract.status] ?? 'outline'}>
                  {contract.status}
                </Badge>
                {contract.status !== 'Signed' && (
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setSignTarget(contract)}
                  >
                    <Send className="size-3.5" />
                    Send for signature
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <SendForSignatureDialog
        contract={signTarget}
        onOpenChange={(open) => !open && setSignTarget(null)}
        onSent={markSent}
      />

      <EntityFormDialog
        open={!!generateTemplate}
        onOpenChange={(open) => !open && setGenerateTemplate(null)}
        title="Generate Contract"
        description={
          generateTemplate
            ? `Create a new contract from the "${generateTemplate.name}" template.`
            : ''
        }
        fields={generateFields}
        defaultValues={{ title: generateTemplate?.name ?? '', client: '', event: '' }}
        onSubmit={generateContract}
        submitLabel="Generate contract"
      />

      <UploadDocumentDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={handleUpload}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this document?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed. This cannot be undone.`
            : ''
        }
        onConfirm={handleDelete}
      />
    </div>
  )
}

function UploadDocumentDialog({ open, onOpenChange, onUpload }) {
  const inputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [folder, setFolder] = useState(documentFolders[0])
  const [client, setClient] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const close = () => {
    onOpenChange(false)
    setFiles([])
    setFolder(documentFolders[0])
    setClient('')
    setDragOver(false)
  }

  const addFiles = (fileList) => {
    const incoming = [...fileList]
    if (!incoming.length) return
    setFiles((prev) => {
      const names = new Set(prev.map((file) => file.name))
      return [...prev, ...incoming.filter((file) => !names.has(file.name))]
    })
  }

  const removeFile = (name) => {
    setFiles((prev) => prev.filter((file) => file.name !== name))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!files.length) return
    onUpload(files, { folder, client })
    close()
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Browse or drag files to add them to the document library.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="contents">
          <div className="flex flex-col gap-4 py-1">
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files)
                event.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault()
                setDragOver(false)
                addFiles(event.dataTransfer.files)
              }}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-border px-4 py-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/40',
                dragOver && 'border-primary bg-primary/5'
              )}
            >
              <Upload className="size-6 text-muted-foreground" />
              <span className="text-sm font-medium">
                Click to browse files
              </span>
              <span className="text-xs text-muted-foreground">
                or drag & drop them here
              </span>
            </button>

            {files.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(file.name)}
                      className="shrink-0 text-muted-foreground/60 hover:text-destructive"
                    >
                      <X className="size-4" />
                      <span className="sr-only">Remove {file.name}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="upload-folder">Folder</Label>
                <Select value={folder} onValueChange={setFolder}>
                  <SelectTrigger id="upload-folder" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentFolders.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="upload-client">Client</Label>
                <Input
                  id="upload-client"
                  value={client}
                  onChange={(event) => setClient(event.target.value)}
                  placeholder="e.g. Sarah & James Whitfield"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={!files.length} className="gap-1.5">
              <Upload className="size-4" />
              Upload {files.length > 0 && `(${files.length})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SendForSignatureDialog({ contract, onOpenChange, onSent }) {
  const [step, setStep] = useState(1)

  const close = () => {
    onOpenChange(false)
    setStep(1)
  }

  const send = () => {
    onSent(contract)
    toast.success(`"${contract.title}" sent to ${contract.client} for signature.`)
    close()
  }

  return (
    <Dialog open={!!contract} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        {contract && (
          <>
            <DialogHeader>
              <DialogTitle>Send for signature</DialogTitle>
              <DialogDescription>
                Step {step} of 2 — {step === 1 ? 'Review document' : 'Confirm & send'}
              </DialogDescription>
            </DialogHeader>

            {step === 1 ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="size-4 text-muted-foreground" />
                    {contract.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {contract.client} · {contract.event}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  The client will receive a secure link to review and digitally sign this
                  document in their portal.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border border-border p-4 text-sm">
                  <p>
                    <span className="text-muted-foreground">To:</span>{' '}
                    <span className="font-medium">{contract.client}</span>
                  </p>
                  <p className="mt-1">
                    <span className="text-muted-foreground">Document:</span>{' '}
                    <span className="font-medium">{contract.title}</span>
                  </p>
                  <p className="mt-1">
                    <span className="text-muted-foreground">Signature method:</span> Draw or
                    type in client portal
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  The contract status will change to "Awaiting Signature" once sent.
                </p>
              </div>
            )}

            <DialogFooter>
              {step === 1 ? (
                <>
                  <Button variant="outline" onClick={close}>
                    Cancel
                  </Button>
                  <Button onClick={() => setStep(2)}>Continue</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={send} className="gap-1.5">
                    <Send className="size-4" />
                    Send to client
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
