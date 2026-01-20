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
    },

    // Footer
    footer: {
      developedBy: 'פותח על ידי',
      contact: 'צור קשר',
      email: 'contact@kolamba.org',
      rights: 'כל הזכויות שמורות',
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
    },

    // Footer
    footer: {
      developedBy: 'Developed by',
      contact: 'Contact',
      email: 'contact@kolamba.org',
      rights: 'All rights reserved',
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
