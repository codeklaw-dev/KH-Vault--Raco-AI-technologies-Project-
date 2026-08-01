import { create } from 'zustand';
import type { Role, User } from '../types';
import { users } from '../data/seed';

interface AuthState {
  user: User | null;
  signedIn: boolean;
  signIn: (role: Role) => void;
  switchRole: (role: Role) => void;
  signOut: () => void;
}

function userForRole(role: Role): User {
  return users.find((u) => u.role === role) ?? users[0];
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  signedIn: false,
  signIn: (role) => set({ user: userForRole(role), signedIn: true }),
  switchRole: (role) => set({ user: userForRole(role) }),
  signOut: () => set({ user: null, signedIn: false }),
}));
