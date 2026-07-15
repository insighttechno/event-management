import { useState, useSyncExternalStore } from 'react'
import { Plus, Check, Mail, Phone, Send } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { BackHeader } from '@/components/common/BackHeader'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { RowActions } from '@/components/common/RowActions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { getTeamMembers, setTeamMembers, subscribeTeam } from '@/lib/team-store'
import { teamModules } from '@/data/users'

const roles = ['Administrator', 'Team Member']
const brandAccessOptions = ['All Brands', 'Family Affair', 'Senses At Play']

const roleTone = (r) => (r === 'Administrator' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')
const statusTone = (s) => (s === 'Active' ? 'bg-emerald-500/15 text-emerald-700' : 'bg-amber-500/15 text-amber-700')

const emptyForm = { name: '', email: '', phone: '', title: '', role: 'Team Member', brandAccess: 'All Brands', modules: ['Dashboard'] }

export default function Team() {
  const members = useSyncExternalStore(subscribeTeam, getTeamMembers)
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmSave, setConfirmSave] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))
  const startAdd = () => { setEditing(null); setForm(emptyForm); setView('form') }
  const startEdit = (m) => { setEditing(m); setForm({ ...emptyForm, ...m }); setView('form') }

  const saveNow = () => {
    if (editing) {
      setTeamMembers(members.map((m) => (m.id === editing.id ? { ...m, ...form } : m)))
      toast.success(`${form.name} updated.`)
    } else {
      const initials = form.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
      setTeamMembers([...members, { ...form, id: `U-${members.length + 1}`, initials, status: 'Invited' }])
      toast.success(`Invitation sent to ${form.email} with a set-password link.`)
    }
    setView('list')
  }

  const removeNow = () => {
    setTeamMembers(members.filter((m) => m.id !== deleteTarget.id))
    toast.success(`${deleteTarget.name} removed.`)
  }

  const activeCount = members.filter((m) => m.status === 'Active').length

  if (view === 'form') {
    return (
      <div className="max-w-4xl">
        <BackHeader title={editing ? 'Edit member' : 'Invite team member'} backLabel="Back to team"
          onBack={() => setView('list')} description="Invite by email, set a role and choose which brands they can access." />
        <Card>
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Marco Diaz" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="marco@familyaffairkeywest.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Event Planner" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setField('role', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Brand access</Label>
              <Select value={form.brandAccess} onValueChange={(v) => setField('brandAccess', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{brandAccessOptions.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label>What can they access?</Label>
                <div className="flex gap-1">
                  <Button type="button" size="xs" variant="ghost" onClick={() => setField('modules', [...teamModules])}>Full access</Button>
                  <Button type="button" size="xs" variant="ghost" onClick={() => setField('modules', ['Dashboard'])}>Clear</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 sm:grid-cols-3">
                {teamModules.map((m) => (
                  <label key={m} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.modules.includes(m)}
                      onCheckedChange={() => setForm((p) => ({
                        ...p,
                        modules: p.modules.includes(m) ? p.modules.filter((x) => x !== m) : [...p.modules, m],
                      }))}
                    />
                    {m}
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{form.modules.length} of {teamModules.length} areas selected. The member sees only these in their sidebar.</p>
            </div>

            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
              <Button className="gap-1.5" disabled={!form.name.trim() || !form.email.trim()} onClick={() => setConfirmSave(true)}>
                <Check className="size-4" />{editing ? 'Save changes' : 'Send invite'}
              </Button>
            </div>
          </CardContent>
        </Card>
        <ConfirmDialog open={confirmSave} onOpenChange={setConfirmSave}
          title={editing ? 'Save changes?' : 'Send invitation?'}
          description={editing ? `${form.name}'s details will be updated.` : `An invitation email will be sent to ${form.email}.`}
          confirmLabel={editing ? 'Save' : 'Send invite'} confirmVariant="default" onConfirm={saveNow} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Team" description="Invite your team, set roles and control which brands each person can access."
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href="/accept-invite" target="_blank" rel="noreferrer">Preview invite screen ↗</a>
            </Button>
            <Button className="gap-1.5" onClick={startAdd}><Plus className="size-4" />Invite member</Button>
          </div>
        } />

      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
          <CardDescription>{members.length} members · {activeCount} active</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Brand access</TableHead>
                <TableHead>Can access</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size="sm"><AvatarFallback className="bg-primary/10 text-primary">{m.initials}</AvatarFallback></Avatar>
                      <div className="min-w-0">
                        <p className="font-medium">{m.name}</p>
                        <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Mail className="size-3" />{m.email}</span>
                          {m.phone && <span className="inline-flex items-center gap-1"><Phone className="size-3" />{m.phone}</span>}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge className={roleTone(m.role)} variant="secondary">{m.role}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.brandAccess || 'All Brands'}</TableCell>
                  <TableCell>
                    {(m.modules || []).length >= teamModules.length
                      ? <Badge className="bg-primary/15 text-primary" variant="secondary">Full access</Badge>
                      : (
                        <div className="flex max-w-xs flex-wrap gap-1">
                          {(m.modules || []).slice(0, 4).map((mod) => <Badge key={mod} variant="outline" className="text-[10px]">{mod}</Badge>)}
                          {(m.modules || []).length > 4 && <Badge variant="outline" className="text-[10px]">+{(m.modules || []).length - 4} more</Badge>}
                        </div>
                      )}
                  </TableCell>
                  <TableCell><Badge className={statusTone(m.status)} variant="secondary">{m.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {m.status === 'Invited' && (
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.success(`Invite re-sent to ${m.email}.`)}>
                          <Send className="size-3.5" />Resend
                        </Button>
                      )}
                      <RowActions onEdit={() => startEdit(m)} onDelete={() => setDeleteTarget(m)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove this member?" description={deleteTarget ? `${deleteTarget.name} will lose access to the portal.` : ''}
        confirmLabel="Remove" onConfirm={removeNow} />
    </div>
  )
}
