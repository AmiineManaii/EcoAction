import { request } from './client';

export type User = {
  id: number;
  email: string;
  name: string;
};

type UserRecord = User & {
  password: string;
  createdAt: string;
};

export type AuthSession = {
  user: User;
};

async function register(name: string, email: string, password: string): Promise<AuthSession> {
  const existing = await request<UserRecord[]>(`/users?email=${encodeURIComponent(email)}`);

  if (existing.length > 0) {
    throw new Error('Cet email est déjà utilisé.');
  }

  const created = await request<UserRecord>('/users', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    }),
  });

  return {
    user: {
      id: created.id,
      email: created.email,
      name: created.name,
    },
  };
}

async function login(email: string, password: string): Promise<AuthSession> {
  const users = await request<UserRecord[]>(`/users?email=${encodeURIComponent(email)}`);
  const user = users[0];

  if (!user || user.password !== password) {
    throw new Error('Identifiants invalides.');
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}

export { login, register };
