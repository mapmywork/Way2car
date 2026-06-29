// ─── User Types ───────────────────────────────────────────────────

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  passwordHash: string;
  role: UserRole;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

/** Safe user data (no passwordHash) for client-side use */
export type SafeUser = Omit<User, "passwordHash">;

/** Session user data available in NextAuth callbacks */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image: string | null;
}
