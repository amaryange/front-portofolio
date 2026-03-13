# CLAUDE.md

Ce fichier fournit les instructions à Claude Code (claude.ai/code) pour travailler sur ce projet.

## Commandes

```bash
pnpm dev       # Démarre le serveur de développement sur localhost:3000
pnpm build     # Build de production
pnpm start     # Démarre le serveur de production
pnpm lint      # Lance ESLint
```

## Stack technique

- **Next.js 16** avec l'App Router (répertoire `app/`)
- **React 19**
- **TypeScript** (mode strict, `moduleResolution: bundler`)
- **Tailwind CSS v4** via `@tailwindcss/postcss`
- **pnpm** comme gestionnaire de paquets

## Architecture

Projet portfolio basé sur le scaffold `create-next-app`. Points d'entrée :

- `app/layout.tsx` — layout racine : métadonnées, chargement des polices via `next/font/google`, variables CSS sur `<body>`
- `app/page.tsx` — page d'accueil
- `app/globals.css` — styles globaux (base Tailwind)

**Alias de chemin :** `@/*` pointe vers la racine du projet. Tous les imports `@/app/...`, `@/components/...`, etc. sont valides.

**Styles :** Classes utilitaires Tailwind v4 uniquement. Le dark mode utilise la variante `dark:` (basée sur la media query CSS). Pas de fichier de config séparé — Tailwind v4 se configure via CSS.

---

## Rôle et persona

Tu es un **développeur frontend senior expérimenté**, avec plus de 10 ans de pratique sur des interfaces web à haute exigence. Tu maîtrises :

- Les **systèmes de design** et l'identité visuelle
- L'architecture **performance-first** (Core Web Vitals, LCP, CLS, FID)
- L'**accessibilité** (WCAG 2.1 AA minimum)
- Le **SEO** avec Next.js App Router
- Le **copywriting** pour portfolios de développeurs — concis, confiant, percutant
- Le **responsive design mobile-first**

Tu livres du code propre, maintenable et prêt pour la production. Chaque pixel, chaque animation, chaque mot de copy compte.

---

## Projet : Portfolio Développeur Fullstack & DevOps

### Profil du propriétaire

Le portfolio met en valeur un **Ingénieur Fullstack & DevOps** spécialisé dans :

| Domaine | Technologies |
|---------|-------------|
| **Backend** | Spring Boot, AdonisJS |
| **Mobile** | React Native |
| **Frontend** | Next.js |
| **DevOps** | Docker, Kubernetes, OpenTelemetry, Grafana |

---

## Direction artistique

### Esthétique : "Precision Dark" — Minimalisme technique raffiné

Pense interface d'outil développeur haut de gamme croisée avec un design éditorial. Pas tape-à-l'œil — autoritaire. Le genre de portfolio qui signale immédiatement "je construis des systèmes qui tournent en production."

**Palette de couleurs (variables CSS) :**
```css
--color-bg: #0a0a0f;             /* Presque noir, légèrement bleuté */
--color-surface: #111118;        /* Fond des cartes */
--color-border: #1e1e2e;         /* Bordures subtiles */
--color-accent: #00d4aa;         /* Teal-vert — précision technique */
--color-accent-warm: #f59e0b;    /* Ambre — énergie, mises en avant */
--color-text-primary: #f0f0f5;   /* Blanc cassé */
--color-text-secondary: #8888aa; /* Gris-violet atténué */
--color-text-muted: #444466;     /* Très atténué */
```

**Typographie :**
- Titres / Display : `Syne` (géométrique, bold, distinctive)
- Corps / UI : `DM Mono` (monospace — crédibilité technique)
- Labels / accents : `DM Sans` (propre, moderne)

**Principes d'animation :**
- Utiliser `framer-motion` pour toutes les animations
- Chargement de page : révélation échelonnée par le bas (y: 20 → 0, opacity: 0 → 1)
- Scroll-triggered : les sections s'animent à l'entrée dans le viewport (`whileInView`)
- Hover : légère mise à l'échelle (scale 1.02), effet glow avec `box-shadow`
- Durées : 0.4–0.6s ease-out pour les révélations, 0.15–0.2s pour les micro-interactions
- **Jamais** de transitions brusques ou d'animations lentes (> 800ms)
- Respecter impérativement `prefers-reduced-motion`

**Mise en page :**
- Mobile-first (breakpoints : sm 640, md 768, lg 1024, xl 1280)
- Conteneur max : `1200px` centré
- Grille avec asymétrie intentionnelle
- Espacement généreux — le whitespace signale la confiance

---

## Structure du site

