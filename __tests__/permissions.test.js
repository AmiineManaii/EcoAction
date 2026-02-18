function canEditMission(userId, mission) {
  return !!userId && mission.creatorId === userId;
}

function isUserRegistered(userId, mission) {
  return !!userId && mission.participants.includes(userId);
}

function canRegister(userId, mission) {
  if (!userId) return false;
  if (mission.status !== 'open') return false;
  if (isUserRegistered(userId, mission)) return true;
  return mission.slotsTaken < mission.slotsTotal;
}

function toggleParticipation(userId, mission) {
  const registered = isUserRegistered(userId, mission);
  const nextParticipants = registered
    ? mission.participants.filter((id) => id !== userId)
    : [...mission.participants, userId];
  const slotsTaken = nextParticipants.length;
  const nextStatus = mission.status === 'open' && slotsTaken >= mission.slotsTotal ? 'full' : mission.status;
  return { ...mission, participants: nextParticipants, slotsTaken, status: nextStatus };
}

function removeParticipant(actingUserId, targetUserId, mission) {
  if (!canEditMission(actingUserId, mission)) {
    throw new Error('Permission refusée');
  }
  const nextParticipants = mission.participants.filter((id) => id !== targetUserId);
  const slotsTaken = nextParticipants.length;
  const nextStatus = mission.status === 'full' && slotsTaken < mission.slotsTotal ? 'open' : mission.status;
  return { ...mission, participants: nextParticipants, slotsTaken, status: nextStatus };
}

function makeMission(overrides = {}) {
  return {
    id: 1,
    creatorId: 1,
    slotsTotal: 2,
    slotsTaken: 0,
    participants: [],
    status: 'open',
    ...overrides,
  };
}

describe('permissions (JS)', () => {
  test('canEditMission allows only creator', () => {
    const mission = makeMission({ creatorId: 2 });
    expect(canEditMission(2, mission)).toBe(true);
    expect(canEditMission(1, mission)).toBe(false);
    expect(canEditMission(undefined, mission)).toBe(false);
  });

  test('isUserRegistered checks membership', () => {
    const mission = makeMission({ participants: [1, 3], slotsTaken: 2 });
    expect(isUserRegistered(1, mission)).toBe(true);
    expect(isUserRegistered(2, mission)).toBe(false);
  });

  test('canRegister respects status and capacity', () => {
    expect(canRegister(1, makeMission({ status: 'cancelled' }))).toBe(false);
    expect(canRegister(1, makeMission({ status: 'open', slotsTaken: 2, slotsTotal: 2 }))).toBe(false);
    expect(canRegister(2, makeMission({ participants: [2], slotsTaken: 1 }))).toBe(true);
    expect(canRegister(undefined, makeMission())).toBe(false);
  });

  test('toggleParticipation adds and removes user and updates slotsTaken', () => {
    const m1 = makeMission();
    const m2 = toggleParticipation(5, m1);
    expect(m2.participants).toContain(5);
    expect(m2.slotsTaken).toBe(1);
    const m3 = toggleParticipation(5, m2);
    expect(m3.participants).not.toContain(5);
    expect(m3.slotsTaken).toBe(0);
  });

  test('removeParticipant only by creator and updates status from full→open', () => {
    const mission = makeMission({ creatorId: 10, slotsTotal: 1, participants: [7], slotsTaken: 1, status: 'full' });
    const updated = removeParticipant(10, 7, mission);
    expect(updated.participants).toEqual([]);
    expect(updated.slotsTaken).toBe(0);
    expect(updated.status).toBe('open');
    expect(() => removeParticipant(5, 7, mission)).toThrow();
  });
});

