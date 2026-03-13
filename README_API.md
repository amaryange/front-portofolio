# Portfolio API — AdonisJS 6 + PostgreSQL

API REST du portfolio de M. Amary. Gère les articles de blog, les expériences, les projets, les compétences, les messages de contact et les abonnés newsletter.

---

## Stack

| Couche          | Technologie                         |
|----------------|-------------------------------------|
| Framework      | AdonisJS 6 (Node.js)                |
| Base de données | PostgreSQL 16                      |
| ORM            | Lucid (intégré à AdonisJS)          |
| Auth           | JWT via `@adonisjs/auth`            |
| Validation     | VineJS (intégré à AdonisJS)         |
| Rate limiting  | `@adonisjs/limiter`                 |
| Mail           | `@adonisjs/mail` + SMTP             |
| Scheduler      | `@adonisjs/scheduler`               |
| Analytics      | `posthog-node` (server-side)        |
| Doc API        | `adonis-autoswagger`                |
| Tests          | Japa (intégré à AdonisJS)           |

---

## Prérequis

- Node.js 20+
- PostgreSQL 16+
- pnpm

---

## Installation

```bash
git clone <repo>
cd portfolio-api
pnpm install
cp .env.example .env
# Remplis .env
node ace migration:run
node ace db:seed          # crée le compte admin + données de démo
pnpm dev
```

---

## Variables d'environnement

```env
# App
APP_KEY=                        # node ace generate:key
PORT=3333
HOST=0.0.0.0
NODE_ENV=development

# Base de données
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_DATABASE=portfolio

# Auth JWT (panneau admin navigateur)
JWT_SECRET=
JWT_EXPIRY=7d

# Auth API Key (appels serveur Next.js → API)
API_KEY=                        # clé aléatoire longue

# Webhook revalidation Next.js
FRONTEND_URL=http://localhost:3000
REVALIDATE_SECRET=              # clé partagée avec Next.js

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
MAIL_FROM=contact@mondomaine.com
ADMIN_EMAIL=amary@mondomaine.com

# OTP (durée de validité)
OTP_EXPIRY_MINUTES=10

# PostHog (analytics server-side)
POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxx
POSTHOG_HOST=https://eu.i.posthog.com

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

---

## Base de données

### Schéma ERD

```
users
 ├── (login classique)
 └── otps ──────────────── (codes OTP temporaires)

posts ──────────────────── post_tags ── tags
 └── (slug, locale, status, deleted_at, views, scheduled_at)

experiences
 └── experience_points

projects
 └── project_techs

skill_groups
 └── skills

contacts

