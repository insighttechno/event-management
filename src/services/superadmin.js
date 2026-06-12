// Super Admin (platform owner) session — demo only, real auth comes with the backend.
const KEY = 'fa-portal-superadmin'

export const superAdminAuth = {
  isLoggedIn() {
    return localStorage.getItem(KEY) === 'yes'
  },
  login() {
    localStorage.setItem(KEY, 'yes')
  },
  logout() {
    localStorage.removeItem(KEY)
  },
}
