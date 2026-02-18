import { request } from './client';

export type MissionStatus = 'open' | 'full' | 'completed' | 'cancelled';

export type MissionType =
  | 'nettoyage_plage'
  | 'plantation_arbres'
  | 'atelier_zero_dechet'
  | 'sensibilisation'
  | 'jardinage_urbain'
  | 'collecte_dechets';

export type Mission = {
  id: number;
  creatorId: number;
  title: string;
  description: string;
  type: MissionType;
  city: string;
  address: string;
  date: string;
  durationHours: number;
  slotsTotal: number;
  slotsTaken: number;
  status: MissionStatus;
  imageUrl: string;
  organizerName: string;
  createdAt: string;
  participants: number[];
};

export type MissionPayload = Omit<Mission, 'id' | 'createdAt' | 'slotsTaken' | 'status'> &
  Partial<Pick<Mission, 'status' | 'slotsTaken'>>;

async function getMissions(): Promise<Mission[]> {

   return request<Mission[]>('/missions');
}

async function getMission(id: number): Promise<Mission> {
  return request<Mission>(`/missions/${id}`);
}

async function createMission(payload: MissionPayload): Promise<Mission> {
  return request<Mission>('/missions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function updateMission(id: number, payload: Partial<MissionPayload>): Promise<Mission> {
  return request<Mission>(`/missions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

async function deleteMission(id: number): Promise<void> {
  await request<unknown>(`/missions/${id}`, {
    method: 'DELETE',
  });
}

export { getMissions, getMission, createMission, updateMission, deleteMission };
