export const routes = {
  eCommerce: {
    dashboard: '/ecommerce',
    products: '/products',
    createProduct: '/products/create',
    productDetails: (slug: string) => `/products/${slug}`,
    ediProduct: (slug: string) => `/products/${slug}/edit`,
    categories: '/categories',
    createCategory: '/categories/create',
    editCategory: (id: string) => `/categories/${id}/edit`,
    orders: '/orders',
    createOrder: '/orders/create',
    orderDetails: (id: string) => `/orders/${id}`,
    editOrder: (id: string) => `/orders/${id}/edit`,
    reviews: '/reviews',
    shop: '/shop',
    cart: '/cart',
    checkout: '/checkout',
    trackingId: (id: string) => `/tracking/${id}`,
  },
  laboratory: {
    list: '/labo',
    files: (id: string) => `/labo/${id}`,
    iiwgl: (id: string) => `/labo/iiwgl/${id}`,
    in_construction: '/labo/inconstruction',
  },

  devis: {
    list: '/devis',
    details: (id: any) => `/devis/${id}`,
  },

  patients: {
    list: '/patients',
    cases: (patientId: any) => `/patients/${patientId}/cases`,
    createPatient: '/patients/create',
  },
  users: {
    list: '/users',
  },

  commercials: {
    list: '/commercials',
  },

  createPatient: '/patients/create',
  home: '/accueil', // Set your main home page to '/accueil'

  reatainingGutters: {
    create: '/retaining-gutters/create',
    list: '/retaining-gutters',
  },

  invoices: {
    list: '/invoices',
    details: (id: any) => `/invoices/${id}`,
  },

  advacement: '/advancement',

  cases: {
    list: '/cases',
    details: (id: any) => `/cases/${id}`,
    createCase: (id: any, doctorId: any = null) => {
      if (id) {
        return `/cases/update/${id}`;
      } else if (doctorId) {
        return `/cases/doctor/create/${doctorId}`;
      } else {
        return '/cases/create';
      }
    },
    sub_cases: (id: any) => `/cases/sub-cases/${id}`,
    incomplete: '/cases/incomplete',
    smile_set_in_progress: '/cases/smile-set-in-progress',
    needs_approval: '/cases/needs-approval',
    in_construction: '/cases/in-construction',
    sent: '/cases/sent',
    in_treatment: '/cases/in-treatment',
    complete: '/cases/complete',
    renumere: (id: any) => `/cases/renumerer/${id}`,
  },

  admin: {
    files: (id: string) => `/admin/${id}`,
    iiwgl: (id: string) => `/admin/iiwgl/${id}`,
  },

  doctor: {
    list: '/doctors',
    cases: (id: any) => `/doctors/${id}`,
    doctorFile: (id: any) => `/doctors/${id}/fiche`,
  },

  alerts:'/alerts',
  alerts_doctor: {
    list: '/doctors',
    alerts: (id: any) => `/${id}`,
  },
  
  createCase: '/cases/create',
  onyxceph: '/onyxceph',
  searchAndFilter: {
    realEstate: '/search/real-estate',
    nft: '/search/nft',
    flight: '/search/flight',
  },
  support: {
    dashboard: '/support',
    inbox: '/support/inbox',
    supportCategory: (category: string) => `/support/inbox/${category}`,
    messageDetails: (id: string) => `/support/inbox/${id}`,
    snippets: '/support/snippets',
    createSnippet: '/support/snippets/create',
    viewSnippet: (id: string) => `/support/snippets/${id}`,
    editSnippet: (id: string) => `/support/snippets/${id}/edit`,
    templates: '/support/templates',
    createTemplate: '/support/templates/create',
    viewTemplate: (id: string) => `/support/templates/${id}`,
    editTemplate: (id: string) => `/support/templates/${id}/edit`,
  },
  logistics: {
    dashboard: '/logistics',
    shipmentList: '/logistics/shipments',
    customerProfile: '/logistics/customer-profile',
    createShipment: '/logistics/shipments/create',
    editShipment: (id: string) => `/logistics/shipments/${id}/edit`,
    shipmentDetails: (id: string) => `/logistics/shipments/${id}`,
    tracking: (id: string) => `/logistics/tracking/${id}`,
  },
  appointment: {
    dashboard: '/appointment',
    appointmentList: '/appointment/list',
  },
  executive: {
    dashboard: '/executive',
  },
  analytics: '/analytics',
  financial: {
    dashboard: '/financial',
  },
  file: {
    dashboard: '/file',
    manager: '/file-manager',
    upload: '/file-manager/upload',
    create: '/file-manager/create',
  },
  pos: {
    index: '/point-of-sale',
  },
  eventCalendar: '/event-calendar',
  rolesPermissions: '/roles-permissions',
  invoice: {
    home: '/invoice',
    create: '/invoice/create',
    details: (id: string) => `/invoice/${id}`,
    edit: (id: string) => `/invoice/${id}/edit`,
  },
  widgets: {
    cards: '/widgets/cards',
    icons: '/widgets/icons',
    charts: '/widgets/charts',
    maps: '/widgets/maps',
    banners: '/widgets/banners',
  },
  tables: {
    basic: '/tables/basic',
    collapsible: '/tables/collapsible',
    enhanced: '/tables/enhanced',
    pagination: '/tables/pagination',
    search: '/tables/search',
    stickyHeader: '/tables/sticky-header',
  },
  multiStep: '/multi-step',
  forms: {
    profileSettings: '/forms/profile-settings',
    security: '/forms/profile-settings/security',
    personalInformation: '/forms/profile-settings/profile',
    newsletter: '/forms/newsletter',
  },
  emailTemplates: '/email-templates',
  profile: '/profile',
  welcome: '/welcome',
  comingSoon: '/coming-soon',
  accessDenied: '/access-denied',
  notFound: '/not-found',
  verifyLocation: '/verify-location',
  maintenance: '/maintenance',
  blank: '/blank',
  auth: {
    signUp: '/signup',
    signUp1: '/auth/sign-up-1',
    signUp2: '/auth/sign-up-2',
    signUp3: '/auth/sign-up-3',
    signUp4: '/auth/sign-up-4',
    signUp5: '/auth/sign-up-5',
    // sign in
    signIn1: '/auth/sign-in-1',
    signIn2: '/auth/sign-in-2',
    signIn3: '/auth/sign-in-3',
    signIn4: '/auth/sign-in-4',
    signIn5: '/auth/sign-in-5',
    // forgot password
    forgotPassword1: '/auth/forgot-password-1',
    forgotPassword2: '/auth/forgot-password-2',
    forgotPassword3: '/auth/forgot-password-3',
    forgotPassword4: '/auth/forgot-password-4',
    forgotPassword5: '/auth/forgot-password-5',
    // OTP
    otp1: '/auth/otp-1',
    otp2: '/auth/otp-2',
    otp3: '/auth/otp-3',
    otp4: '/auth/otp-4',
    otp5: '/auth/otp-5',
  },
  signIn: '/signin',
};
