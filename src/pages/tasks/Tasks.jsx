import { useState } from 'react'
import { Plus, Check, CircleAlert, CheckCircle2 } from 'lucide-react'
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { tasks as initialTasks, taskStatuses } from '@/data/tasks'
import { formatDate } from '@/lib/utils'

const priorities = ['High', 'Medium', 'Low']

const priorityTone = (p) =>
  p === 'High' ? 'bg-destructive/15 text-destructive'
    : p === 'Medium' ? 'bg-amber-500/15 text-amber-700'
    : 'bg-muted text-muted-foreground'

const statusTone = (s) =>
  s === 'Done' ? 'bg-emerald-500/15 text-emerald-700'
    : s === 'In Progress' ? 'bg-primary/15 text-primary'
    : 'bg-muted text-muted-foreground'

const isOverdue = (t) => t.status !== 'Done' && t.dueDate && t.dueDate < new Date().toISOString().slice(0, 10)

const emptyForm = { title: '', event: '', assignedTo: '', dueDate: '', priority: 'Medium', status: 'To Do' }

export default function Tasks() {
  const [tasks, setTasks] = useState(initialTasks)
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmSave, setConfirmSave] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))
  const startAdd = () => { setEditing(null); setForm(emptyForm); setView('form') }
  const startEdit = (t) => { setEditing(t); setForm({ ...t }); setView('form') }

  const saveNow = () => {
    if (editing) {
      setTasks((prev) => prev.map((t) => (t.id === editing.id ? { ...t, ...form } : t)))
      toast.success('Task updated.')
    } else {
      const id = `T-${500 + tasks.length + 10}`
      setTasks((prev) => [{ ...form, id }, ...prev])
      toast.success('Task added.')
    }
    setView('list')
  }

  const removeNow = () => {
    setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id))
    toast.success('Task deleted.')
  }

  const toggleDone = (t) => {
    const done = t.status === 'Done'
    setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: done ? 'To Do' : 'Done' } : x)))
    toast.success(done ? 'Task reopened.' : 'Task marked done.')
  }

  const overdue = tasks.filter(isOverdue)
  const openTasks = tasks.filter((t) => t.status !== 'Done')

  // ---------- In-page form ----------
  if (view === 'form') {
    return (
      <div className="max-w-4xl">
        <BackHeader
          title={editing ? 'Edit task' : 'New task'}
          description="Assign work to your team and track it to done."
          backLabel="Back to tasks"
          onBack={() => setView('list')}
        />
        <Card>
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Task *</Label>
              <Input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Confirm catering headcount" />
            </div>
            <div className="space-y-1.5">
              <Label>Related event</Label>
              <Input value={form.event} onChange={(e) => setField('event', e.target.value)} placeholder="Whitfield Wedding" />
            </div>
            <div className="space-y-1.5">
              <Label>Assigned to</Label>
              <Input value={form.assignedTo} onChange={(e) => setField('assignedTo', e.target.value)} placeholder="Marco Diaz" />
            </div>
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setField('dueDate', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setField('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{taskStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
              <Button className="gap-1.5" disabled={!form.title.trim()} onClick={() => setConfirmSave(true)}>
                <Check className="size-4" />{editing ? 'Save changes' : 'Add task'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={confirmSave}
          onOpenChange={setConfirmSave}
          title={editing ? 'Save changes?' : 'Add this task?'}
          description={`"${form.title || 'New task'}" will be ${editing ? 'updated' : 'added'}.`}
          confirmLabel={editing ? 'Save' : 'Add'}
          confirmVariant="default"
          onConfirm={saveNow}
        />
      </div>
    )
  }

  // ---------- List ----------
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tasks"
        description="Assign and track everything your team needs to do across both brands."
        action={<Button className="gap-1.5" onClick={startAdd}><Plus className="size-4" />Add task</Button>}
      />

      {overdue.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><CircleAlert className="size-4 text-amber-600" />Overdue tasks</CardTitle>
            <CardDescription>{overdue.length} task{overdue.length > 1 ? 's' : ''} past their due date</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {overdue.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.event} · {t.assignedTo} · due {formatDate(t.dueDate)}</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toggleDone(t)}>
                  <CheckCircle2 className="size-3.5" />Mark done
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All tasks</CardTitle>
          <CardDescription>{openTasks.length} open · {tasks.length - openTasks.length} done</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Task</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Assigned to</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((t) => (
                <TableRow key={t.id} className={t.status === 'Done' ? 'opacity-60' : ''}>
                  <TableCell>
                    <button type="button" onClick={() => toggleDone(t)} title="Toggle done"
                      className={`flex size-5 items-center justify-center rounded-full border ${t.status === 'Done' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border'}`}>
                      {t.status === 'Done' && <Check className="size-3.5" />}
                    </button>
                  </TableCell>
                  <TableCell className={`font-medium ${t.status === 'Done' ? 'line-through' : ''}`}>{t.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.event}</TableCell>
                  <TableCell className="text-sm">{t.assignedTo}</TableCell>
                  <TableCell>
                    {t.dueDate
                      ? <span className={`text-sm ${isOverdue(t) ? 'font-medium text-destructive' : ''}`}>{formatDate(t.dueDate)}</span>
                      : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell><Badge className={priorityTone(t.priority)} variant="secondary">{t.priority}</Badge></TableCell>
                  <TableCell><Badge className={statusTone(t.status)} variant="secondary">{t.status}</Badge></TableCell>
                  <TableCell><RowActions onEdit={() => startEdit(t)} onDelete={() => setDeleteTarget(t)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this task?"
        description={deleteTarget ? `"${deleteTarget.title}" will be removed.` : ''}
        confirmLabel="Delete"
        onConfirm={removeNow}
      />
    </div>
  )
}
