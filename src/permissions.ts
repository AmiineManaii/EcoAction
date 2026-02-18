export type MissionLike = {
  id: number;
  creatorId: number;
  slotsTotal: number;
  slotsTaken: number;
  participants: number[];
  status: 'open' | 'full' | 'completed' | 'cancelled';
};

export function canEditMission(userId: number | undefined, mission: MissionLike): boolean {
  return !!userId && mission.creatorId === userId;
}

export function isUserRegistered(userId: number | undefined, mission: MissionLike): boolean {
  return !!userId && mission.participants.includes(userId);
}

export function canRegister(userId: number | undefined, mission: MissionLike): boolean {
  if (!userId) return false;
  if (mission.status !== 'open') return false;
  if (isUserRegistered(userId, mission)) return true;
  return mission.slotsTaken < mission.slotsTotal;
}

export function toggleParticipation(userId: number, mission: MissionLike): MissionLike {
  const registered = isUserRegistered(userId, mission);
  const nextParticipants = registered
    ? mission.participants.filter((id) => id !== userId)
    : [...mission.participants, userId];
  const slotsTaken = nextParticipants.length;
  const nextStatus =
    mission.status === 'open' && slotsTaken >= mission.slotsTotal ? 'full' : mission.status;
  return { ...mission, participants: nextParticipants, slotsTaken, status: nextStatus };
}

export function removeParticipant(
  actingUserId: number | undefined,
  targetUserId: number,
  mission: MissionLike,
): MissionLike {
  if (!canEditMission(actingUserId, mission)) {
    throw new Error('Permission refusée');
  }
  const nextParticipants = mission.participants.filter((id) => id !== targetUserId);
  const slotsTaken = nextParticipants.length;
  const nextStatus = mission.status === 'full' && slotsTaken < mission.slotsTotal ? 'open' : mission.status;
  return { ...mission, participants: nextParticipants, slotsTaken, status: nextStatus };
}

