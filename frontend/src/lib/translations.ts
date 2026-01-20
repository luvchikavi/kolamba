/**
 * Kolamba Translations - Hebrew & English
 * Content source: kolamba.org
 */

export type Language = 'he' | 'en';

export const translations = {
  he: {
    // Brand
    brand: {
      name: 'KOLAMBA',
      tagline: 'כל העולם במה',
      subtitle: 'The Jewish Culture Club',
      description: 'פלטפורמה דיגיטלית המחברת יוצרים, אמנים ודוברים ישראלים ויהודים עם קהילות יהודיות ברחבי העולם',
      shortDescription: 'מקשרים אמנים ישראלים לקהילות יהודיות ברחבי העולם',
    },

    // Navigation
    nav: {
      home: 'בית',
      artists: 'אמנים',
      categories: 'קטגוריות',
      search: 'חיפוש',
      login: 'התחבר',
      register: 'הרשמה',
      logout: 'התנתק',
      dashboard: 'לוח בקרה',
      about: 'אודות',
      contact: 'צור קשר',
    },

    // Hero Section
    hero: {
      title: 'כל העולם במה',
      subtitle: 'The Jewish Culture Club',
      description: 'גלה אמנים מוכשרים לאירועים בקהילה שלכם - שירה, הרצאות, סדנאות ועוד',
      searchPlaceholder: 'חפש אמנים, קטגוריות...',
      searchButton: 'חפש',
    },

    // Categories
    categories: {
      title: 'קטגוריות פופולריות',
      music: 'מוזיקה',
      dance: 'ריקוד',
      theater: 'תיאטרון',
      visualArts: 'אמנות חזותית',
      workshops: 'סדנאות',
      lectures: 'הרצאות',
      film: 'קולנוע',
      journalism: 'עיתונות',
      viewAll: 'צפה בכל הקטגוריות',
    },

    // Artists
    artists: {
      title: 'אמנים',
      featured: 'אמנים מומלצים',
      all: 'כל האמנים',
      viewProfile: 'צפה בפרופיל',
      bookNow: 'הזמן עכשיו',
      about: 'אודות',
      categories: 'תחומי פעילות',
      priceRange: 'טווח מחירים',
      location: 'מיקום',
      languages: 'שפות',
      contact: 'יצירת קשר',
      website: 'אתר אינטרנט',
      noResults: 'לא נמצאו אמנים',
    },

    // Price Ranges
    priceRanges: {
      budget: 'חסכוני',
      moderate: 'בינוני',
      premium: 'פרימיום',
    },

    // Booking
    booking: {
      title: 'בקשת הזמנה',
      eventDate: 'תאריך האירוע',
      eventType: 'סוג האירוע',
      communityName: 'שם הקהילה',
      contactPerson: 'איש קשר',
      email: 'דוא"ל',
      phone: 'טלפון',
      message: 'הודעה',
      budget: 'תקציב',
      submit: 'שלח בקשה',
      success: 'הבקשה נשלחה בהצלחה!',
      error: 'שגיאה בשליחת הבקשה',
    },

    // Event Types
    eventTypes: {
      performance: 'הופעה',
      workshop: 'סדנה',
      lecture: 'הרצאה',
      exhibition: 'תערוכה',
      other: 'אחר',
    },

    // Auth
    auth: {
      login: 'התחבר',
      register: 'הרשמה',
      email: 'דוא"ל',
      password: 'סיסמה',
      name: 'שם מלא',
      forgotPassword: 'שכחת סיסמה?',
      noAccount: 'אין לך חשבון?',
      hasAccount: 'יש לך חשבון?',
      registerAs: 'הרשם כ:',
      artist: 'אמן',
      community: 'קהילה',
      welcomeBack: 'ברוכים השבים לקולמבה',
      loggingIn: 'מתחבר...',
      or: 'או',
      notRegistered: 'עדיין לא רשום?',
      registerAsArtist: 'הרשמה כאמן',
      registerAsCommunity: 'הרשמה כקהילה',
      loginError: 'שגיאה בהתחברות. נסה שוב.',
    },

    // Search
    search: {
      title: 'חיפוש',
      placeholder: 'חיפוש אמנים...',
      button: 'חפש',
      filters: 'פילטרים',
      clearAll: 'נקה הכל',
      category: 'קטגוריה',
      priceRange: 'טווח מחיר (USD)',
      minimum: 'מינימום',
      maximum: 'מקסימום',
      language: 'שפה',
      allLanguages: 'כל השפות',
      applyFilters: 'החל פילטרים',
      resultsFound: 'נמצאו',
      resultsFor: 'תוצאות עבור',
      sortBy: 'מיון:',
      relevance: 'רלוונטיות',
      priceLowToHigh: 'מחיר: נמוך לגבוה',
      priceHighToLow: 'מחיר: גבוה לנמוך',
      noResults: 'לא נמצאו תוצאות',
      noResultsHint: 'נסה לשנות את הפילטרים או מילות החיפוש',
      clearFilters: 'נקה פילטרים',
      advancedSearch: 'חיפוש מתקדם',
      from: 'מ-',
    },

    // Pages
    pages: {
      home: 'דף הבית',
      artists: 'אמנים',
      featured: 'מומלץ',
      found: 'נמצאו',
    },

    // Artist Profile
    artistProfile: {
      featuredArtist: 'אמן מומלץ',
      about: 'אודות',
      performanceTypes: 'סוגי הופעות',
      pricing: 'מחירים',
      singlePerformance: 'הופעה בודדת',
      tourPackage: 'סבב הופעות',
      priceNote: '* מחירים משוערים, ניתן למשא ומתן',
      availability: 'זמינות',
      availableForTours: 'זמין לטורים',
      availablePeriods: 'תקופות זמינות:',
      sendBookingRequest: 'שלח בקשת הזמנה',
      contactArtist: 'יצירת קשר',
    },

    // Dashboard
    dashboard: {
      artistDashboard: 'לוח בקרה לאמן',
      communityDashboard: 'לוח בקרה לקהילה',
      manageBookings: 'נהל את ההזמנות וסבבי ההופעות שלך',
      settings: 'הגדרות',
      pendingBookings: 'הזמנות ממתינות',
      suggestedTours: 'סבבים מוצעים',
      confirmedTours: 'סבבים מאושרים',
      expectedRevenue: 'הכנסות צפויות',
      tourSuggestions: 'הצעות לסבבים',
      myTours: 'הסבבים שלי',
      bookings: 'הזמנות',
      noSuggestions: 'אין הצעות לסבבים כרגע',
      noSuggestionsHint: 'כשיהיו מספיק הזמנות באזורים קרובים, נציע לך סבבי הופעות אופטימליים.',
      noTours: 'אין סבבים עדיין',
      noToursHint: 'צור סבב הופעות מההצעות או הוסף הזמנות ידנית.',
      noPendingBookings: 'אין הזמנות ממתינות',
      noPendingBookingsHint: 'הזמנות חדשות יופיעו כאן כשקהילות ישלחו בקשות.',
      createTour: 'צור סבב הופעות',
      communities: 'קהילות',
      suggestedDates: 'תאריכים מוצעים',
      estimatedBudget: 'תקציב משוער',
      moreDetails: 'פרטים נוספים',
      performances: 'הופעות',
      totalBookings: 'סה״כ הזמנות',
      waiting: 'ממתינות',
      approved: 'מאושרות',
      completed: 'הושלמו',
      myBookings: 'ההזמנות שלי',
      all: 'הכל',
      noBookings: 'אין הזמנות',
      noBookingsHint: 'חפש אמנים ושלח בקשות להופעות',
      searchArtists: 'חפש אמנים',
      recommendedArtists: 'אמנים מומלצים עבורך',
      seeMoreArtists: 'ראה עוד אמנים',
      quickActions: 'פעולות מהירות',
      advancedSearch: 'חיפוש מתקדם',
      updateCommunityDetails: 'עדכן פרטי קהילה',
      bookingApproved: 'ההזמנה אושרה!',
      artistDetails: 'פרטי האמן',
      hello: 'שלום',
      budget: 'תקציב',
    },

    // Statuses
    status: {
      draft: 'טיוטה',
      proposed: 'הוצע',
      confirmed: 'מאושר',
      inProgress: 'בתהליך',
      completed: 'הושלם',
      cancelled: 'בוטל',
      pending: 'ממתין',
      approved: 'מאושר',
      rejected: 'נדחה',
      pendingApproval: 'ממתין לאישור',
    },

    // Footer
    footer: {
      developedBy: 'פותח על ידי',
      contact: 'צור קשר',
      email: 'contact@kolamba.org',
      rights: 'כל הזכויות שמורות',
      links: 'קישורים',
      legal: 'משפטי',
      about: 'אודות',
      faq: 'שאלות נפוצות',
      terms: 'תנאי שימוש',
      privacy: 'מדיניות פרטיות',
      copyright: '© 2026 Kolamba בע״מ. כל הזכויות שמורות.',
    },

    // Common
    common: {
      loading: 'טוען...',
      error: 'שגיאה',
      success: 'הצלחה',
      cancel: 'ביטול',
      save: 'שמור',
      edit: 'ערוך',
      delete: 'מחק',
      back: 'חזור',
      next: 'הבא',
      previous: 'הקודם',
      showMore: 'הצג עוד',
      showLess: 'הצג פחות',
    },
  },

  en: {
    // Brand
    brand: {
      name: 'KOLAMBA',
      tagline: 'All the world\'s a stage',
      subtitle: 'The Jewish Culture Club',
      description: 'A digital platform that connects Israeli and Jewish creators, artists, and speakers with Jewish communities around the world',
      shortDescription: 'Connecting Israeli artists with Jewish communities worldwide',
    },

    // Navigation
    nav: {
      home: 'Home',
      artists: 'Artists',
      categories: 'Categories',
      search: 'Search',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      dashboard: 'Dashboard',
      about: 'About',
      contact: 'Contact',
    },

    // Hero Section
    hero: {
      title: 'All the world\'s a stage',
      subtitle: 'The Jewish Culture Club',
      description: 'Discover talented artists for your community events - music, lectures, workshops and more',
      searchPlaceholder: 'Search artists, categories...',
      searchButton: 'Search',
    },

    // Categories
    categories: {
      title: 'Popular Categories',
      music: 'Music',
      dance: 'Dance',
      theater: 'Theater',
      visualArts: 'Visual Arts',
      workshops: 'Workshops',
      lectures: 'Lectures',
      film: 'Film',
      journalism: 'Journalism',
      viewAll: 'View All Categories',
    },

    // Artists
    artists: {
      title: 'Artists',
      featured: 'Featured Artists',
      all: 'All Artists',
      viewProfile: 'View Profile',
      bookNow: 'Book Now',
      about: 'About',
      categories: 'Categories',
      priceRange: 'Price Range',
      location: 'Location',
      languages: 'Languages',
      contact: 'Contact',
      website: 'Website',
      noResults: 'No artists found',
    },

    // Price Ranges
    priceRanges: {
      budget: 'Budget',
      moderate: 'Moderate',
      premium: 'Premium',
    },

    // Booking
    booking: {
      title: 'Booking Request',
      eventDate: 'Event Date',
      eventType: 'Event Type',
      communityName: 'Community Name',
      contactPerson: 'Contact Person',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      budget: 'Budget',
      submit: 'Submit Request',
      success: 'Request submitted successfully!',
      error: 'Error submitting request',
    },

    // Event Types
    eventTypes: {
      performance: 'Performance',
      workshop: 'Workshop',
      lecture: 'Lecture',
      exhibition: 'Exhibition',
      other: 'Other',
    },

    // Auth
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      name: 'Full Name',
      forgotPassword: 'Forgot password?',
      noAccount: 'Don\'t have an account?',
      hasAccount: 'Already have an account?',
      registerAs: 'Register as:',
      artist: 'Artist',
      community: 'Community',
      welcomeBack: 'Welcome back to Kolamba',
      loggingIn: 'Logging in...',
      or: 'or',
      notRegistered: 'Not registered yet?',
      registerAsArtist: 'Register as Artist',
      registerAsCommunity: 'Register as Community',
      loginError: 'Login failed. Please try again.',
    },

    // Search
    search: {
      title: 'Search',
      placeholder: 'Search artists...',
      button: 'Search',
      filters: 'Filters',
      clearAll: 'Clear All',
      category: 'Category',
      priceRange: 'Price Range (USD)',
      minimum: 'Minimum',
      maximum: 'Maximum',
      language: 'Language',
      allLanguages: 'All Languages',
      applyFilters: 'Apply Filters',
      resultsFound: 'Found',
      resultsFor: 'results for',
      sortBy: 'Sort by:',
      relevance: 'Relevance',
      priceLowToHigh: 'Price: Low to High',
      priceHighToLow: 'Price: High to Low',
      noResults: 'No results found',
      noResultsHint: 'Try changing the filters or search terms',
      clearFilters: 'Clear Filters',
      advancedSearch: 'Advanced Search',
      from: 'From $',
    },

    // Pages
    pages: {
      home: 'Home',
      artists: 'Artists',
      featured: 'Featured',
      found: 'Found',
    },

    // Artist Profile
    artistProfile: {
      featuredArtist: 'Featured Artist',
      about: 'About',
      performanceTypes: 'Performance Types',
      pricing: 'Pricing',
      singlePerformance: 'Single Performance',
      tourPackage: 'Tour Package',
      priceNote: '* Estimated prices, negotiable',
      availability: 'Availability',
      availableForTours: 'Available for Tours',
      availablePeriods: 'Available periods:',
      sendBookingRequest: 'Send Booking Request',
      contactArtist: 'Contact',
    },

    // Dashboard
    dashboard: {
      artistDashboard: 'Artist Dashboard',
      communityDashboard: 'Community Dashboard',
      manageBookings: 'Manage your bookings and tour schedules',
      settings: 'Settings',
      pendingBookings: 'Pending Bookings',
      suggestedTours: 'Suggested Tours',
      confirmedTours: 'Confirmed Tours',
      expectedRevenue: 'Expected Revenue',
      tourSuggestions: 'Tour Suggestions',
      myTours: 'My Tours',
      bookings: 'Bookings',
      noSuggestions: 'No tour suggestions available',
      noSuggestionsHint: 'When there are enough bookings in nearby areas, we\'ll suggest optimal tour routes.',
      noTours: 'No tours yet',
      noToursHint: 'Create a tour from suggestions or add bookings manually.',
      noPendingBookings: 'No pending bookings',
      noPendingBookingsHint: 'New bookings will appear here when communities send requests.',
      createTour: 'Create Tour',
      communities: 'Communities',
      suggestedDates: 'Suggested Dates',
      estimatedBudget: 'Estimated Budget',
      moreDetails: 'More Details',
      performances: 'Performances',
      totalBookings: 'Total Bookings',
      waiting: 'Waiting',
      approved: 'Approved',
      completed: 'Completed',
      myBookings: 'My Bookings',
      all: 'All',
      noBookings: 'No bookings',
      noBookingsHint: 'Search for artists and send booking requests',
      searchArtists: 'Search Artists',
      recommendedArtists: 'Recommended Artists for You',
      seeMoreArtists: 'See More Artists',
      quickActions: 'Quick Actions',
      advancedSearch: 'Advanced Search',
      updateCommunityDetails: 'Update Community Details',
      bookingApproved: 'Booking Approved!',
      artistDetails: 'Artist Details',
      hello: 'Hello',
      budget: 'Budget',
    },

    // Statuses
    status: {
      draft: 'Draft',
      proposed: 'Proposed',
      confirmed: 'Confirmed',
      inProgress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      pendingApproval: 'Pending Approval',
    },

    // Footer
    footer: {
      developedBy: 'Developed by',
      contact: 'Contact',
      email: 'contact@kolamba.org',
      rights: 'All rights reserved',
      links: 'Links',
      legal: 'Legal',
      about: 'About',
      faq: 'FAQ',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      copyright: '© 2026 Kolamba Ltd. All rights reserved.',
    },

    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      showMore: 'Show More',
      showLess: 'Show Less',
    },
  },
};

// Type for translation structure (using Hebrew as base)
export type TranslationKeys = typeof translations.he;
