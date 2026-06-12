# Family Affair Key West & Senses At Play — Event Management Portal

UI/UX-only frontend for the event management platform, built with **React 19 + Vite + Tailwind CSS v4 + shadcn/ui**.

> This codebase contains **no backend / API integration**. All data shown in the UI comes from static mock files in `src/data/`. A separate backend team will wire up real APIs — see [Notes for backend integration](#notes-for-backend-integration) below.

## Tech Stack

- **React 19** + **React Router v7** (nested layout routes via `<Outlet />`)
- **Vite 8** — dev server & build
- **Tailwind CSS v4** (`@tailwindcss/vite`, no `tailwind.config.js` — theme is defined in `src/index.css`)
- **shadcn/ui** (Nova preset, JS/JSX, Radix primitives) — components in `src/components/ui`
- **Recharts** — dashboard charts
- **Lucide** — icons
- Path alias: `@/*` → `src/*`

## Getting Started

```bash
npm install
npm run dev      # start dev server (http://localhost:5173)
npm run build    # production build
npm run lint     # ESLint
```

## Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn/ui primitives (button, card, table, dialog, etc.)
│   ├── layout/       # AdminLayout, ClientLayout, Sidebar, Topbar
│   └── common/       # Shared building blocks (PageHeader, StatCard, ComingSoon)
├── context/
│   └── AuthContext.jsx   # Role state (Administrator / Team Member / Client)
├── hooks/
│   └── use-auth.js       # useAuth() hook
├── data/             # MOCK DATA — replace with real API calls during backend integration
│   ├── users.js, leads.js, events.js, vendors.js, tasks.js, finance.js
├── lib/
│   ├── utils.js          # cn(), formatCurrency(), formatDate()
│   └── navigation.js      # Sidebar / nav item definitions per portal & role
├── pages/
│   ├── auth/Login.jsx     # Role selector (demo login)
│   ├── dashboard/         # Admin dashboard
│   ├── leads/, events/, vendors/, tasks/, documents/,
│   │   gallery/, payments/, timeline/, team/   # Internal portal modules
│   └── client/             # Client portal pages
├── App.jsx           # Route definitions
├── main.jsx          # App entry point
└── index.css         # Tailwind v4 + design tokens (Key West tropical theme)
```

## Portal Architecture

Two portals share one app, gated by `role` from `AuthContext` (`Administrator`, `Team Member`, `Client`):

- **Internal Portal** (`/admin/*`) — `AdminLayout` (sidebar + topbar). Used by Administrator & Team Member roles. Nav items defined in `src/lib/navigation.js` (`adminNavItems`), some items restricted to Administrator only via the `roles` field.
- **Client Portal** (`/client/*`) — `ClientLayout` (horizontal nav + event banner). Used by the Client role. Nav items: `clientNavItems`.

Routing is defined in `src/App.jsx`. The root path `/` is the role-selector login screen.

## Auth (Demo Only)

`src/context/AuthContext.jsx` stores the selected `role` in `localStorage` (`fa-portal-role`) — this is a **UI-only stand-in** for real authentication, used to demo role-based navigation/permissions. `src/data/users.js` provides the demo user profile shown per role.

## Design System

- All design tokens (colors, radius, fonts) are defined as CSS variables in `src/index.css` under `:root` / `.dark` and mapped via `@theme inline`.
- Palette: tropical Key West — coral (`--primary`), persian teal (`--secondary`), sandy/saffron (`--accent`), deep teal-navy (`--foreground` / `--sidebar`).
- Fonts: Geist Variable (UI/body) and Playfair Display Variable (`--font-display`, used for headings/branding).
- Charts use `var(--chart-1)` … `var(--chart-5)` so they automatically follow the theme.

## Notes for Backend Integration

- Replace the contents of `src/data/*.js` with real API responses — the shapes/fields used by each page can be found by checking how each module imports from `src/data/`.
- Replace `AuthContext`'s localStorage-based role with real session/auth state; keep the same `{ role, user, setRole, logout }` shape to avoid touching consuming components.
- Pages currently combining a data preview with a "Coming Soon" section are placeholders for the next UI build phase and are not final.