subscribers
```

---

### Tables

#### `users`
| Colonne     | Type                | Notes              |
|------------|---------------------|--------------------|
| id         | bigint PK           |                    |
| email      | varchar(255) UNIQUE |                    |
| password   | varchar(255)        | argon2             |
| created_at | timestamp           |                    |
| updated_at | timestamp           |                    |

---

#### `otps`
| Colonne    | Type                | Notes                          |
|-----------|---------------------|--------------------------------|
| id        | bigint PK           |                                |
| email     | varchar(255)        |                                |
| code      | varchar(6)          | 6 chiffres hashés              |
| expires_at | timestamp          | maintenant + OTP_EXPIRY_MINUTES |
| used      | boolean             | défaut : false                 |
| created_at | timestamp          |                                |

---

#### `posts`
| Colonne        | Type                                          | Notes                        |
|---------------|-----------------------------------------------|------------------------------|
| id            | bigint PK                                     |                              |
| slug          | varchar(255)                                  | unique par locale, auto-généré |
| locale        | enum('fr', 'en')                              |                              |
| title         | varchar(500)                                  |                              |
| description   | text nullable                                 | résumé court                 |
| content       | text                                          | Markdown                     |
| status        | enum('draft', 'published', 'scheduled', 'deleted') | défaut : draft          |
| published_at  | timestamp nullable                            | null jusqu'à publication     |
| scheduled_at  | timestamp nullable                            | pour publication différée    |
| views         | integer                                       | défaut : 0                   |
| deleted_at    | timestamp nullable                            | soft delete                  |
| created_at    | timestamp                                     |                              |
| updated_at    | timestamp                                     |                              |

> Contrainte unique sur `(slug, locale)` — uniquement pour les posts non supprimés.

---

#### `tags`
| Colonne    | Type               |
|-----------|--------------------|
| id        | bigint PK          |
| name      | varchar(100) UNIQUE |
| created_at | timestamp         |

#### `post_tags` (pivot)
| Colonne  | Type      |
|---------|-----------|
| post_id | bigint FK |
| tag_id  | bigint FK |

---

#### `experiences`
| Colonne     | Type         | Notes                    |
|------------|--------------|--------------------------|
| id         | bigint PK    |                          |
| company    | varchar(255) |                          |
| period     | varchar(100) | ex : "2023 — Présent"    |
| role_fr    | varchar(500) |                          |
| role_en    | varchar(500) |                          |
| sort_order | integer      | ordre d'affichage        |
| created_at | timestamp    |                          |
| updated_at | timestamp    |                          |

#### `experience_points`
| Colonne       | Type      |
|--------------|-----------|
| id           | bigint PK |
| experience_id | bigint FK |
| content_fr   | text      |
| content_en   | text      |
| sort_order   | integer   |

---

#### `projects`
| Colonne         | Type              |
|----------------|-------------------|
| id             | bigint PK         |
| name_fr        | varchar(255)      |
| name_en        | varchar(255)      |
| description_fr | text              |
| description_en | text              |
| github_url     | varchar(500) nullable |
| live_url       | varchar(500) nullable |
| sort_order     | integer           |
| created_at     | timestamp         |
| updated_at     | timestamp         |

#### `project_techs`
| Colonne    | Type         |
|-----------|--------------|
| id        | bigint PK    |
| project_id | bigint FK   |
| tech_name | varchar(100) |
| sort_order | integer     |

---

#### `skill_groups`
| Colonne     | Type               |
|------------|--------------------|
| id         | bigint PK          |
| domain_key | varchar(100) UNIQUE |
| label      | varchar(255)       |
| sort_order | integer            |

#### `skills`
| Colonne        | Type         |
|---------------|--------------|
| id            | bigint PK    |
| skill_group_id | bigint FK   |
| name          | varchar(100) |
| sort_order    | integer      |

---

#### `contacts`
| Colonne    | Type                              | Notes                    |
|-----------|-----------------------------------|--------------------------|
| id        | bigint PK                         |                          |
| name      | varchar(255)                      |                          |
| email     | varchar(255)                      |                          |
| subject   | varchar(500) nullable             |                          |
| message   | text                              |                          |
| newsletter | boolean                          | opt-in newsletter        |
| status    | enum('new', 'read', 'archived')   | défaut : new             |
| ip_address | varchar(45) nullable             |                          |
| created_at | timestamp                        |                          |

---

#### `subscribers`
| Colonne      | Type                           | Notes                     |
|-------------|--------------------------------|---------------------------|
| id          | bigint PK                      |                           |
| email       | varchar(255) UNIQUE            |                           |
| source      | enum('contact_form', 'direct') | défaut : contact_form     |
| confirmed   | boolean                        | défaut : false (double opt-in futur) |
| created_at  | timestamp                      |                           |

---

## Authentification

### Deux systèmes d'auth coexistent

```
┌─────────────────────────────────────────────────────────────┐
│  Navigateur (admin panel)          Serveur Next.js           │
│                                                             │
│  POST /auth/login                  GET /posts               │
│  → reçoit JWT                      → header X-API-Key: ...  │
│                                                             │
│  Authorization: Bearer <jwt>       Vérifié par middleware   │
│  → accès /admin/*                  ApiKeyMiddleware          │
└─────────────────────────────────────────────────────────────┘
```

**JWT** : pour le panneau admin dans le navigateur. Expire au bout de 7 jours. L'utilisateur se reconnecte via email + mot de passe (ou OTP).

**API Key** : clé fixe dans `.env` côté Next.js, envoyée en header `X-API-Key`. Donne accès aux endpoints publics uniquement (lecture). Ne donne jamais accès aux routes `/admin/*`.

---

## Endpoints

### Base URL : `/api/v1`

**Légendes :**
- `—` : aucune auth requise
- `API` : header `X-API-Key` requis
- `JWT` : header `Authorization: Bearer <token>` requis

---

### Auth

| Méthode | Route                 | Auth | Description                              |
|--------|-----------------------|------|------------------------------------------|
| POST   | `/auth/login`         | —    | `{ email, password }` → `{ token }`     |
| POST   | `/auth/logout`        | JWT  | Invalide le token                        |
| GET    | `/auth/me`            | JWT  | Utilisateur courant                      |
| POST   | `/auth/otp/request`   | —    | `{ email }` → envoie le code par mail   |
| POST   | `/auth/otp/verify`    | —    | `{ email, code }` → `{ token }`         |

---

### Public — Articles

| Méthode | Route          | Auth | Description                                              |
|--------|----------------|------|----------------------------------------------------------|
| GET    | `/posts`       | API  | Liste paginée. Params : `locale`, `page`, `limit`, `tag`, `q` |
| GET    | `/posts/:slug` | API  | Article complet. Param : `locale`. **Incrémente `views`** |
| GET    | `/tags`        | API  | Tous les tags                                            |

**Exemple `GET /posts`**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "kubernetes-observability",
      "locale": "fr",
      "title": "Observabilité Kubernetes avec OpenTelemetry",
      "description": "Comment mettre en place une stack d'observabilité complète...",
      "published_at": "2024-03-01T10:00:00.000Z",
      "views": 142,
      "tags": ["kubernetes", "opentelemetry", "devops"]
    }
  ],
  "meta": { "current_page": 1, "last_page": 3, "per_page": 10, "total": 24 }
}
```

**Exemple `GET /posts/kubernetes-observability?locale=fr`**
```json
{
  "id": 1,
  "slug": "kubernetes-observability",
  "locale": "fr",
  "title": "Observabilité Kubernetes avec OpenTelemetry",
  "description": "...",
  "content": "# Introduction\n\nLa stack d'observabilité...",
  "published_at": "2024-03-01T10:00:00.000Z",
  "views": 143,
  "tags": ["kubernetes", "opentelemetry", "devops"]
}
```

---

### Public — Portfolio

| Méthode | Route           | Auth | Description                          |
|--------|-----------------|------|--------------------------------------|
| GET    | `/experiences`  | API  | Liste + points. Param : `locale`     |
| GET    | `/projects`     | API  | Liste + techs. Param : `locale`      |
| GET    | `/skills`       | API  | Groupes + technologies               |

---

### Public — Contact & Newsletter

| Méthode | Route            | Auth | Description                                                |
|--------|------------------|------|------------------------------------------------------------|
| POST   | `/contacts`      | —    | `{ name, email, subject?, message, newsletter? }`. Rate limité : 5 req/h/IP |
| POST   | `/newsletter`    | —    | `{ email }` — abonnement direct sans message. Rate limité  |
| DELETE | `/newsletter`    | —    | `{ email }` — désabonnement                               |

---

### Admin — Articles

| Méthode | Route                        | Auth | Description                                  |
|--------|------------------------------|------|----------------------------------------------|
| GET    | `/admin/posts`               | JWT  | Liste. Params : `status`, `locale`, `q`, `page` |
| POST   | `/admin/posts`               | JWT  | Créer un article                             |
| GET    | `/admin/posts/:id`           | JWT  | Détail complet                               |
| PUT    | `/admin/posts/:id`           | JWT  | Modifier                                     |
| DELETE | `/admin/posts/:id`           | JWT  | **Soft delete** → `status: deleted`          |
| POST   | `/admin/posts/:id/publish`   | JWT  | Passe en `published`, set `published_at`     |
| POST   | `/admin/posts/:id/unpublish` | JWT  | Repasse en `draft`, vide `published_at`      |
| POST   | `/admin/posts/:id/schedule`  | JWT  | `{ scheduled_at }` → `status: scheduled`    |
| GET    | `/admin/posts/trash`         | JWT  | Articles supprimés (soft delete)             |
| POST   | `/admin/posts/:id/restore`   | JWT  | Restaure depuis la corbeille → `draft`       |
| DELETE | `/admin/posts/:id/force`     | JWT  | Suppression définitive (depuis la corbeille) |

---

### Admin — Expériences

| Méthode | Route                        | Auth | Description                        |
|--------|------------------------------|------|------------------------------------|
| GET    | `/admin/experiences`         | JWT  | Liste complète                     |
| POST   | `/admin/experiences`         | JWT  | Créer                              |
| PUT    | `/admin/experiences/:id`     | JWT  | Modifier                           |
| DELETE | `/admin/experiences/:id`     | JWT  | Supprimer                          |
| PUT    | `/admin/experiences/reorder` | JWT  | `{ ids: [3, 1, 2] }` réordonne    |

---

### Admin — Projets

| Méthode | Route                     | Auth | Description    |
|--------|---------------------------|------|----------------|
| GET    | `/admin/projects`         | JWT  | Liste          |
| POST   | `/admin/projects`         | JWT  | Créer          |
| PUT    | `/admin/projects/:id`     | JWT  | Modifier       |
| DELETE | `/admin/projects/:id`     | JWT  | Supprimer      |
| PUT    | `/admin/projects/reorder` | JWT  | Réordonner     |

---

### Admin — Compétences

| Méthode | Route                            | Auth | Description                  |
|--------|----------------------------------|------|------------------------------|
| GET    | `/admin/skill-groups`            | JWT  | Tous les groupes + skills    |
| POST   | `/admin/skill-groups`            | JWT  | Créer un groupe              |
| PUT    | `/admin/skill-groups/:id`        | JWT  | Renommer                     |
| DELETE | `/admin/skill-groups/:id`        | JWT  | Supprimer groupe + skills    |
| PUT    | `/admin/skill-groups/reorder`    | JWT  | Réordonner les groupes       |
| POST   | `/admin/skill-groups/:id/skills` | JWT  | Ajouter une techno           |
| PUT    | `/admin/skills/:id`              | JWT  | Renommer une techno          |
| DELETE | `/admin/skills/:id`              | JWT  | Supprimer une techno         |

---

### Admin — Contacts

| Méthode | Route                          | Auth | Description                             |
|--------|--------------------------------|------|-----------------------------------------|
| GET    | `/admin/contacts`              | JWT  | Liste. Params : `status`, `page`        |
| GET    | `/admin/contacts/:id`          | JWT  | Détail + passe en `read` automatiquement |
| PUT    | `/admin/contacts/:id/status`   | JWT  | `{ status: "archived" }`                |
| DELETE | `/admin/contacts/:id`          | JWT  | Supprimer définitivement                |
| GET    | `/admin/contacts/export`       | JWT  | Télécharge un fichier CSV               |

---

### Admin — Newsletter

| Méthode | Route                    | Auth | Description                          |
|--------|--------------------------|------|--------------------------------------|
| GET    | `/admin/subscribers`     | JWT  | Liste. Params : `page`, `confirmed`  |
| DELETE | `/admin/subscribers/:id` | JWT  | Supprimer un abonné                  |
| GET    | `/admin/subscribers/export` | JWT | Télécharge un CSV (Mailchimp/Brevo) |

---

## Fonctionnalités détaillées

---

### 1. API Key statique pour Next.js

**Problème :** Les Server Components de Next.js appellent l'API côté serveur sans session utilisateur. Un JWT expire — impossible à renouveler automatiquement depuis le serveur.

**Solution :** Une clé fixe dans `.env` des deux côtés. Next.js l'envoie dans chaque requête vers l'API.

```
# .env (Next.js)
API_BASE_URL=https://api.mondomaine.com/api/v1
API_KEY=ma-cle-secrete-longue
```

```typescript
// Next.js — lib/api.ts
export async function apiFetch(path: string) {
  return fetch(`${process.env.API_BASE_URL}${path}`, {
    headers: { 'X-API-Key': process.env.API_KEY! },
    next: { tags: ['posts'] }   // cache Next.js
  })
}
```

```typescript
// AdonisJS — middleware/api_key_middleware.ts
export default class ApiKeyMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const key = request.header('X-API-Key')
    if (key !== env.get('API_KEY')) {
      return response.unauthorized({ error: 'Invalid API key' })
    }
    await next()
  }
}
```

**Règles :**
- L'API Key donne accès aux routes publiques en lecture seule
- Elle ne donne **jamais** accès aux routes `/admin/*` (JWT uniquement)
- La clé doit faire au minimum 32 caractères aléatoires

---

### 2. Webhook de revalidation vers Next.js

**Problème :** Next.js met en cache les pages statiques. Quand tu publies un article depuis l'admin, le blog ne se met pas à jour sans redéployer.

**Solution :** Dès qu'un article est publié, modifié ou supprimé, l'API envoie une requête HTTP vers Next.js pour invalider son cache.

```
Admin publie un article
        │
        ▼
AdonisJS POST /admin/posts/:id/publish
        │
        ├── Met à jour le post en base
        │
        └── POST http://localhost:3000/api/revalidate
              ?tag=posts&secret=REVALIDATE_SECRET
                    │
                    ▼
              Next.js invalide le cache "posts"
              → prochain visiteur reçoit le contenu frais
```

```typescript
// AdonisJS — services/revalidation_service.ts
export class RevalidationService {
  async revalidate(tag: 'posts' | 'experiences' | 'projects' | 'skills') {
    const url = `${env.get('FRONTEND_URL')}/api/revalidate`
    await fetch(`${url}?tag=${tag}&secret=${env.get('REVALIDATE_SECRET')}`, {
      method: 'POST'
    })
  }
}
```

```typescript
// Next.js — app/api/revalidate/route.ts
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('secret') !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 })
  }
  revalidateTag(searchParams.get('tag')!)
  return Response.json({ revalidated: true })
}
```

**Déclenché sur :** publish, unpublish, update, delete d'un post, et toute modification d'expériences / projets / compétences.

---

### 3. Compteur de vues par article

**Problème :** Savoir quels articles sont les plus lus.

**Solution en deux couches :**

- **PostHog** (client-side, déjà intégré dans Next.js) capture les `$pageview` avec le temps de lecture, le scroll depth et les propriétés du visiteur.
- **Colonne `views` en base** (backend) est incrémentée à chaque appel de `GET /posts/:slug` pour un accès rapide dans le dashboard admin sans appeler l'API PostHog.

```typescript
// AdonisJS — posts_controller.ts (endpoint public)
async show({ params, request }: HttpContext) {
  const locale = request.input('locale', 'fr')
  const post = await Post.query()
    .where('slug', params.slug)
    .where('locale', locale)
    .where('status', 'published')
    .firstOrFail()

  // Incrément atomique (pas de race condition)
  await Post.query().where('id', post.id).increment('views', 1)

  // Event server-side PostHog (enrichit les données client-side)
  await posthogService.capture({
    event: 'post_viewed',
    properties: { slug: post.slug, locale: post.locale, title: post.title },
  })

  return post
}
```

**Dans le dashboard admin :**
```
GET /admin/posts?sort=views&order=desc   → articles les plus lus en tête (depuis la DB)
```

Les analytics détaillées (temps de lecture, scroll, pays, device) sont dans le dashboard PostHog.

---

### 4. Statut `scheduled` — Publication différée

**Problème :** Rédiger un article la nuit et le publier automatiquement demain matin à 9h.

**Solution :** Champ `scheduled_at` sur le post + un job cron qui vérifie toutes les minutes.

```typescript
// AdonisJS — POST /admin/posts/:id/schedule
async schedule({ params, request }: HttpContext) {
  const { scheduled_at } = request.only(['scheduled_at'])
  const post = await Post.findOrFail(params.id)
  post.status = 'scheduled'
  post.scheduledAt = DateTime.fromISO(scheduled_at)
  await post.save()
}
```

```typescript
// AdonisJS — start/scheduler.ts
scheduler.call(async () => {
  const now = DateTime.now()
  const duePosts = await Post.query()
    .where('status', 'scheduled')
    .where('scheduled_at', '<=', now.toSQL())

  for (const post of duePosts) {
    post.status = 'published'
    post.publishedAt = now
    await post.save()
    await revalidationService.revalidate('posts')
  }
}).everyMinute()
```

**Cycle de vie complet d'un post :**
```
draft → scheduled → published → (soft) deleted → restored → draft
                 ↘ (annulation) → draft
```

---

### 5. Slug auto-généré

**Problème :** Forcer l'admin à saisir un slug manuellement est contraignant et source d'erreurs.

**Solution :** À la création, si `slug` n'est pas fourni, il est généré depuis `title` avec `slugify`. Si le slug existe déjà pour cette locale, un suffixe numérique est ajouté.

```typescript
// AdonisJS — services/slug_service.ts
import slugify from 'slugify'

export class SlugService {
  async generate(title: string, locale: string, excludeId?: number): Promise<string> {
    const base = slugify(title, { lower: true, strict: true, locale: 'fr' })
    let slug = base
    let counter = 2

    while (true) {
      const query = Post.query()
        .where('slug', slug)
        .where('locale', locale)
        .whereNot('status', 'deleted')

      if (excludeId) query.whereNot('id', excludeId)

      const exists = await query.first()
      if (!exists) break

      slug = `${base}-${counter++}`
    }

    return slug
  }
}
```

**Exemples :**
```
title: "Mon article sur Kubernetes"
→ slug: "mon-article-sur-kubernetes"

(si déjà pris)
→ slug: "mon-article-sur-kubernetes-2"
```

**À la modification**, si le titre change, le slug **n'est pas** re-généré automatiquement (évite de casser les liens existants). L'admin peut le changer manuellement.

---

### 6. Soft Delete sur les articles

**Problème :** Une suppression accidentelle d'un article est irréversible si on fait un `DELETE` SQL direct.

**Solution :** Marquer l'article comme supprimé avec un `deleted_at` + `status: deleted`. Il disparaît du blog public mais reste en base, accessible depuis une corbeille admin.

```typescript
// AdonisJS — DELETE /admin/posts/:id  (soft delete)
async destroy({ params }: HttpContext) {
  const post = await Post.findOrFail(params.id)
  post.status = 'deleted'
  post.deletedAt = DateTime.now()
  await post.save()
}

// POST /admin/posts/:id/restore
async restore({ params }: HttpContext) {
  const post = await Post.findOrFail(params.id)
  post.status = 'draft'
  post.deletedAt = null
  await post.save()
}

// DELETE /admin/posts/:id/force  (suppression définitive)
async forceDestroy({ params }: HttpContext) {
  const post = await Post.findOrFail(params.id)
  await post.delete()  // DELETE SQL réel
}
```

**Filtres automatiques :**
```typescript
// Toutes les requêtes publiques excluent automatiquement les posts supprimés
Post.query().whereNot('status', 'deleted')

// La corbeille : uniquement les posts supprimés
GET /admin/posts/trash
→ Post.query().where('status', 'deleted').orderBy('deleted_at', 'desc')
```

**Purge automatique :** Un job hebdomadaire supprime définitivement les posts en corbeille depuis plus de 30 jours.

---

### 7. Export CSV des contacts

**Problème :** Archiver ou importer les messages dans un CRM externe.

**Solution :** `GET /admin/contacts/export` génère un fichier CSV à télécharger.

```typescript
// AdonisJS — GET /admin/contacts/export
async export({ response }: HttpContext) {
  const contacts = await Contact.query().orderBy('created_at', 'desc')

  const csv = [
    ['ID', 'Nom', 'Email', 'Sujet', 'Message', 'Newsletter', 'Statut', 'Date'],
    ...contacts.map(c => [
      c.id, c.name, c.email, c.subject ?? '',
      c.message.replace(/\n/g, ' '),
      c.newsletter ? 'oui' : 'non',
      c.status,
      c.createdAt.toFormat('yyyy-MM-dd HH:mm')
    ])
  ].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')

  response.header('Content-Type', 'text/csv')
  response.header('Content-Disposition', 'attachment; filename="contacts.csv"')
  return response.send(csv)
}
```

---

### 8. OTP par email pour le login admin

**Problème :** Un mot de passe peut être compromis, bruteforcé ou oublié. Pour un admin solo, un code à usage unique par email est plus simple et plus sécurisé.

**Solution :** Deux endpoints remplacent (ou complètent) le login classique.

```
Admin saisit son email
        │
        ▼
POST /auth/otp/request   { email: "amary@..." }
        │
        ├── Génère un code à 6 chiffres
        ├── Hash le code (bcrypt) et le stocke dans `otps`
        ├── Envoie le mail : "Ton code : 483920"
        └── Répond : 200 OK (ne révèle pas si l'email existe)

Admin reçoit le mail, saisit le code
        │
        ▼
POST /auth/otp/verify   { email: "amary@...", code: "483920" }
        │
        ├── Vérifie que le code n'est pas expiré (OTP_EXPIRY_MINUTES)
        ├── Vérifie que le code n'a pas déjà été utilisé
        ├── Compare le hash
        ├── Marque le code used: true
        └── Répond : { token: "eyJ..." }
```

```typescript
// AdonisJS — auth_controller.ts
async requestOtp({ request, response }: HttpContext) {
  const { email } = request.only(['email'])

  // Toujours répondre 200 pour ne pas révéler si l'email existe
  const user = await User.findBy('email', email)
  if (!user) return response.ok({ message: 'Si cet email existe, un code a été envoyé.' })

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = DateTime.now().plus({ minutes: env.get('OTP_EXPIRY_MINUTES') })

  await Otp.create({ email, code: await hash.make(code), expiresAt })

  await mail.send((message) => {
    message.to(email).subject('Ton code de connexion').html(`
      <p>Code valable ${env.get('OTP_EXPIRY_MINUTES')} minutes : <strong>${code}</strong></p>
    `)
  })

  return response.ok({ message: 'Si cet email existe, un code a été envoyé.' })
}

async verifyOtp({ request, response }: HttpContext) {
  const { email, code } = request.only(['email', 'code'])

  const otp = await Otp.query()
    .where('email', email)
    .where('used', false)
    .where('expires_at', '>', DateTime.now().toSQL())
    .orderBy('created_at', 'desc')
    .first()

  if (!otp || !(await hash.verify(otp.code, code))) {
    return response.unauthorized({ error: 'Code invalide ou expiré.' })
  }

  otp.used = true
  await otp.save()

  const user = await User.findByOrFail('email', email)
  const token = await auth.use('jwt').generate(user)
  return response.ok({ token })
}
```

**Rate limiting :** 3 tentatives de `otp/request` par email par heure. 5 tentatives de `otp/verify` par email par heure (après ça, le compte est verrouillé 15 minutes).

---

### 9. Newsletter opt-in

**Problème :** Capturer des lecteurs intéressés sans outil externe payant.

**Solution :** Champ `newsletter` (booléen) dans le formulaire de contact + table `subscribers` dédiée + endpoint d'abonnement direct.

**Flux via formulaire de contact :**
```typescript
// AdonisJS — POST /contacts
async store({ request }: HttpContext) {
  const data = await request.validateUsing(contactValidator)

  const contact = await Contact.create(data)

  // Si opt-in newsletter : ajouter aux subscribers (ignorer si déjà inscrit)
  if (data.newsletter) {
    await Subscriber.updateOrCreate(
      { email: data.email },
      { email: data.email, source: 'contact_form', confirmed: true }
    )
  }

  // Notifier l'admin par email
  await mail.send((message) => {
    message
      .to(env.get('ADMIN_EMAIL'))
      .subject(`Nouveau message de ${data.name}`)
      .html(`<p>${data.message}</p>`)
  })

  return { success: true }
}
```

**Abonnement direct (sans message) :**
```
POST /newsletter   { email: "lecteur@..." }
→ Crée un subscriber avec source: 'direct'

DELETE /newsletter   { email: "lecteur@..." }
→ Supprime le subscriber (désabonnement RGPD)
```

**Export pour Mailchimp / Brevo :**
```
GET /admin/subscribers/export
→ CSV : email, source, confirmed, created_at
```

---

### 10. Swagger / OpenAPI

**Problème :** Documenter manuellement tous les endpoints est fastidieux et souvent désynchronisé du code.

**Solution :** `adonis-autoswagger` génère automatiquement la documentation depuis les annotations JSDoc et les validators VineJS.

```bash
pnpm add adonis-autoswagger
node ace configure adonis-autoswagger
```

```typescript
// config/swagger.ts
export default defineConfig({
  path: app.makePath('docs'),
  title: 'Portfolio API',
  version: '1.0.0',
  description: 'API du portfolio M. Amary',
  tagIndex: 2,
  ignore: ['/swagger', '/docs'],
  preferredPutPatch: 'PUT',
  securitySchemes: {
    BearerAuth: { type: 'http', scheme: 'bearer' },
    ApiKeyAuth:  { type: 'apiKey', in: 'header', name: 'X-API-Key' }
  }
})
```

```typescript
// start/routes.ts
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

router.get('/swagger', async () => AutoSwagger.default.docs(router.toJSON(), swagger))
router.get('/docs', async () => AutoSwagger.default.ui('/swagger', swagger))
```

**Accès :**
- `/docs` → Interface Swagger UI interactive (tester les endpoints depuis le navigateur)
- `/swagger` → Fichier JSON OpenAPI brut (pour importer dans Postman, Insomnia, etc.)

**Annotations sur les controllers :**
```typescript
/**
 * @summary Récupérer un article par slug
 * @tag Posts
 * @paramPath slug - Slug de l'article - @type(string)
 * @paramQuery locale - Langue (fr | en) - @type(string)
 * @responseBody 200 - <Post>
 * @responseBody 404 - Article non trouvé
 */
