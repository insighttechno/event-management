import { useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Plus, Check, FileText, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { BackHeader } from '@/components/common/BackHeader'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { RowActions } from '@/components/common/RowActions'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { documents as initialDocuments, documentFolders } from '@/data/documents'
import {
  brandOfPerson, getActiveBrand, matchesBrand, subscribeActiveBrand,
} from '@/lib/brand-scope'
import { formatDate } from '@/lib/utils'

const emptyForm = {
  name: '', folder: 'Contracts', client: '', size: '', sharedWithClient: false,
}

export default function Documents() {
  const [allDocuments, setDocuments] = useState(initialDocuments)
  const activeBrand = useSyncExternalStore(subscribeActiveBrand, getActiveBrand)

  // A document has no brand — it belongs to a client (who may still be a lead).
  const documents = useMemo(
    () => allDocuments.filter((d) => matchesBrand(brandOfPerson(d.client), activeBrand)),
    [allDocuments, activeBrand]
  )
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmSave, setConfirmSave] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fileRef = useRef(null)
  const formatSize = (b) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`)
  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    if (f) setForm((p) => ({ ...p, name: f.name, size: formatSize(f.size) }))
  }

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))
  const startAdd = () => { setEditing(null); setForm(emptyForm); setView('form') }
  const startEdit = (d) => { setEditing(d); setForm({ ...d }); setView('form') }

  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      cell: (d) => (
        <span className="inline-flex items-center gap-2 font-medium">
          <FileText className="size-4 shrink-0 text-muted-foreground" />{d.name}
        </span>
      ),
    },
    { key: 'folder', header: 'Folder', sortable: true, cell: (d) => <Badge variant="outline">{d.folder}</Badge> },
    { key: 'client', header: 'Client', sortable: true, className: 'text-sm' },
    { key: 'size', header: 'Size', sortable: true, className: 'text-sm text-muted-foreground' },
    {
      key: 'uploadedAt',
      header: 'Uploaded',
      sortable: true,
      className: 'text-sm',
      cell: (d) => formatDate(d.uploadedAt),
    },
    {
      key: 'sharedWithClient',
      header: 'Shared',
      sortable: true,
      cell: (d) => (d.sharedWithClient
        ? <Badge className="bg-emerald-500/15 text-emerald-700" variant="secondary">Shared</Badge>
        : <Badge variant="outline">Private</Badge>),
    },
    {
      key: 'actions',
      header: 'Actions',
      stopClick: true,
      headClassName: 'w-24 text-right',
      cell: (d) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.success(`Downloading ${d.name}.`)}>
            <Download className="size-3.5" />Download
          </Button>
          <RowActions onEdit={() => startEdit(d)} onDelete={() => setDeleteTarget(d)} />
        </div>
      ),
    },
  ], [])

  const saveNow = () => {
    if (editing) {
      setDocuments((prev) => prev.map((d) => (d.id === editing.id ? { ...d, ...form } : d)))
      toast.success('Document updated.')
    } else {
      // Off the FULL list — `documents` is brand-scoped and would collide.
      setDocuments((prev) => [{ ...form, id: `D-${500 + allDocuments.length + 10}`, uploadedAt: new Date().toISOString().slice(0, 10) }, ...prev])
      toast.success('Document uploaded.')
    }
    setView('list')
  }

  const removeNow = () => {
    setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id))
    toast.success('Document deleted.')
  }

  const shared = documents.filter((d) => d.sharedWithClient).length

  if (view === 'form') {
    return (
      <div className="max-w-4xl">
        <BackHeader title={editing ? 'Edit document' : 'Upload document'} backLabel="Back to documents"
          onBack={() => setView('list')} description="Store contracts, permits, floor plans and more — securely." />
        <Card>
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>File</Label>
              <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/30">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Upload className="size-6" /></div>
                {form.name
                  ? <p className="text-sm font-medium">{form.name}{form.size ? <span className="text-muted-foreground"> · {form.size}</span> : null}</p>
                  : <>
                      <p className="text-sm font-medium">Click to choose a file</p>
                      <p className="text-xs text-muted-foreground">PDF, PNG, JPG, DOCX — up to 25 MB</p>
                    </>}
              </button>
            </div>
            <div className="space-y-1.5">
              <Label>Folder</Label>
              <Select value={form.folder} onValueChange={(v) => setField('folder', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{documentFolders.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Input value={form.client} onChange={(e) => setField('client', e.target.value)} placeholder="Sarah & James Whitfield" />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Checkbox id="shared" checked={form.sharedWithClient} onCheckedChange={(v) => setField('sharedWithClient', !!v)} />
              <Label htmlFor="shared" className="font-normal">Share with client (visible in their portal)</Label>
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
              <Button className="gap-1.5" disabled={!form.name.trim()} onClick={() => setConfirmSave(true)}>
                <Check className="size-4" />{editing ? 'Save changes' : 'Upload'}
              </Button>
            </div>
          </CardContent>
        </Card>
        <ConfirmDialog open={confirmSave} onOpenChange={setConfirmSave}
          title={editing ? 'Save changes?' : 'Upload this document?'}
          description={`"${form.name || 'Document'}" will be ${editing ? 'updated' : 'stored'}.`}
          confirmLabel={editing ? 'Save' : 'Upload'} confirmVariant="default" onConfirm={saveNow} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Documents" description="Secure storage for contracts, permits and files — for both parties."
        action={<Button className="gap-1.5" onClick={startAdd}><Plus className="size-4" />Upload document</Button>} />

      <DataTable
        title="All documents"
        description={`${documents.length} files · ${shared} shared with clients`}
        columns={columns}
        rows={documents}
        onRowClick={startEdit}
        searchKeys={['name', 'client', 'folder']}
        searchPlaceholder="Search by file name, client…"
        filters={[
          { key: 'folder', label: 'Folder', options: documentFolders },
          {
            key: 'sharedWithClient',
            label: 'Sharing',
            options: [{ label: 'Shared', value: 'shared' }, { label: 'Private', value: 'private' }],
            match: (d, v) => (v === 'shared' ? d.sharedWithClient : !d.sharedWithClient),
          },
        ]}
        emptyMessage="No documents yet — upload one to get started."
      />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this document?" description={deleteTarget ? `"${deleteTarget.name}" will be permanently removed.` : ''}
        confirmLabel="Delete" onConfirm={removeNow} />
    </div>
  )
}