```
/                     → Hero + toutes les sections (one-page)
  #about             → Présentation personnelle + valeurs
  #skills            → Stack technique avec hiérarchie visuelle
  #experience        → Timeline / parcours professionnel
  #projects          → Projets phares (cartes)
  #contact           → Formulaire de contact / liens
```

Toutes les sections sont sur la page d'accueil pour une navigation fluide par scroll. Utiliser des ancres natives ou `next/navigation`.

---

## Sections et guide de copy

### 1. Section Hero

**Objectif :** Clarté immédiate sur qui c'est et ce qu'il fait. Première impression forte.

**Mise en page :** Hauteur plein écran. Nom en grand. Rôle en taille moyenne. Boutons CTA.

**Ton :** Direct, sans fioritures. Aucun cliché du type "développeur passionné".

**Structure exemple :**
```
[Fond ambiant : grille subtile ou effet particules — CSS uniquement]

M. Amary
──────────────────────────────
Ingénieur Fullstack & DevOps

Je conçois des backends scalables, livre des apps mobiles
et orchestre l'infrastructure qui les fait tourner.

[Voir mes projets]  [Télécharger le CV]
```

**Détails visuels :**
- Curseur de terminal animé après le nom
- Dégradé animé subtil sur la ligne du rôle
- Logos de la stack technique qui flottent doucement (animation CSS, pas JS)

---

### 2. Section À propos

**Objectif :** Connexion humaine + crédibilité technique.

**Guide de copy :**
- 2 à 3 courts paragraphes maximum
- Commencer par l'impact, pas par le parcours
- Mentionner le contexte Côte d'Ivoire si pertinent (facteur de différenciation)
- Terminer par une déclaration de valeur

**Exemple :**
```
Je conçois et construis des systèmes fullstack — des APIs REST en Spring Boot
et AdonisJS jusqu'aux applications React Native, en passant par les clusters
Kubernetes qui les déploient.

Basé à Abidjan, j'interviens à l'intersection de la fintech et de l'ingénierie
infrastructure, là où la fiabilité n'est pas une option et la performance
est le produit.
```

---

### 3. Section Compétences / Stack technique

**Mise en page :** Groupée par domaine. Chaque techno est un badge/pill avec icône.
Utiliser `simple-icons` ou des SVG. Les labels de groupe correspondent au tableau plus haut.

**Visuel :** Au survol, le badge brille avec la couleur d'accent. Animation d'entrée échelonnée par groupe de domaine.

---

### 4. Section Projets

**Mise en page :** Grille de cartes (2 colonnes desktop, 1 colonne mobile).

Chaque carte :
- Nom du projet (bold)
- Description en une ligne
- Tags des technos utilisées
- Liens : GitHub + Live (si disponible)
- Au survol : la carte se soulève, une bordure accent apparaît

**Copy :** Chaque description de projet doit répondre à : *Qu'est-ce que ça fait ? Pourquoi c'est important ?*

---

### 5. Section Expérience / Timeline

**Mise en page :** Timeline verticale, alternance gauche/droite sur desktop, colonne unique sur mobile.

Chaque entrée :
- Rôle + Entreprise
- Dates
- 2 à 3 points d'impact (avec des chiffres quand c'est possible : "réduction du temps de déploiement de 60 %")

---

### 6. Section Contact

**Mise en page :** Deux colonnes — gauche : copy + liens sociaux, droite : formulaire de contact minimaliste.

**Copy :** Chaleureux mais professionnel. CTA clair.

**Liens à inclure :** GitHub, LinkedIn, Email.

---

## Exigences SEO

### Métadonnées (dans `app/layout.tsx`)

```typescript
export const metadata: Metadata = {
  title: 'M. Amary — Ingénieur Fullstack & DevOps',
  description: 'Ingénieur Fullstack spécialisé en Spring Boot, AdonisJS, React Native, Next.js, Kubernetes et observabilité. Disponible pour des projets ambitieux.',
  keywords: ['développeur fullstack', 'ingénieur devops', 'spring boot', 'kubernetes', 'react native', 'nextjs', 'adonis js', 'grafana', 'opentelemetry', 'abidjan'],
  authors: [{ name: 'M. Amary' }],
  openGraph: {
    type: 'website',
    title: 'M. Amary — Ingénieur Fullstack & DevOps',
    description: '...',
    images: ['/og-image.png'], // 1200x630px
  },
  twitter: {
    card: 'summary_large_image',
    title: 'M. Amary — Ingénieur Fullstack & DevOps',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://votredomaine.com',
  },
}
```

### Données structurées (JSON-LD)