async show({ params, request }: HttpContext) { ... }
```

---

## PostHog — Analytics server-side

### Architecture globale

PostHog est utilisé sur **deux couches** qui se complètent :

```
Visiteur
   │
   ├─→ Next.js (frontend)
   │     └─→ posthog-js          ← events client : pageview, clics,
   │                                scroll, session replay, read time
   │
   └─→ AdonisJS (backend)
         └─→ posthog-node        ← events serveur : publication,
                                    contact, newsletter, OTP
```

Les deux flux arrivent dans le **même projet PostHog** et sont liés par les propriétés communes (`slug`, `locale`, `email`…). Cela permet de voir dans un seul dashboard à la fois le comportement des visiteurs et les actions métier.

---

### Installation

```bash
pnpm add posthog-node
```

---

### Service PostHog

```typescript
// app/services/posthog_service.ts
import { PostHog } from 'posthog-node'
import env from '#start/env'

const client = new PostHog(env.get('POSTHOG_KEY'), {
  host: env.get('POSTHOG_HOST'),
  flushAt: 1,      // envoie immédiatement (pas de batch en prod serverless)
  flushInterval: 0,
})

interface CaptureOptions {
  event: string
  distinctId?: string           // identifiant utilisateur (email ou 'anonymous')
  properties?: Record<string, unknown>
}

