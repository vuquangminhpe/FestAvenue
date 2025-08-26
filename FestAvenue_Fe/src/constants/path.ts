const path = {
  home: '/home',
  asHome: '/',
  notfound: '*',
  termOfService: '/term-of-service',
  privacyPolicy: '/privacy-policy',
  auth: {
    root: '/auth',
    login: '/auth/login',
    signup: '/auth/signup',
    verify_email: '/auth/verify-email',
    email_verification: '/auth/email-verification',
    findId: '/auth/find-id',
    findPassword: '/auth/find-password',
    forgotPassword: '/auth/forgot-password',
    verifyForgotPassword: '/auth/verify-forgot-password',
    resetPassword: '/auth/reset-password',
    logout: '/auth/logout'
  },
  user: {
    root: '/user',
    profile: '/user/profile',

    my: {
      root: '/user/my'
    },
    credit: {
      root: '/user/credit',
      recharge: '/user/credit/recharge',
      history: '/user/credit/history'
    }
  },
  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    login: '/login'
  }
} as const
export default path
