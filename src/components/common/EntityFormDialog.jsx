import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

export function EntityFormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {open && (
          <EntityForm
            fields={fields}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            onOpenChange={onOpenChange}
            submitLabel={submitLabel}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function EntityForm({ fields, defaultValues, onSubmit, onOpenChange, submitLabel }) {
  const [values, setValues] = useState(defaultValues ?? {})

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <form onSubmit={handleSubmit} className="contents">
      <div className="grid gap-4 py-1 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={cn('space-y-1.5', field.span === 'full' && 'sm:col-span-2')}
          >
            <Label htmlFor={field.name}>{field.label}</Label>
            {field.type === 'select' ? (
              <Select
                value={String(values[field.name] ?? '')}
                onValueChange={(value) => handleChange(field.name, value)}
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'textarea' ? (
              <Textarea
                id={field.name}
                value={values[field.name] ?? ''}
                onChange={(event) => handleChange(field.name, event.target.value)}
                placeholder={field.placeholder}
                rows={3}
              />
            ) : (
              <Input
                id={field.name}
                type={field.type ?? 'text'}
                step={field.step}
                min={field.min}
                value={values[field.name] ?? ''}
                onChange={(event) => handleChange(field.name, event.target.value)}
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </DialogFooter>
    </form>
  )
}
