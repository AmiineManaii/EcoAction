# 🔐 Permissions — `src/utils/permissions.ts`

Ce fichier centralise toutes les règles d'autorisation de l'app.  
Chaque fonction est **pure** (pas d'effets de bord, testable facilement).

## Type `MissionLike`

```ts
export type MissionLike = {
  id: number;
  creatorId: number;
  slotsTotal: number;
  slotsTaken: number;
  participants: number[];
  status: 'open' | 'full' | 'completed' | 'cancelled';
};
```
On utilise un type partiel `MissionLike` plutôt que `Mission` complet pour rendre ces fonctions réutilisables avec n'importe quel objet ayant ces propriétés.

---

## Fonctions

### `canEditMission`

```ts
export function canEditMission(userId: number | undefined, mission: MissionLike): boolean {
  return !!userId && mission.creatorId === userId;
}
```
`!!userId` convertit `undefined` ou `0` en `false`.  
Seul le **créateur** peut modifier la mission.

### `isUserRegistered`

```ts
export function isUserRegistered(userId: number | undefined, mission: MissionLike): boolean {
  return !!userId && mission.participants.includes(userId);
}
```
Vérifie si l'ID de l'utilisateur est dans le tableau `participants`.


### `toggleParticipation`

```ts
export function toggleParticipation(userId: number, mission: MissionLike): MissionLike {
  if (mission.creatorId === userId) {
    return mission; // Le créateur ne peut pas se désinscrire → on retourne l'état inchangé
  }

  const registered = isUserRegistered(userId, mission);

  const nextParticipants = registered
    ? mission.participants.filter((id) => id !== userId) // retirer
    : [...mission.participants, userId];                  // ajouter

  const slotsTaken = nextParticipants.length;

  // Si la mission était ouverte et est maintenant pleine, changer le statut
  const nextStatus =
    mission.status === 'open' && slotsTaken >= mission.slotsTotal
      ? 'full'
      : mission.status;

  return { ...mission, participants: nextParticipants, slotsTaken, status: nextStatus };
}
```
`...mission` crée une copie de l'objet, puis on écrase les champs modifiés.  
Cette **immutabilité** est importante : React détecte les changements par référence.

### `removeParticipant`

```ts
export function removeParticipant(
  actingUserId: number | undefined,  // l'utilisateur qui effectue l'action
  targetUserId: number,              // le participant à retirer
  mission: MissionLike,
): MissionLike {
  if (!canEditMission(actingUserId, mission)) {
    throw new Error('Permission refusée');  // seul le créateur peut retirer quelqu'un
  }
  if (targetUserId === mission.creatorId) {
    throw new Error('Impossible de retirer le créateur de la mission.');
  }
  const nextParticipants = mission.participants.filter((id) => id !== targetUserId);
  const slotsTaken = nextParticipants.length;
  // Si la mission était pleine et qu'une place se libère, rouvrir
  const nextStatus =
    mission.status === 'full' && slotsTaken < mission.slotsTotal ? 'open' : mission.status;
  return { ...mission, participants: nextParticipants, slotsTaken, status: nextStatus };
}
```

---

## Résumé des règles métier

| Action | Condition |
|---|---|
| Modifier une mission | Être le créateur |
| S'inscrire | Mission ouverte + place disponible + connecté |
| Se désinscrire | Être inscrit + ne pas être le créateur |
| Retirer un participant | Être le créateur + ne pas cibler le créateur |
| Supprimer une mission | Être le créateur |
