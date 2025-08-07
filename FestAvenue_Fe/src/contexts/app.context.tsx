import type { UserProfileResponse } from '@/types/user.types'
import { getAccessTokenFromLS, getAdminTokenFromLS } from '@/utils/auth'

import { create } from 'zustand'

interface AdminState {
  isLogin: boolean
  setIsLogin: (value: boolean) => void
}
interface UsersState {
  isAuth: boolean
  setIsAuth: (value: boolean) => void
  isProfile?: UserProfileResponse
  setIsProfile: (value: UserProfileResponse | undefined) => void
  userAvatar?: string
  setUserAvatar: (value: string) => void
}
export const useAdminStore = create<AdminState>()((set) => ({
  isLogin: getAdminTokenFromLS() !== null ? true : false,
  setIsLogin: (value) => set({ isLogin: value })
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
