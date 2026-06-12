import { useMemo, useState } from 'react'
import { Mail, Phone, Plus, Search, Star } from 'lucide-react'
import { toast } from 'sonner'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { vendorCategories } from '@/data/vendors'
import { vendorsService } from '@/services/vendors'
import { eventsService } from '@/services/events'
import { formatDate } from '@/lib/utils'

const vendorFields = [
  { name: 'name', label: 'Vendor name', span: 'full', required: true },
  { name: 'category', label: 'Category', type: 'select', options: vendorCategories },
  { name: 'contact', label: 'Contact person' },
  { name: 'phone', label: 'Phone' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'rating', label: 'Rating', type: 'number', min: 0, max: 5, step: '0.1' },
  { name: 'eventsCount', label: 'Events worked', type: 'number', min: 0 },
  { name: 'notes', label: 'Notes', type: 'textarea', span: 'full' },
]

const emptyVendor = {
  name: '',
  category: vendorCategories[0],
  contact: '',
  phone: '',
  email: '',
  rating: '',
  eventsCount: '',
  notes: '',
}

function assignedEventsFor(vendorId) {
  return eventsService
    .list()
    .filter((event) => eventsService.vendorIdsFor(event.id).includes(vendorId))
}

export default function Vendors() {
  const [vendors, setVendors] = useState(() => vendorsService.list())
  const [formOpen, setFormOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [profileVendorId, setProfileVendorId] = useState(null)

  const profileVendor = vendors.find((vendor) => vendor.id === profileVendorId) ?? null

  const filteredVendors = useMemo(() => {
    const query = search.trim().toLowerCase()
    return vendors.filter((vendor) => {
      if (categoryFilter !== 'all' && vendor.category !== categoryFilter) return false
      if (!query) return true
      return [vendor.name, vendor.contact, vendor.email, vendor.category]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [vendors, search, categoryFilter])

  const openAddDialog = () => {
    setEditingVendor(null)
    setFormOpen(true)
  }

  const openEditDialog = (vendor) => {
    setEditingVendor(vendor)
    setFormOpen(true)
  }

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      rating: Number(values.rating) || 0,
      eventsCount: Number(values.eventsCount) || 0,
    }

    if (editingVendor) {
      vendorsService.update(editingVendor.id, payload)
      toast.success(`Vendor "${payload.name}" updated.`)
    } else {
      vendorsService.create(payload)
      toast.success(`Vendor "${payload.name}" added.`)
    }
    setVendors(vendorsService.list())
  }

  const handleDelete = () => {
    vendorsService.remove(deleteTarget.id)
    setVendors(vendorsService.list())
    toast.success(`Vendor "${deleteTarget.name}" deleted.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vendor Management"
        description="Trusted vendors and partners across both businesses."
        action={
          <Button onClick={openAddDialog} className="gap-1.5">
            <Plus className="size-4" />
            Add Vendor
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Vendor Directory</CardTitle>
          <CardDescription>
            {filteredVendors.length} of {vendors.length} vendors shown
          </CardDescription>
          <div className="mt-2 flex flex-wrap gap-2">
            <div className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search vendors..."
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {vendorCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {filteredVendors.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No vendors match your search.
            </p>
          )}
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-sm font-semibold text-secondary">
                {vendor.name
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')}
              </div>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  className="text-left font-medium leading-tight hover:underline"
                  onClick={() => setProfileVendorId(vendor.id)}
                >
                  {vendor.name}
                </button>
                <p className="truncate text-xs text-muted-foreground">
                  {vendor.contact} · {vendor.phone}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="size-3.5 fill-accent text-accent" />
                  {vendor.rating}
                </span>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {vendor.eventsCount} events
                </span>
                <Badge variant="secondary">{vendor.category}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProfileVendorId(vendor.id)}
                >
                  Profile
                </Button>
                <RowActions
                  onEdit={() => openEditDialog(vendor)}
                  onDelete={() => setDeleteTarget(vendor)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <VendorProfileSheet
        vendor={profileVendor}
        onOpenChange={(open) => !open && setProfileVendorId(null)}
        onEdit={() => {
          openEditDialog(profileVendor)
          setProfileVendorId(null)
        }}
      />

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingVendor ? 'Edit Vendor' : 'Add Vendor'}
        description={
          editingVendor
            ? 'Update this vendor and save your changes.'
            : 'Add a new vendor to the directory.'
        }
        fields={vendorFields}
        defaultValues={editingVendor ?? emptyVendor}
        onSubmit={handleSubmit}
        submitLabel={editingVendor ? 'Save changes' : 'Add vendor'}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this vendor?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed from the directory. This cannot be undone.`
            : ''
        }
        onConfirm={handleDelete}
      />
    </div>
  )
}

function VendorProfileSheet({ vendor, onOpenChange, onEdit }) {
  const assignedEvents = vendor ? assignedEventsFor(vendor.id) : []
  const communications = vendor ? vendorsService.communicationsFor(vendor.id) : []

  return (
    <Sheet open={!!vendor} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {vendor && (
          <>
            <SheetHeader>
              <SheetTitle>{vendor.name}</SheetTitle>
              <SheetDescription>
                {vendor.category} · {vendor.eventsCount} events worked
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-5 px-4 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{vendor.category}</Badge>
                <Badge variant="outline" className="gap-1">
                  <Star className="size-3 fill-accent text-accent" />
                  {vendor.rating}
                </Badge>
              </div>

              <div className="grid gap-2 text-sm">
                <p className="font-medium">{vendor.contact}</p>
                <p className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  {vendor.email || '—'}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  {vendor.phone || '—'}
                </p>
              </div>

              {vendor.notes && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">{vendor.notes}</div>
              )}

              <Button size="sm" variant="outline" className="self-start" onClick={onEdit}>
                Edit vendor
              </Button>

              <div>
                <h3 className="mb-2 text-sm font-semibold">Assigned events</h3>
                {assignedEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Not assigned to any events yet. Assign vendors from an event's detail page.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {assignedEvents.map((event) => (
                      <div key={event.id} className="rounded-lg border border-border p-3">
                        <p className="text-sm font-medium">{event.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(event.date)} · {event.venue}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">Communication history</h3>
                {communications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No communications logged yet.</p>
                ) : (
                  <ol className="relative flex flex-col gap-3 border-l border-border pl-4">
                    {communications.map((entry) => (
                      <li key={entry.id} className="relative">
                        <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-card bg-primary" />
                        <p className="text-sm">
                          <span className="font-medium">{entry.type}</span>
                          <span className="text-muted-foreground">
                            {' '}
                            · {formatDate(entry.date)} · {entry.by}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">{entry.summary}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
