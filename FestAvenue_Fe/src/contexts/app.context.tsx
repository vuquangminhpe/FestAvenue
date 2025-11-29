import type { userRes } from '@/types/user.types'
import { getAccessTokenFromLS, getAdminTokenFromLS } from '@/utils/auth'

import { create } from 'zustand'

interface AdminState {
  isLogin: boolean
  setIsLogin: (value: boolean) => void
  profile?: userRes
  setProfile: (value: userRes | undefined) => void
}

interface StaffState {
  isLogin: boolean
  setIsLogin: (value: boolean) => void
  profile?: userRes
  setProfile: (value: userRes | undefined) => void
}
interface UsersState {
  isAuth: boolean
  setIsAuth: (value: boolean) => void
  isProfile?: userRes
  setIsProfile: (value: userRes | undefined) => void
  userAvatar?: string
  setUserAvatar: (value: string) => void
}
export const useAdminStore = create<AdminState>()((set) => ({
  isLogin: getAdminTokenFromLS() !== null ? true : false,
  setIsLogin: (value) => set({ isLogin: value }),
  profile: undefined,
  setProfile: (value) => set({ profile: value })
}))

export const useStaffStore = create<StaffState>()((set) => ({
  isLogin: getAccessTokenFromLS() !== null ? true : false,
  setIsLogin: (value) => set({ isLogin: value }),
  profile: undefined,
  setProfile: (value) => set({ profile: value })
}))

export const useUsersStore = create<UsersState>()((set) => ({
  isProfile: undefined,
  setIsProfile: (value) => set({ isProfile: value }),
  isAuth: getAccessTokenFromLS() !== null ? true : false,
  setIsAuth: (value) => set({ isAuth: value }),
  userAvatar: undefined,
  setUserAvatar: (value) => set({ userAvatar: value })
}))

interface HeaderState {
  children: React.ReactNode | undefined
  setChildren: (value: React.ReactNode | undefined) => void
}

export const useHeaderStore = create<HeaderState>()((set) => ({
  children: undefined,
  setChildren: (value) => set({ children: value })
}))
