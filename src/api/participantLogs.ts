import { request } from './client';

export type ParticipantLog = {
  id: number;
  missionId: number;
  actingUserId: number | null;
  targetUserId: number | null;
  action:
    | 'add_participant'
    | 'remove_participant'
    | 'attempt_remove_creator'
    | 'attempt_unsubscribe_creator';
  createdAt: string;
  details?: string;
};

async function logParticipantChange(
  payload: Omit<ParticipantLog, 'id' | 'createdAt'> & { details?: string },
): Promise<ParticipantLog> {
  const body = {
    ...payload,
    createdAt: new Date().toISOString(),
  };

  return request<ParticipantLog>('/participantLogs', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export { logParticipantChange };