export class PostHogService {
  async capture({ event, distinctId = 'anonymous', properties = {} }: CaptureOptions) {
    client.capture({ distinctId, event, properties })
    await client.flush()        // assure l'envoi avant que la requête se termine
  }

  // Lie un utilisateur identifié à ses actions (appelé au login admin)
  async identify(userId: string, props: Record<string, string>) {
    client.identify({ distinctId: userId, properties: props })
    await client.flush()
  }
}

export const posthogService = new PostHogService()
```

---

### Events capturés côté serveur

| Event              | Déclenché par                            | Propriétés clés                                |
|-------------------|------------------------------------------|------------------------------------------------|
| `post_viewed`     | `GET /posts/:slug`                       | `slug`, `locale`, `title`                     |
| `post_published`  | `POST /admin/posts/:id/publish`          | `slug`, `locale`, `title`                     |
| `post_unpublished`| `POST /admin/posts/:id/unpublish`        | `slug`, `locale`                              |
| `post_scheduled`  | `POST /admin/posts/:id/schedule`         | `slug`, `scheduled_at`                        |
| `contact_received`| `POST /contacts`                         | `newsletter_optin` (bool)                     |
| `newsletter_subscribed` | `POST /newsletter`                 | `source` (contact_form \| direct)             |
| `admin_login`     | `POST /auth/login` ou `/auth/otp/verify` | — (distinctId = email admin)                  |

---

### Exemple concret — publication d'un article

```typescript
// admin/posts_controller.ts
async publish({ params }: HttpContext) {
  const post = await Post.findOrFail(params.id)
  post.status = 'published'
  post.publishedAt = DateTime.now()
  await post.save()

  // Revalidation du cache Next.js
  await revalidationService.revalidate('posts')

  // Event PostHog server-side
  await posthogService.capture({
    event: 'post_published',
    properties: { slug: post.slug, locale: post.locale, title: post.title },
  })

  return post
}
```

---

### Exemple concret — login admin (identify)

```typescript
// auth_controller.ts
async login({ request, auth }: HttpContext) {
  const { email, password } = request.only(['email', 'password'])
  const user = await auth.use('jwt').attempt(email, password)
  const token = await auth.use('jwt').generate(user)

  // Lie les futures actions à l'admin dans PostHog
  await posthogService.identify(user.email, { role: 'admin' })

  return { token }
}
```

---

### Ce qu'on voit dans le dashboard PostHog

| Vue                    | Données                                                   |
|-----------------------|-----------------------------------------------------------|
| **Insight**           | Articles les plus vus, temps de lecture moyen, scroll depth |
| **Funnels**           | Visiteur → lecture article → formulaire contact           |
| **Session Replay**    | Enregistrements des sessions (depuis Next.js)             |
| **Events**            | Toutes les publications, contacts, abonnements en temps réel |
| **Persons**           | Profil de l'admin (actions liées via `identify`)          |
| **Acquisition**       | Sources de trafic : LinkedIn, Google, GitHub, YouTube…    |

---

### Tracking des sources de trafic (UTM)

PostHog capture automatiquement deux choses sur chaque visiteur :

- **`$referring_domain`** — le domaine d'où vient le visiteur (ex : `linkedin.com`, `google.com`). Capturé sans rien faire.
- **Paramètres UTM** — tags ajoutés aux liens que tu partages. Permettent de distinguer "venu d'un post LinkedIn" vs "venu de ton profil LinkedIn" vs "venu d'une vidéo YouTube".

#### Paramètres UTM

| Paramètre      | Rôle                            | Exemple                        |
|---------------|---------------------------------|--------------------------------|
| `utm_source`  | La plateforme                   | `linkedin`, `youtube`, `google`|
| `utm_medium`  | Le type de contenu              | `social`, `post`, `video`, `email` |
| `utm_campaign`| Le contenu précis               | `profile`, `post-kubernetes`   |

#### Liens à configurer sur tes profils

```
LinkedIn (section "Site web") :
https://mondomaine.com?utm_source=linkedin&utm_medium=social&utm_campaign=profile

