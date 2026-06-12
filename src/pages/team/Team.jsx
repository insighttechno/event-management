import { useState } from 'react'
import { Mail, Plus, Send, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { teamMembers as initialTeamMembers, teamModules } from '@/data/users'
import { tasks } from '@/data/tasks'
import { nextSequentialId } from '@/lib/utils'

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function Team() {
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers)
  const [formOpen, setFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openAddDialog = () => {
    setEditingMember(null)
    setFormOpen(true)
  }

  const openEditDialog = (member) => {
    setEditingMember(member)
    setFormOpen(true)
  }

  const handleSubmit = (values) => {
    const payload = { ...values, initials: getInitials(values.name) }

    if (editingMember) {
      setTeamMembers((prev) =>
        prev.map((member) => (member.id === editingMember.id ? { ...member, ...payload } : member))
      )
      toast.success(`"${payload.name}" updated.`, {
        description: `Access: ${payload.role === 'Administrator' ? 'All modules' : payload.modules.join(', ')}`,
      })
    } else {
      const newMember = {
        ...payload,
        id: nextSequentialId(teamMembers, 'U'),
        status: 'Invited',
      }
      setTeamMembers((prev) => [newMember, ...prev])
      toast.success(`Invitation sent to ${payload.email}`, {
        description: `${payload.name} will receive an email with a link to set their password and see what they can manage.`,
      })
    }
  }

  const resendInvite = (member) => {
    toast.success(`Invitation re-sent to ${member.email}`, {
      description: 'The previous invite link has been refreshed.',
    })
  }

  const handleDelete = () => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== deleteTarget.id))
    toast.success(`"${deleteTarget.name}" removed from the team.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Team"
        description="Invite people, decide exactly what each person manages, and track workload."
        action={
          <Button onClick={openAddDialog} className="gap-1.5">
            <Plus className="size-4" />
            Invite Team Member
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>{teamMembers.length} people with portal access</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {teamMembers.map((member) => {
            const memberTasks = tasks.filter((task) => task.assignedTo === member.name)
            const open = memberTasks.filter((task) => task.status !== 'Done').length
            const isAdmin = member.role === 'Administrator'
            const shownModules = isAdmin ? [] : member.modules.slice(0, 3)
            const extraCount = isAdmin ? 0 : member.modules.length - shownModules.length
            return (
              <div
                key={member.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/40"
              >
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <p className="truncate text-sm font-medium">{member.name}</p>
                    {member.title && (
                      <span className="text-xs text-muted-foreground">· {member.title}</span>
                    )}
                  </div>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Mail className="size-3 shrink-0" />
                    {member.email}
                    <span className="hidden sm:inline">
                      {' '}· {open} open task{open !== 1 ? 's' : ''}
                    </span>
                  </p>
                </div>

                <div className="hidden shrink-0 items-center gap-1 lg:flex">
                  {isAdmin ? (
                    <Badge variant="secondary" className="gap-1">
                      <ShieldCheck className="size-3" />
                      Full access
                    </Badge>
                  ) : (
                    <>
                      {shownModules.map((module) => (
                        <Badge key={module} variant="secondary" className="font-normal">
                          {module}
                        </Badge>
                      ))}
                      {extraCount > 0 && (
                        <Badge variant="outline" className="font-normal">
                          +{extraCount} more
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={isAdmin ? 'default' : 'outline'}>{member.role}</Badge>
                  {member.status === 'Invited' && (
                    <Badge className="border-amber-500/40 bg-amber-500/10 text-amber-600">
                      Invited
                    </Badge>
                  )}
                  {member.status === 'Invited' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => resendInvite(member)}
                    >
                      <Send className="size-3.5" />
                      Resend
                    </Button>
                  )}
                  <RowActions
                    onEdit={() => openEditDialog(member)}
                    onDelete={() => setDeleteTarget(member)}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity & Assignments</CardTitle>
          <CardDescription>Open task load per team member</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {teamMembers.map((member) => {
            const memberTasks = tasks.filter((task) => task.assignedTo === member.name)
            const open = memberTasks.filter((task) => task.status !== 'Done').length
            const done = memberTasks.length - open
            const pct = memberTasks.length
              ? Math.round((done / memberTasks.length) * 100)
              : 0
            return (
              <div key={member.id}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">{member.name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {open} open · {done} done
                  </span>
                </div>
                <Progress value={pct} />
              </div>
            )
          })}
        </CardContent>
      </Card>

      <TeamMemberDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        member={editingMember}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove this team member?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will lose access to the portal. This cannot be undone.`
            : ''
        }
        onConfirm={handleDelete}
      />
    </div>
  )
}

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  title: '',
  role: 'Team Member',
  modules: ['Dashboard', 'Tasks'],
}

function TeamMemberDialog({ open, onOpenChange, member, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{member ? 'Edit Team Member' : 'Invite Team Member'}</DialogTitle>
          <DialogDescription>
            {member
              ? 'Update their details and what they can manage.'
              : 'They will receive an email invitation with a link to join the portal.'}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <TeamMemberForm
            defaultValues={member ?? emptyForm}
            isEditing={!!member}
            onSubmit={onSubmit}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function TeamMemberForm({ defaultValues, isEditing, onSubmit, onOpenChange }) {
  const [values, setValues] = useState(defaultValues)

  const isAdmin = values.role === 'Administrator'

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const toggleModule = (module) => {
    setValues((prev) => ({
      ...prev,
      modules: prev.modules.includes(module)
        ? prev.modules.filter((item) => item !== module)
        : [...prev.modules, module],
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      ...values,
      // Administrators always get everything.
      modules: isAdmin ? [...teamModules] : values.modules,
    })
    onOpenChange(false)
  }

  return (
    <form onSubmit={handleSubmit} className="contents">
      <div className="grid gap-4 py-1 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="member-name">Full name</Label>
          <Input
            id="member-name"
            required
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="e.g. Ana Rivera"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="member-email">Email</Label>
          <Input
            id="member-email"
            type="email"
            required
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="ana@company.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="member-phone">Phone (optional)</Label>
          <Input
            id="member-phone"
            value={values.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="(305) 555-0100"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="member-title">Job title</Label>
          <Input
            id="member-title"
            value={values.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="e.g. Event Planner"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="member-role">Role</Label>
          <Select value={values.role} onValueChange={(value) => setField('role', value)}>
            <SelectTrigger id="member-role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Administrator">Administrator</SelectItem>
              <SelectItem value="Team Member">Team Member</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>What can they manage?</Label>
          {isAdmin ? (
            <p className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0 text-primary" />
              Administrators always have full access to every module.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-border p-2 sm:grid-cols-3">
                {teamModules.map((module) => (
                  <label
                    key={module}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={values.modules.includes(module)}
                      onCheckedChange={() => toggleModule(module)}
                    />
                    {module}
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {values.modules.length} module{values.modules.length !== 1 ? 's' : ''} selected —
                they will only see these in their sidebar.
              </p>
            </>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" className="gap-1.5">
          {isEditing ? (
            'Save changes'
          ) : (
            <>
              <Send className="size-4" />
              Send invitation
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
