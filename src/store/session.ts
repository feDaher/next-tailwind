"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user";

type SessionState = {
  users: User[];
  current?: User | null;
  register: (u: User) => void;
  login: (login: string, password: string) => boolean;
  logout: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      users: [],
      current: null,
      register: (u) => set((s) => ({
        users: [...s.users, u]
      })),
      login: (login, password) => {
        const u = get().users.find(
          (x) =>
            (x.username === login || x.email === login) &&
            x.password === password
        );
        set({ current: u ?? null });
        return !!u;
      },
      logout: () => set({ current: null }),
    }),
    { name: 'mini-trello-session' }
  )
);

