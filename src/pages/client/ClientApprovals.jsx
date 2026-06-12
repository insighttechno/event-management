import { useState } from 'react'
import { Check, History, MessageSquare, X } from 'lucide-react'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { approvals as initialApprovals } from '@/data/finance'
import { formatDate } from '@/lib/utils'

const statusVariant = {
  Approved: 'secondary',
  Pending: 'destructive',
  'Changes Requested': 'outline',
}

// Dummy version history per approval request (no backend yet).
const versionHistory = {
  'A-1': [
    { version: 'v2', note: 'Final draft — updated payment schedule.', date: '2026-01-24' },
    { version: 'v1', note: 'Initial agreement draft.', date: '2026-01-20' },
  ],
  'A-2': [
    { version: 'v3', note: 'Moved cocktail hour to 5:30 PM per your feedback.', date: '2026-06-08' },
    { version: 'v2', note: 'Added vendor arrival times.', date: '2026-06-05' },
    { version: 'v1', note: 'First timeline draft.', date: '2026-06-01' },
  ],
  'A-3': [
    { version: 'v3', note: 'Adjusted dance floor position.', date: '2026-06-09' },
    { version: 'v2', note: 'Added second bar station.', date: '2026-06-04' },
    { version: 'v1', note: 'Initial beach layout.', date: '2026-05-28' },
  ],
  'A-4': [{ version: 'v1', note: 'Gallery release for engagement photos.', date: '2026-04-01' }],
}

export default function ClientApprovals() {
  const [approvals, setApprovals] = useState(initialApprovals)
  const [comments, setComments] = useState({})
  const [actionTarget, setActionTarget] = useState(null) // { item, action: 'approve' | 'changes' }
  const [historyTarget, setHistoryTarget] = useState(null)

  const pendingCount = approvals.filter((item) => item.status === 'Pending').length

  const resolve = (item, action, comment) => {
    const status = action === 'approve' ? 'Approved' : 'Changes Requested'
    setApprovals((prev) =>
      prev.map((approval) =>
        approval.id === item.id
          ? { ...approval, status, date: new Date().toISOString().slice(0, 10) }
          : approval
      )
    )
    if (comment.trim()) {
      setComments((prev) => ({ ...prev, [item.id]: comment.trim() }))
    }
    toast.success(
      action === 'approve'
        ? `"${item.title}" approved. Your planner has been notified by email.`
        : `Change request sent for "${item.title}". Your planner has been notified by email.`
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Approvals"
        description="Review and approve contracts, timelines, documents and galleries."
      />

      <Card>
        <CardHeader>
          <CardTitle>Approval Requests</CardTitle>
          <CardDescription>
            {pendingCount} pending · {approvals.length} total requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {approvals.map((item) => (
            <div key={item.id} className="rounded-lg border border-border p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.type} &middot; {formatDate(item.date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[item.status] ?? 'outline'}>{item.status}</Badge>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    title="Version history"
                    onClick={() => setHistoryTarget(item)}
                  >
                    <History className="size-4" />
                  </Button>
                  {item.status === 'Pending' && (
                    <>
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setActionTarget({ item, action: 'approve' })}
                      >
                        <Check className="size-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => setActionTarget({ item, action: 'changes' })}
                      >
                        <X className="size-4" />
                        Request changes
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {comments[item.id] && (
                <div className="mt-2 flex items-start gap-2 rounded-md bg-muted/50 p-2.5">
                  <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Your comment:</span>{' '}
                    {comments[item.id]}
                  </p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <ApprovalActionDialog
        target={actionTarget}
        onOpenChange={(open) => !open && setActionTarget(null)}
        onResolve={resolve}
      />

      <Dialog open={!!historyTarget} onOpenChange={(open) => !open && setHistoryTarget(null)}>
        <DialogContent className="sm:max-w-md">
          {historyTarget && (
            <>
              <DialogHeader>
                <DialogTitle>Version history</DialogTitle>
                <DialogDescription>{historyTarget.title}</DialogDescription>
              </DialogHeader>
              <ol className="relative flex flex-col gap-3 border-l border-border pl-4">
                {(versionHistory[historyTarget.id] ?? []).map((entry) => (
                  <li key={entry.version} className="relative">
                    <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-card bg-primary" />
                    <p className="text-sm">
                      <span className="font-medium">{entry.version}</span>
                      <span className="text-muted-foreground"> · {formatDate(entry.date)}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{entry.note}</p>
                  </li>
                ))}
              </ol>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ApprovalActionDialog({ target, onOpenChange, onResolve }) {
  const [comment, setComment] = useState('')

  const close = () => {
    onOpenChange(false)
    setComment('')
  }

  const submit = (e) => {
    e.preventDefault()
    if (target.action === 'changes' && !comment.trim()) return
    onResolve(target.item, target.action, comment)
    close()
  }

  const isApprove = target?.action === 'approve'

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        {target && (
          <form onSubmit={submit} className="contents">
            <DialogHeader>
              <DialogTitle>{isApprove ? 'Approve' : 'Request changes'}</DialogTitle>
              <DialogDescription>{target.item.title}</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isApprove
                    ? 'Add an optional comment...'
                    : 'Describe the changes you would like... (required)'
                }
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Your planner will be notified by email with your{' '}
                {isApprove ? 'approval' : 'requested changes'}.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={isApprove ? 'default' : 'outline'}
                disabled={!isApprove && !comment.trim()}
                className="gap-1.5"
              >
                {isApprove ? <Check className="size-4" /> : <X className="size-4" />}
                {isApprove ? 'Approve' : 'Send change request'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
