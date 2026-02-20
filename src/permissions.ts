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



export function toggleParticipation(userId: number, mission: MissionLike): MissionLike {
  if (mission.creatorId === userId) {
    return mission;
  }
  const registered = isUserRegistered(userId, mission);
  const nextParticipants = registered
    ? mission.participants.filter((id) => id !== userId)
    : [...mission.participants, userId];
  const slotsTaken = nextParticipants.length;
  const nextStatus =
    mission.status === 'open' && slotsTaken >= mission.slotsTotal ? 'full' : mission.status;
  return { ...mission, participants: nextParticipants, slotsTaken, status: nextStatus };
}
