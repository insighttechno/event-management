// Central brand identity used across the client portal. The logged-in brand is
// captured at login (from /portal/:brand) and stored in auth; the dashboard and
// layout read this config so the portal re-skins per brand. Add a new brand here
// and its client portal is themed automatically.
export const brandConfig = {
  'family-affair': {
    id: 'family-affair',
    name: 'Family Affair Key West',
    short: 'Family Affair',
    portalLabel: 'Client Portal',
    kind: 'planning', // long planning journey (countdown + milestones)
    accent: '#6f9a83',
    accentDark: '#2f4a3b',
    logo: '/images/brand/family-affair.png',
    hero: '/images/hero/family-affair.jpg',
    heroPos: '50% 0%',
    eventNoun: 'celebration',
    eventWord: 'wedding',
    welcome: 'Your celebration, beautifully in hand.',
  },
  'senses-at-play': {
    id: 'senses-at-play',
    name: 'Senses At Play',
    short: 'Senses At Play',
    portalLabel: 'Client Portal',
    kind: 'gallery', // short, gallery-centric journey
    accent: '#c2a15b',
    accentDark: '#40341e',
    logo: '/images/brand/senses-at-play.png',
    hero: '/images/hero/senses-at-play.jpg',
    heroPos: '50% 28%',
    eventNoun: 'session',
    eventWord: 'shoot',
    welcome: 'Your moments, captured & ready.',
  },
}

export const defaultBrand = 'family-affair'

export const getBrandConfig = (brand) => brandConfig[brand] ?? brandConfig[defaultBrand]
