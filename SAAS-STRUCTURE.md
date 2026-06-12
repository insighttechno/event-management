# SaaS-Ready Structure Guide

Ye document batata hai ki SaaS-ready banane ke liye project mein kya-kya badla,
kahan kya hai, aur future mein real SaaS (backend ke saath) banate waqt developer
ko sirf kahan haath lagana hai.

---

## 1. Big Picture

```
UI Pages  →  Services (src/services/)  →  Dummy Data (src/data/)
                     ↑
        [Future: yahin fetch('/api/...') lagegi]
```

- **Pages ab kabhi bhi data files ko directly import nahi karte.**
  Har page `services/` ke through data leta hai.
- Har record mein `tenantId` hai (T-1, T-2...) — har service sirf **current
  workspace (tenant)** ka data lautati hai.
- Workspace switch karne par poora app us company ke data + branding par
  switch ho jata hai.

---

## 2. File Map — kahan kya hai

### Naya: SaaS core
| File | Kya hai |
|---|---|
| `src/data/tenants.js` | Companies (tenants), subscription plans, platform revenue — sab dummy |
| `src/services/tenant-store.js` | Current tenant kaun hai + SaaS demo mode flag (localStorage) |
| `src/services/store.js` | `createCollection()` — generic tenant-scoped list/get/create/update/remove |
| `src/services/tenants.js` | Tenant CRUD (signup, settings, super admin isse use karte hain) |
| `src/context/TenantContext.jsx` | Current tenant, branding apply (color + title), switchTenant, demo flag |
| `src/hooks/use-tenant.js` | `useTenant()` hook — kisi bhi component mein tenant chahiye to ye |

### Naya: domain services (pages inhe use karte hain)
| File | Kya deta hai |
|---|---|
| `src/services/leads.js` | leads + communication log |
| `src/services/events.js` | events, milestones, notes, vendor assignments |
| `src/services/vendors.js` | vendors + communications |
| `src/services/tasks.js` | tasks |
| `src/services/team.js` | team members |
| `src/services/documents.js` | documents + contract templates |
| `src/services/finance.js` | invoices, contracts, galleries, approvals, monthly revenue |
| `src/services/notifications.js` | notifications |

### Naya: SaaS UI pages
| File | Route | Kya hai |
|---|---|---|
| `src/pages/saas/CompanySignup.jsx` | `/get-started` | Nayi company ka 3-step onboarding wizard |
| `src/pages/saas/SuperAdminLogin.jsx` | `/superadmin/login` | Platform Console ka login (demo: koi bhi email/password) |
| `src/pages/saas/SuperAdmin.jsx` | `/superadmin` | Platform Console — dark modern dashboard; login ke bina redirect hota hai |
| `src/pages/saas/console-theme.js` | — | Console ka fixed violet accent (tenant branding se alag) |
| `src/services/superadmin.js` | — | Super admin session flag (localStorage, demo-only) |

### Badle hue files
- `src/App.jsx` — TenantProvider + 2 naye routes
- `src/components/layout/Sidebar.jsx` — brand naam/initials ab tenant se aate hain
- `src/components/layout/Topbar.jsx` — Workspace Switcher + Platform Console link
- `src/components/layout/AdminLayout.jsx`, `ClientLayout.jsx` — `key={tenant.id}` (switch par pages reload)
- `src/pages/settings/Settings.jsx` — naye tabs: Workspace & Branding, Billing & Plan + SaaS Demo toggle
- **Saare admin + client pages** — ab services se data lete hain (data files se nahi)
- **Saari data files** — har record par `tenantId` + dusri demo company (Coastal Events Miami) ka data

---

## 3. SaaS Demo Mode (client ko dikhane se pehle!)

**Settings → General → SaaS Demo Mode** toggle:
- **ON** (default): workspace switcher, Workspace/Billing tabs, Platform Console — sab dikhta hai
- **OFF**: portal bilkul waisa dikhta hai jaisa client ke Scope of Work mein hai —
  koi SaaS element nahi dikhta

> Family Affair client ko demo dete waqt ise **OFF** kar dein.

---

## 4. Future: Real SaaS banate waqt developer kya kare

1. **Backend banao** (NestJS + Postgres ya Supabase) — har table mein `tenant_id` column
2. **Sirf `src/services/*.js` files badlo** — `createCollection()` ke functions ke andar
   dummy array ki jagah `fetch('/api/...')` likho. **Pages ko chhoona nahi padega.**
3. `src/services/tenant-store.js` — current tenant localStorage ki jagah login
   session/subdomain se aayega
4. `src/data/*` files delete kar do (ya seed scripts bana lo)
5. Auth (`src/context/AuthContext.jsx`) ko real login se jodo
6. Billing tab ko Stripe/Razorpay se jodo

---

## 5. Revert — agar sab wapas chahiye

Git history mein do points hain:

```
e15298c  Baseline: client-scope portal before SaaS-ready changes   ← SaaS se pehle
(latest)  SaaS-ready architecture + SaaS demo UI                    ← SaaS ke saath
```

**Poora revert (SaaS hatao, purana portal wapas):**
```
cd portal
git revert <saas-commit-hash> --no-edit
```
ya history hi reset karni ho to:
```
git reset --hard e15298c
```

**Bina revert ke sirf chhupana ho:** Settings → SaaS Demo Mode → OFF
(ye sabse aasaan hai — code wahi rehta hai, dikhna band ho jata hai)
