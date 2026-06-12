import { toast } from 'sonner'
import { EntityFormDialog } from '@/components/common/EntityFormDialog'
import { useAuth } from '@/hooks/use-auth'

const profileFields = [
  { name: 'name', label: 'Name', placeholder: 'Your name', required: true, span: 'full' },
  { name: 'title', label: 'Title', placeholder: 'Your title', span: 'full' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', span: 'full' },
  { name: 'company', label: 'Company', placeholder: 'Company name', span: 'full' },
]

export function ProfileDialog({ open, onOpenChange }) {
  const { user, updateProfile } = useAuth()

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit profile"
      description="Update your personal information."
      fields={profileFields}
      defaultValues={{
        name: user?.name ?? '',
        title: user?.title ?? '',
        email: user?.email ?? '',
        company: user?.company ?? '',
      }}
      onSubmit={(values) => {
        updateProfile(values)
        toast.success('Profile updated.')
      }}
    />
  )
}
