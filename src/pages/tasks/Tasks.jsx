import { useMemo, useState } from 'react'
import { BellRing, GripVertical, Plus, Send } from 'lucide-react'
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
import { taskStatuses } from '@/data/tasks'
import { tasksService } from '@/services/tasks'
import { formatDate } from '@/lib/utils'

const priorityVariant = {
  High: 'destructive',
  Medium: 'secondary',
  Low: 'outline',
}

const priorities = ['High', 'Medium', 'Low']

const taskFields = [
  { name: 'title', label: 'Task title', span: 'full', required: true },
  { name: 'event', label: 'Related event', span: 'full' },
  { name: 'assignedTo', label: 'Assigned to' },
  { name: 'dueDate', label: 'Due date', type: 'date' },
  { name: 'status', label: 'Status', type: 'select', options: taskStatuses },
  { name: 'priority', label: 'Priority', type: 'select', options: priorities },
]

const emptyTask = {
  title: '',
  event: '',
  assignedTo: '',
  dueDate: '',
  status: 'To Do',
  priority: 'Medium',
}

function dueStatus(task) {
  if (!task.dueDate || task.status === 'Completed') return null
  const today = new Date().toISOString().slice(0, 10)
  if (task.dueDate < today) return 'overdue'
  if (task.dueDate === today) return 'today'
  return null
}

export default function Tasks() {
  const [tasks, setTasks] = useState(() => tasksService.list())
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [dragOverStatus, setDragOverStatus] = useState(null)

  const dueTasks = useMemo(
    () => tasks.filter((task) => dueStatus(task)).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [tasks]
  )

  const moveTaskToStatus = (taskId, status) => {
    const task = tasks.find((item) => item.id === taskId)
    if (!task || task.status === status) return
    tasksService.update(taskId, { status })
    setTasks(tasksService.list())
    toast.success(`"${task.title}" moved to ${status}.`)
  }

  const sendReminder = (task) => {
    toast.success(`Reminder sent to ${task.assignedTo} for "${task.title}".`)
  }

  const openAddDialog = () => {
    setEditingTask(null)
    setFormOpen(true)
  }

  const openEditDialog = (task) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  const handleSubmit = (values) => {
    if (editingTask) {
      tasksService.update(editingTask.id, values)
      toast.success(`Task "${values.title}" updated.`)
    } else {
      tasksService.create(values)
      toast.success(`Task "${values.title}" added.`)
    }
    setTasks(tasksService.list())
  }

  const handleDelete = () => {
    tasksService.remove(deleteTarget.id)
    setTasks(tasksService.list())
    toast.success(`Task "${deleteTarget.title}" deleted.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Task & Team Management"
        description="Internal tasks, assignments, due dates and reminders."
        action={
          <Button onClick={openAddDialog} className="gap-1.5">
            <Plus className="size-4" />
            Add Task
          </Button>
        }
      />

      {dueTasks.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BellRing className="size-4 text-amber-600" />
              Due reminders
            </CardTitle>
            <CardDescription>
              {dueTasks.length} task{dueTasks.length > 1 ? 's' : ''} overdue or due today
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {dueTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.event} · {task.assignedTo}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={dueStatus(task) === 'overdue' ? 'destructive' : 'secondary'}>
                    {dueStatus(task) === 'overdue'
                      ? `Overdue · ${formatDate(task.dueDate)}`
                      : 'Due today'}
                  </Badge>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => sendReminder(task)}>
                    <Send className="size-3.5" />
                    Remind
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {taskStatuses.map((status) => {
          const items = tasks.filter((task) => task.status === status)
          return (
            <Card
              key={status}
              className={cn(
                'transition-colors',
                dragOverStatus === status && 'border-primary bg-primary/5'
              )}
              onDragOver={(event) => {
                event.preventDefault()
                setDragOverStatus(status)
              }}
              onDragLeave={() => setDragOverStatus(null)}
              onDrop={(event) => {
                event.preventDefault()
                setDragOverStatus(null)
                moveTaskToStatus(event.dataTransfer.getData('text/plain'), status)
              }}
            >
              <CardHeader>
                <CardTitle className="text-base">{status}</CardTitle>
                <CardDescription>{items.length} tasks · drag cards to update</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((task) => {
                  const due = dueStatus(task)
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData('text/plain', task.id)}
                      className="group cursor-grab rounded-lg border border-border bg-card p-3 text-sm shadow-xs transition-shadow hover:shadow-sm active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-1.5">
                          <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground" />
                          <p className="font-medium leading-snug">{task.title}</p>
                        </div>
                        <RowActions
                          className="-mt-1 -mr-1 shrink-0"
                          onEdit={() => openEditDialog(task)}
                          onDelete={() => setDeleteTarget(task)}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{task.event}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                        <span
                          className={cn(
                            'flex items-center gap-1 text-xs',
                            due === 'overdue'
                              ? 'font-medium text-destructive'
                              : due === 'today'
                                ? 'font-medium text-amber-600'
                                : 'text-muted-foreground'
                          )}
                        >
                          {due && <BellRing className="size-3" />}
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {items.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border px-2 py-6 text-center text-xs text-muted-foreground">
                    Drop tasks here
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingTask ? 'Edit Task' : 'Add Task'}
        description={
          editingTask
            ? 'Update this task and save your changes.'
            : 'Create a new internal task.'
        }
        fields={taskFields}
        defaultValues={editingTask ?? emptyTask}
        onSubmit={handleSubmit}
        submitLabel={editingTask ? 'Save changes' : 'Add task'}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this task?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently removed. This cannot be undone.`
            : ''
        }
        onConfirm={handleDelete}
      />
    </div>
  )
}
