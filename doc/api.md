# 🌐 Couche API — `src/api/`

## `client.ts` — Le wrapper HTTP central

```ts
const API_BASE_URL = 'http://192.168.1.15:3001';
```
L'adresse IP de votre machine où tourne JSON Server.  
**À changer selon votre réseau local.**

```ts
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
```
Fonction générique qui accepte un chemin (`/missions`) et des options HTTP.  
Le `<T>` est un **générique TypeScript** : il dit "je retourne un objet du type que tu me dis".

```ts
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
```
On construit l'URL complète et on ajoute l'en-tête JSON par défaut.  
`...options` copie toutes les autres options (method, body…) passées en paramètre.

```ts
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
```
Si la réponse HTTP est une erreur (4xx, 5xx), on lance une exception.  
Sinon, on parse le JSON et on le retourne avec le bon type TypeScript.

---

## `missions.ts` — CRUD des missions

### Types

```ts
export type MissionStatus = 'open' | 'full' | 'completed' | 'cancelled';
```
Un **union type** : le statut ne peut être que l'une de ces 4 valeurs.  
TypeScript refusera d'assigner autre chose (ex: `'en_cours'` causerait une erreur).

```ts
export type Mission = {
  id: number;
  creatorId: number;
  title: string;
  ...
  participants: number[];   // tableau d'IDs d'utilisateurs inscrits
};
```
L'interface complète d'une mission. `participants: number[]` = liste des IDs.

```ts
export type MissionPayload = Omit<Mission, 'id' | 'createdAt' | 'slotsTaken' | 'status'>
  & Partial<Pick<Mission, 'status' | 'slotsTaken'>>;
```
Type du corps de requête pour créer/modifier une mission :
- `Omit<Mission, ...>` → on retire les champs auto-générés par le serveur
- `Partial<Pick<Mission, ...>>` → on les rend optionnels (on peut les fournir, mais ce n'est pas obligatoire)

### Fonctions

```ts
async function getMissions(): Promise<Mission[]>        // GET /missions
async function getMission(id: number): Promise<Mission> // GET /missions/:id
async function createMission(payload)                   // POST /missions
async function updateMission(id, payload)               // PATCH /missions/:id
async function deleteMission(id: number)               // DELETE /missions/:id
```

---

## `auth.ts` — Authentification

```ts
async function register(name, email, password): Promise<AuthSession> {
  const existing = await request(`/users?email=${encodeURIComponent(email)}`);
  if (existing.length > 0) throw new Error('Cet email est déjà utilisé.');
```
Avant de créer un compte, on vérifie si l'email existe déjà.  
`encodeURIComponent` encode les caractères spéciaux pour les URLs (ex: `@` → `%40`).

```ts
  const created = await request('/users', { method: 'POST', body: JSON.stringify({...}) });
  return { user: { id: created.id, email: created.email, name: created.name } };
```
On crée l'utilisateur et on retourne **uniquement** les champs publics (pas le mot de passe).

```ts
async function login(email, password): Promise<AuthSession> {
  const users = await request(`/users?email=${encodeURIComponent(email)}`);
  const user = users[0];
  if (!user || user.password !== password) throw new Error('Identifiants invalides.');
```
On filtre par email côté serveur et on compare le mot de passe en clair.  
⚠️ En production, les mots de passe doivent être **hashés** (bcrypt, etc.).

---

## `participantLogs.ts` — Journal de participation

```ts
export type ParticipantLog = {
  action: 'add_participant' | 'remove_participant' | 'attempt_remove_creator' | 'attempt_unsubscribe_creator';
  ...
};
```
Chaque action sur les participants est enregistrée avec son type.  
Utile pour l'audit et le débogage.

```ts
async function logParticipantChange(payload): Promise<ParticipantLog> {
  const body = { ...payload, createdAt: new Date().toISOString() };
  return request('/participantLogs', { method: 'POST', body: JSON.stringify(body) });
}
```
On ajoute automatiquement `createdAt` (date/heure actuelle en format ISO 8601).

---

## `queryClient.ts` — Configuration du cache

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,   // 1 minute : donnée "fraîche", pas de re-fetch
      gcTime: 300_000,     // 5 minutes : durée en cache avant nettoyage
      retry: 2,            // 2 tentatives en cas d'erreur réseau
    },
  },
});
```
- `staleTime` : évite des requêtes inutiles si la donnée est récente
- `gcTime` (anciennement `cacheTime`) : garde les données en mémoire pour un retour rapide
- `retry: 2` : resilience aux erreurs réseau temporaires
