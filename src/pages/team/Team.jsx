import { useState } from 'react'
import { Plus } from 'lucide-react'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { teamService } from '@/services/team'
import { tasksService } from '@/services/tasks'

const teamRoles = ['Administrator', 'Team Member']

const memberFields = [
  { name: 'name', label: 'Full name', span: 'full', required: true },
  { name: 'role', label: 'Role', type: 'select', options: teamRoles },
]

const emptyMember = {
  name: '',
  role: 'Team Member',
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function Team() {
  const tasks = tasksService.list()
  const [teamMembers, setTeamMembers] = useState(() => teamService.list())
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
      teamService.update(editingMember.id, payload)
      toast.success(`"${payload.name}" updated.`)
    } else {
      teamService.create(payload)
      toast.success(`"${payload.name}" added to the team.`)
    }
    setTeamMembers(teamService.list())
  }

  const handleDelete = () => {
    teamService.remove(deleteTarget.id)
    setTeamMembers(teamService.list())
    toast.success(`"${deleteTarget.name}" removed from the team.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Team"
        description="Manage team members and their workload."
        action={
          <Button onClick={openAddDialog} className="gap-1.5">
            <Plus className="size-4" />
            Add Team Member
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
            const open = memberTasks.filter((task) => task.status !== 'Completed').length
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
                  <p className="truncate text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {open} open task{open !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={member.role === 'Administrator' ? 'default' : 'outline'}>
                    {member.role}
                  </Badge>
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
            const open = memberTasks.filter((task) => task.status !== 'Completed').length
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

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
        description={
          editingMember
            ? 'Update this team member and save your changes.'
            : 'Invite a new team member to the portal.'
        }
        fields={memberFields}
        defaultValues={editingMember ?? emptyMember}
        onSubmit={handleSubmit}
        submitLabel={editingMember ? 'Save changes' : 'Add member'}
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
