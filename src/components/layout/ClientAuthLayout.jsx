import { AuthShell } from './AuthShell'

export default function ClientAuthLayout() {
  return (
    <AuthShell
      roles={['Client']}
      previewRole="Client"
      outletContext={{ signInPath: '/' }}
    />
  )
}
