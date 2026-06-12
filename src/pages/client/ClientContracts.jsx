import { useRef, useState } from 'react'
import { Archive, Download, Eraser, FileText, PenLine } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { eventsService } from '@/services/events'
import { contractsService } from '@/services/finance'
import { formatDate } from '@/lib/utils'

const statusVariant = {
  Signed: 'secondary',
  'Awaiting Signature': 'destructive',
}

const contractBody = (contract, event) => `
AGREEMENT — ${contract.title.toUpperCase()}

This agreement is made between Family Affair Key West ("the Planner") and ${contract.client} ("the Client") for the event "${event.name}" to be held on ${formatDate(event.date)} at ${event.venue}.

1. SERVICES
The Planner agrees to provide full event planning and coordination services, including vendor management, timeline coordination, and day-of execution.

2. PAYMENT TERMS
The total contract value is payable per the invoice schedule shared in the client portal. A deposit secures the event date; the balance is due before the event day.

3. CANCELLATION
Cancellations made more than 90 days before the event date receive a refund of all payments except the non-refundable deposit.

4. LIABILITY
The Planner carries professional liability insurance. The Planner is not responsible for vendor non-performance outside its control, weather events, or force majeure.

5. SIGNATURES
By signing below, both parties agree to the terms outlined in this agreement.
`

export default function ClientContracts() {
  const event = eventsService.list()[0]
  const [myContracts, setMyContracts] = useState(() =>
    contractsService.list().filter((c) => c.event === event.name)
  )
  const [viewTarget, setViewTarget] = useState(null)
  const [signTarget, setSignTarget] = useState(null)

  const activeContracts = myContracts.filter((c) => c.status !== 'Signed')
  const signedContracts = myContracts.filter((c) => c.status === 'Signed')

  const markSigned = (contract) => {
    contractsService.update(contract.id, {
      status: 'Signed',
      signedDate: new Date().toISOString().slice(0, 10),
    })
    setMyContracts(contractsService.list().filter((c) => c.event === event.name))
  }

  const downloadContract = (contract) => {
    toast.success(`Downloading "${contract.title}"...`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Contracts"
        description="Review and sign documents related to your event."
      />

      {activeContracts.length > 0 && (
        <div className="space-y-4">
          {activeContracts.map((contract) => (
            <Card key={contract.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{contract.title}</CardTitle>
                    <CardDescription>Sent {formatDate(contract.sentDate)}</CardDescription>
                  </div>
                  <Badge variant={statusVariant[contract.status] ?? 'outline'}>
                    {contract.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setViewTarget(contract)}>
                  <FileText className="size-4" />
                  View contract
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadContract(contract)}>
                  <Download className="size-4" />
                  Download
                </Button>
                {contract.status === 'Awaiting Signature' && (
                  <Button size="sm" onClick={() => setSignTarget(contract)}>
                    <PenLine className="size-4" />
                    Sign Contract
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="size-5 text-muted-foreground" />
            Signed Contract Archive
          </CardTitle>
          <CardDescription>
            {signedContracts.length} signed document{signedContracts.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {signedContracts.length === 0 && (
            <p className="text-sm text-muted-foreground">No signed contracts yet.</p>
          )}
          {signedContracts.map((contract) => (
            <div
              key={contract.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
            >
              <div>
                <p className="text-sm font-medium">{contract.title}</p>
                <p className="text-xs text-muted-foreground">
                  Signed {formatDate(contract.signedDate)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Signed</Badge>
                <Button size="sm" variant="outline" onClick={() => setViewTarget(contract)}>
                  <FileText className="size-4" />
                  View
                </Button>
                <Button size="sm" variant="ghost" onClick={() => downloadContract(contract)}>
                  <Download className="size-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
        <DialogContent className="sm:max-w-2xl">
          {viewTarget && (
            <>
              <DialogHeader>
                <DialogTitle>{viewTarget.title}</DialogTitle>
                <DialogDescription>
                  Sent {formatDate(viewTarget.sentDate)}
                  {viewTarget.signedDate && <> · Signed {formatDate(viewTarget.signedDate)}</>}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-80 rounded-lg border border-border bg-muted/30 p-4">
                <pre className="font-sans text-sm whitespace-pre-wrap">
                  {contractBody(viewTarget, event)}
                </pre>
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => downloadContract(viewTarget)}>
                  <Download className="size-4" />
                  Download PDF
                </Button>
                {viewTarget.status === 'Awaiting Signature' && (
                  <Button
                    onClick={() => {
                      setSignTarget(viewTarget)
                      setViewTarget(null)
                    }}
                  >
                    <PenLine className="size-4" />
                    Sign now
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <SignContractDialog
        contract={signTarget}
        onOpenChange={(open) => !open && setSignTarget(null)}
        onSigned={markSigned}
      />
    </div>
  )
}

function SignContractDialog({ contract, onOpenChange, onSigned }) {
  const [typedName, setTypedName] = useState('')
  const [hasDrawn, setHasDrawn] = useState(false)
  const [mode, setMode] = useState('type')
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)

  const close = () => {
    onOpenChange(false)
    setTypedName('')
    setHasDrawn(false)
    setMode('type')
  }

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const point = e.touches ? e.touches[0] : e
    return { x: point.clientX - rect.left, y: point.clientY - rect.top }
  }

  const startDraw = (e) => {
    drawingRef.current = true
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!drawingRef.current) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1a1a2e'
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasDrawn(true)
  }

  const endDraw = () => {
    drawingRef.current = false
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  const canSign = mode === 'type' ? typedName.trim().length > 2 : hasDrawn

  const sign = () => {
    onSigned(contract)
    toast.success(`"${contract.title}" signed successfully.`, {
      description: 'A copy has been added to your signed contract archive.',
    })
    close()
  }

  return (
    <Dialog open={!!contract} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        {contract && (
          <>
            <DialogHeader>
              <DialogTitle>Sign contract</DialogTitle>
              <DialogDescription>{contract.title}</DialogDescription>
            </DialogHeader>

            <Tabs value={mode} onValueChange={setMode}>
              <TabsList className="w-full">
                <TabsTrigger value="type" className="flex-1">
                  Type signature
                </TabsTrigger>
                <TabsTrigger value="draw" className="flex-1">
                  Draw signature
                </TabsTrigger>
              </TabsList>

              <TabsContent value="type" className="mt-4 space-y-2">
                <Label htmlFor="signature-name">Full legal name</Label>
                <Input
                  id="signature-name"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. Sarah Whitfield"
                />
                {typedName.trim() && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                    <p className="font-display text-2xl italic">{typedName}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="draw" className="mt-4 space-y-2">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={140}
                  className="w-full cursor-crosshair touch-none rounded-lg border border-border bg-card"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={endDraw}
                />
                <Button type="button" variant="outline" size="sm" onClick={clearCanvas} className="gap-1.5">
                  <Eraser className="size-3.5" />
                  Clear
                </Button>
              </TabsContent>
            </Tabs>

            <p className="text-xs text-muted-foreground">
              By signing, you agree to the terms of this contract. Your signature and the date
              will be recorded.
            </p>

            <DialogFooter>
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button disabled={!canSign} onClick={sign} className="gap-1.5">
                <PenLine className="size-4" />
                Sign contract
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
