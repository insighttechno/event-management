# CRM Portal — Complete Flow Guide

Ye guide batati hai ki portal mein kaun kya kar sakta hai, kahan se login hota hai,
aur poora system kaise chalta hai. (Sab demo/dummy data par hai — koi backend nahi.)

---

## 1. Teen level ka system

```
LEVEL 1 — SUPER ADMIN (aap / platform owner)
   └── Saari companies (workspaces) manage karta hai
        │
LEVEL 2 — COMPANY ADMIN & TEAM (har company ka staff)
   └── Apni company ka CRM chalata hai: leads, events, vendors...
        │
LEVEL 3 — CLIENT (us company ke customers)
   └── Sirf apna event dekhta hai: timeline, contract, invoice, gallery
```

---

## 2. Login URLs — kaun kahan se ghusta hai

| Kaun | URL | Demo credentials |
|---|---|---|
| **Client** | `/` (root) | Pre-filled email + koi bhi password |
| **Admin / Team Member** | `/admin/login` | Email se role decide hota hai: `bernadette@familyaffairkeywest.com` = Administrator, koi aur email = Team Member |
| **Super Admin** | `/superadmin/login` | Koi bhi email/password |
| **Nayi company signup** | `/get-started` | 3-step wizard, account nahi chahiye |

---

## 3. Super Admin flow (Platform Console)

`/superadmin/login` → login → dark violet console khulta hai:

1. **Overview** — MRR, active workspaces, trials, growth chart, plans donut
2. **Workspaces table** — har company ka plan, status, revenue
   - **Open** → us company ke workspace mein ghus jao (CRM us company ke
     data + branding ke saath khul jata hai)
   - **Suspend / Activate** → confirmation popup ke baad company ka access
     band/chalu (demo mein UI-level hai, asli enforcement backend ke saath)
3. **Log out** → wapas console login par

> Super Admin kisi company ka CRM data edit nahi karta — wo sirf companies
> (tenants) aur unke subscriptions manage karta hai. CRM ke andar ka kaam
> Company Admin ka hai. Ye separation hi SaaS model hai.

---

## 4. Company Admin / Team flow (asli CRM)

`/admin/login` → login → Dashboard. Ye Scope-of-Work wala poora CRM hai:

```
Lead aaya → Leads page par add karo → pipeline mein aage badhao
   (New Inquiry → Contacted → Consultation → Proposal → Approval → Booked)
        ↓ Book hua
Event banao (Events) → milestones set karo → vendors assign karo
        ↓
Contract: Documents page → template se generate → client ko bhejo
   → client portal mein sign hota hai → signed archive
        ↓
Invoice banao (Payments) → client portal mein dikhta hai → payments record
        ↓
Photoshoot? → Gallery project banao → photos upload → client link share
        ↓
Tasks team ko assign hote rehte hain · Timeline par sab milestones dikhte hain
   → "Request approval" se client se timeline approve karwao
```

- **Administrator** sab dekh sakta hai. **Team Member** ko Payments, Team,
  Settings nahi dikhte (role-based navigation).
- **Settings** mein: business profile, notifications, role permissions
  - SaaS demo ON ho to: Workspace branding (naam/logo/color) + Billing & Plan

### Workspace Switcher (topbar mein, SaaS demo ON par)
- Family Affair ⇄ Coastal Events Miami switch karo — data, naam, color sab
  us company ka ho jata hai. Ye dikhata hai ki ek hi software kai companies
  alag-alag chala sakti hain.
- "Add workspace" → `/get-started` signup wizard

---

## 5. Client flow (customer portal)

`/` se login → Client portal (sirf apna event):

1. **My Event** — countdown, progress, attention items (kya sign/pay karna hai)
2. **Timeline** — milestones + day-of schedule, change request bhej sakte hain
3. **Contracts** — contract padho → type/draw signature se sign karo → archive
4. **Documents** — jo files admin ne "Share" ki hain sirf wahi dikhti hain
5. **Invoices** — balance, Make a Payment (demo card) — **payment admin ke
   Payments page par bhi turant dikh jaati hai**
6. **Gallery** — photos dekho, favorite karo, download
7. **Approvals** — contract/timeline/document/gallery approve ya changes maango

> Demo mein client account workspace ke pehle event se juda hai. Asli backend
> mein har client apne hi events se judega.

---

## 6. Nayi company ka janam (SaaS onboarding)

```
/get-started → company details → plan chuno (Starter/Pro/Enterprise)
   → workspace ban gaya → "Go to my workspace" → us company ka khaali CRM
   → Settings → Workspace mein branding set karo → kaam shuru
```

Nayi company Platform Console ki table aur workspace switcher dono mein
aa jaati hai.

---

## 7. Demo dene ka sahi tareeka

**Family Affair (client) ko dikhana ho:**
1. Settings → General → **SaaS Demo Mode OFF**
2. Ab portal bilkul Scope-of-Work jaisa — koi SaaS element nahi

**Kisi nayi company ko SaaS pitch karna ho:**
1. SaaS Demo Mode **ON**
2. Best order: `/superadmin` console → "Open" se workspace → switcher se
   dusri company → branding switch dikhao → `/get-started` se live signup

---

## 8. Kya demo hai, kya real (taaki confusion na ho)

| Real (UI mein kaam karta hai) | Demo/simulated (backend ke saath aayega) |
|---|---|
| Saare CRUD flows, pipeline drag-drop | Data refresh par reset (in-memory) |
| Tenant data isolation | Asli DB-level security |
| Signature draw/type | Legal e-sign (DocuSign jaisa) |
| Payment record + sync | Asli payment gateway |
| Suspend/Activate | Asli access blocking |
| Role-based navigation | Asli authentication |
| Email/reminder ke toasts | Asli emails |
```
