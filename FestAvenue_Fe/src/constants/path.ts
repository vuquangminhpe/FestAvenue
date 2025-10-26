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
    settings: '/staff/settings',
    events: '/staff/events'
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
      create_event: '/user/event/create_event',
      update_event: '/user/event/update_event',
      details: '/user/event/:eventId',
      ticketDetails: '/user/event/ticket/:eventCode',
      ticketDetails_event: '/user/event/ticket'
    },
    my: {
      root: '/user/my',
      profile: '/user/my/profile',
      messages: '/user/my/messages',
      organization: '/user/my/organization',
      events: '/user/my/events',
      credit: '/user/my/credit',
      payment: '/user/my/payment',
      schedule: '/user/my/schedule',
      analytics: '/user/my/analytics'
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
    },
    schedule: {
      root: '/user/schedule',
      view: '/user/schedule/view',
      create: '/user/schedule/create',
      edit: '/user/schedule/edit/:id',
      detail: '/user/schedule/:id'
    },
    analytics_event: {
      root: '/user/analytics/analytics_event',
      view: '/user/analytics/analytics_event/view',
      create: '/user/schedule/create',
      edit: '/user/schedule/edit/:id',
      detail: '/user/schedule/:id'
    },
    event_owner: {
      root: '/user/event-owner',
      user_management: '/user/event-owner/user-management',
      social_media: '/user/event-owner/social-media',
      ticket_management: '/user/event-owner/ticket-management'
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
      category: '/process/admin/category',
      package: '/process/admin/package',
      accounts: '/process/admin/accounts',
      analytics: '/process/admin/analytics'
    }
  },
  landing: {
    root: '/landing',
    template1: '/landing/template1',
    template2: '/landing/template2',
    template3: '/landing/template3',
    template4: '/landing/template4',
    template5: '/landing/template5',
    template6: '/landing/template6'
  }
} as const
export default path
