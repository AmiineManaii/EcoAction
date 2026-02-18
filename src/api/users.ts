import { request } from './client';

export type AppUser = {
  id: number;
  name: string;
  email: string;
};

async function getUsers(): Promise<AppUser[]> {
  return request<AppUser[]>('/users');
}

export { getUsers };

