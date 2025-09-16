const path = {
  home: '/home',
  asHome: '/',
  notfound: '*',
  termOfService: '/term-of-service',
  privacyPolicy: '/privacy-policy',
  staff: {
    auth: {
      root: '/auth/staff',
      login: '/auth/staff/login'
    },
    root: '/staff',
    messages: '/staff/messages',
    users: '/staff/users',
    settings: '/staff/settings'
  },
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
    organization: {
      root: '/user/organization',
      created_organization: '/user/organization/create-organization'
    },
    event: {
      root: '/user/event',
      create_event: '/user/event/create_event'
    },
    my: {
      root: '/user/my',
      profile: '/user/my/profile',
      messages: '/user/my/messages',
      organization: '/user/my/organization',
      credit: '/user/my/credit'
    },
    credit: {
      root: '/user/credit',
      recharge: '/user/credit/recharge',
      history: '/user/credit/history'
    },
    payment: {
      root: '/user/payment',
      payment_organization: '/user/payment/payment_organization',
      payment_event: '/user/payment/payment_event'
    }
  },
  admin: {
    auth: {
      root: '/auth/admin',
      login: '/auth/admin/login'
    },
    process: {
      root: '/process/admin',
      dashboard: '/process/admin/dashboard',
      users: '/process/admin/users',
      settings: '/process/admin/settings',
      category: '/process/admin/category'
    }
  }
} as const
export default path