GitHub (champ "Website") :
https://mondomaine.com?utm_source=github&utm_medium=social&utm_campaign=profile

YouTube (description de chaque vidéo) :
https://mondomaine.com?utm_source=youtube&utm_medium=video&utm_campaign=description

Signature email :
https://mondomaine.com?utm_source=email&utm_medium=signature

CV PDF :
https://mondomaine.com?utm_source=cv&utm_medium=pdf
```

#### Liens pour les posts ponctuels

Quand tu partages un article de blog dans un post LinkedIn :
```
https://mondomaine.com/fr/blog/kubernetes-observability
  ?utm_source=linkedin
  &utm_medium=post
  &utm_campaign=post-kubernetes-janvier
```

PostHog affiche alors dans **Acquisition → UTM sources** :
- `linkedin / post / post-kubernetes-janvier` → X visiteurs
- `linkedin / social / profile` → Y visiteurs
- `google / (none) / (none)` → Z visiteurs (recherche organique)

#### Propriétés automatiquement capturées par PostHog

Sans aucun code supplémentaire, chaque `$pageview` contient :

```json
{
  "$referrer":              "https://www.linkedin.com/",
  "$referring_domain":      "linkedin.com",
  "utm_source":             "linkedin",
  "utm_medium":             "post",
  "utm_campaign":           "post-kubernetes-janvier",
  "$initial_referrer":      "https://www.linkedin.com/",
  "$initial_referring_domain": "linkedin.com"
}
```

Les propriétés `$initial_*` mémorisent la **toute première source** d'un visiteur, même s'il revient ensuite directement. Utile pour savoir quel canal a ramené un contact.

---

## Structure du projet

```
app/
  controllers/
    auth_controller.ts
    posts_controller.ts
    experiences_controller.ts
    projects_controller.ts
    skills_controller.ts
    contacts_controller.ts
    newsletter_controller.ts
    admin/
      posts_controller.ts
      experiences_controller.ts
      projects_controller.ts
      skills_controller.ts
      contacts_controller.ts
      subscribers_controller.ts
  middleware/
    api_key_middleware.ts       ← vérifie X-API-Key
    auth_middleware.ts          ← vérifie JWT
  models/
    user.ts
    otp.ts
    post.ts
    tag.ts
    experience.ts
    experience_point.ts
    project.ts
    project_tech.ts
    skill_group.ts
    skill.ts
    contact.ts
    subscriber.ts
  validators/
    auth_validator.ts
    post_validator.ts
    experience_validator.ts
    project_validator.ts
    contact_validator.ts
    subscriber_validator.ts
  services/
    slug_service.ts             ← génération de slugs uniques
    revalidation_service.ts     ← webhook Next.js
    posthog_service.ts          ← analytics server-side
database/
  migrations/
    001_create_users_table.ts
    002_create_otps_table.ts
    003_create_posts_table.ts
    004_create_tags_table.ts
    005_create_post_tags_table.ts
    006_create_experiences_table.ts
    007_create_experience_points_table.ts
    008_create_projects_table.ts
    009_create_project_techs_table.ts
    010_create_skill_groups_table.ts
    011_create_skills_table.ts
    012_create_contacts_table.ts
    013_create_subscribers_table.ts
  seeders/
    user_seeder.ts
start/
  routes.ts
  kernel.ts
  scheduler.ts                  ← publication différée + purge corbeille
```

---

## Commandes utiles

```bash
node ace migration:run               # Exécuter les migrations
node ace migration:rollback          # Annuler la dernière migration
node ace db:seed                     # Créer le compte admin
node ace make:migration <name>       # Nouvelle migration
node ace make:model <Name> -m        # Nouveau modèle + migration
node ace make:controller <Name>      # Nouveau contrôleur
node ace scheduler:run               # Démarrer le scheduler (prod)
node ace test                        # Tests
```
