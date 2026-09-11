export type UserRole = "owner" | "admin" | "member" | "viewer";

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  organisation: string;
  jobTitle?: string;
  createdAt: string;
  lastActiveAt?: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface DeviceSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActiveAt: string;
  current: boolean;
}

export type NotificationKind = "processing" | "system" | "ai" | "security";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
}
