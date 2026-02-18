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
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
};

function createToken(id: number, type: 'access' | 'refresh') {
  return `${type}-${id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createSessionFromUser(user: UserRecord): AuthSession {
  const accessToken = createToken(user.id, 'access');
  const refreshToken = createToken(user.id, 'refresh');
  const accessTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
  };
}

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

  return createSessionFromUser(created);
}

async function login(email: string, password: string): Promise<AuthSession> {
  const users = await request<UserRecord[]>(`/users?email=${encodeURIComponent(email)}`);
  const user = users[0];

  if (!user || user.password !== password) {
    throw new Error('Identifiants invalides.');
  }

  return createSessionFromUser(user);
}

async function refreshSession(session: AuthSession): Promise<AuthSession> {
  const current = await request<UserRecord>(`/users/${session.user.id}`);

  return createSessionFromUser(current);
}

export { login, register, refreshSession };