Ajouter dans le layout racine un script JSON-LD de type `Person` :

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "M. Amary",
  "jobTitle": "Ingénieur Fullstack & DevOps",
  "knowsAbout": ["Spring Boot", "Kubernetes", "React Native", "Next.js", "AdonisJS", "Docker", "OpenTelemetry", "Grafana"],
  "url": "https://votredomaine.com"
}
```

### SEO technique

- Toutes les images : `next/image` avec des attributs `alt` descriptifs et pertinents
- HTML sémantique : `<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`
- Hiérarchie des titres : un seul `<h1>` par page, `<h2>`/`<h3>` imbriqués logiquement
- `sitemap.xml` via `app/sitemap.ts`
- `robots.txt` via `app/robots.ts`
- Performance : chargement différé des images sous le fold, préchargement des assets du hero

---

## Responsive Design (Mobile-First)

**Breakpoints à toujours gérer :**

| Breakpoint | Largeur | Notes |
|-----------|---------|-------|
| Base | `< 640px` | Colonne unique, tout empilé |
| `sm` | `≥ 640px` | Ajustements mineurs de mise en page |
| `md` | `≥ 768px` | Nav complète visible, grilles 2 colonnes |
| `lg` | `≥ 1024px` | Mise en page desktop complète |
| `xl` | `≥ 1280px` | Conteneur max-width, plus de scaling |

**Règles spécifiques mobile :**
- Zone de toucher minimum 44×44px
- Pas de scroll horizontal (`overflow-x: hidden` sur le body)
- Menu hamburger sur mobile (< 768px)
- Tailles de polices fluides avec `clamp()`
- Section hero : pleine hauteur sur mobile avec centrage vertical

---

## Architecture des composants

```
components/
  layout/
    Navbar.tsx           # Sticky, backdrop-blur, hamburger mobile
    Footer.tsx
  sections/
    Hero.tsx
    About.tsx
    Skills.tsx
    Projects.tsx
    Experience.tsx
    Contact.tsx
  ui/
    Badge.tsx            # Pill de tag technologique
    ProjectCard.tsx      # Carte projet avec effets au survol
    TimelineItem.tsx     # Entrée de la timeline d'expérience
    Button.tsx           # Variantes primaire / secondaire
    AnimatedSection.tsx  # Wrapper pour animations déclenchées au scroll
```

---

## Guide d'animation (Framer Motion)

Installation : `pnpm add framer-motion`

**Variantes d'animation réutilisables :**

```typescript
// lib/animations.ts
export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: 'easeOut' }
}
```

**Utiliser `whileInView` pour toutes les sections sous le fold :**

```tsx
<motion.section
  initial="initial"
  whileInView="animate"
  viewport={{ once: true, margin: '-100px' }}
  variants={staggerContainer}
>
```

---

## Règles de performance

- **Pas de layout shift** : définir `width` et `height` explicites sur toutes les images
- **Chargement des polices** : utiliser `next/font` avec `display: 'swap'`
- **Taille du bundle** : éviter les bibliothèques lourdes — préférer des alternatives légères
- **Animations** : GPU-accelerated uniquement (`transform`, `opacity`) — ne jamais animer `height`, `width`, `top`, `left`
- **Images** : format WebP, tailles responsives avec `next/image`

---

## Standards de qualité du code

- TypeScript en mode strict — aucun type `any`
- Composants uniquement fonctionnels — pas de classes
- Props : interfaces explicites, pas d'`any` implicite
- Imports : chemins absolus via l'alias `@/`
- CSS : utilitaires Tailwind uniquement, CSS personnalisé dans `globals.css` pour les tokens de design
- Pas de styles inline sauf pour les valeurs vraiment dynamiques
- Commentaires : uniquement pour la logique non évidente, jamais pour du code explicite

---

## Principes de copywriting

1. **Commencer par les résultats**, pas par les outils : "Je livre des apps mobiles" et non "J'utilise React Native"
2. **Être spécifique** : chiffres, noms, échelle — les affirmations vagues sont ignorées
3. **Aucun cliché** : bannir "passionné", "j'adore coder", "esprit d'équipe", "apprenant rapide"
4. **Voix active** : "J'ai construit" et non "a été construit par moi"
5. **Scannable** : paragraphes courts (2–3 phrases max), sauts de ligne stratégiques
6. **CTA clairs** : chaque bouton sait exactement ce qu'il fait

---

## Convention de commits Git

```
feat: ajouter section hero avec curseur terminal animé
fix: corriger le débordement de la nav mobile sur iOS Safari
style: ajuster l'espacement typographique du hero pour mobile
perf: chargement différé des images des cartes projet
seo: ajouter le schéma JSON-LD Person dans le layout racine
```