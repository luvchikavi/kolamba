# Kolamba Content & Localization Plan

## Content Source: kolamba.org

### Extracted Content (January 20, 2026)

#### Brand Identity

| Element | Hebrew | English |
|---------|--------|---------|
| **Tagline** | כל העולם במה | All the world's a stage |
| **Subtitle** | The Jewish Culture Club | The Jewish Culture Club |

#### Core Description

**English:**
> A digital platform that connects Israeli and Jewish creators, artists, and speakers with Jewish communities around the world.

**Hebrew:**
> פלטפורמה דיגיטלית המחברת יוצרים, אמנים ודוברים ישראלים ויהודים עם קהילות יהודיות ברחבי העולם.

#### Value Proposition

**The Problem:**
- Many Israeli artists lack connections to reach diaspora communities
- Global Jewish communities struggle to discover authentic Israeli and Jewish cultural performers

**The Solution:**
- AI-powered matching
- Access to hundreds of Jewish creators
- Tour mapping
- Verified reviews
- Smart recommendations
- Collaborative booking options to reduce costs

#### Team Members

| Name | Hebrew | Role |
|------|--------|------|
| **Avital Indig** | אביטל אינדיג | Award-winning journalist, 2025 B'nai B'rith Journalism Award, M.A. in American Jewish Studies |
| **Michal Wachtel Halamish** | מיכל וכטל חלמיש | Tech industry veteran, CEO of HaK'vutza nonprofit |
| **Einat Kapach** | עינת קפח | Content creator, screenwriter, director; former Head of External Relations at Ma'aleh School of Film and Television |

#### Contact
- Email: contact@kolamba.org

---

## Phase 8: Content & Localization Implementation

### 8.1 Homepage Content Update (2 hours)

**Tasks:**
1. Update hero section with bilingual tagline
2. Add "About Kolamba" section with description
3. Update footer with contact info
4. Add team section (optional)

**Content to implement:**

```typescript
// Hebrew
const heroHebrew = {
  tagline: "כל העולם במה",
  subtitle: "The Jewish Culture Club",
  description: "מקשרים אמנים ישראלים לקהילות יהודיות ברחבי העולם",
  cta: "חפש אמנים"
};

// English
const heroEnglish = {
  tagline: "All the world's a stage",
  subtitle: "The Jewish Culture Club",
  description: "Connecting Israeli artists with Jewish communities worldwide",
  cta: "Search Artists"
};
```

### 8.2 Navigation & UI Labels (1 hour)

| Element | Hebrew | English |
|---------|--------|---------|
| Artists | אמנים | Artists |
| Categories | קטגוריות | Categories |
| Search | חיפוש | Search |
| Login | התחבר | Login |
| Register | הרשמה | Register |
| Book Now | הזמן עכשיו | Book Now |
| Contact | צור קשר | Contact |
| About | אודות | About |

### 8.3 Category Names (1 hour)

| Category | Hebrew | English | Icon |
|----------|--------|---------|------|
| Music | מוזיקה | Music | 🎵 |
| Dance | ריקוד | Dance | 💃 |
| Theater | תיאטרון | Theater | 🎭 |
| Visual Arts | אמנות חזותית | Visual Arts | 🎨 |
| Workshops | סדנאות | Workshops | 🛠️ |
| Lectures | הרצאות | Lectures | 🎤 |
| Film | קולנוע | Film | 🎬 |
| Journalism | עיתונות | Journalism | 📰 |

### 8.4 Artist Profile Labels (1 hour)

| Field | Hebrew | English |
|-------|--------|---------|
| About | אודות | About |
| Categories | תחומי פעילות | Categories |
| Price Range | טווח מחירים | Price Range |
| Location | מיקום | Location |
| Languages | שפות | Languages |
| Contact | יצירת קשר | Contact |
| Website | אתר אינטרנט | Website |
| Book This Artist | הזמן אמן זה | Book This Artist |

### 8.5 Booking Form Labels (1 hour)

| Field | Hebrew | English |
|-------|--------|---------|
| Event Date | תאריך האירוע | Event Date |
| Event Type | סוג האירוע | Event Type |
| Community Name | שם הקהילה | Community Name |
| Contact Person | איש קשר | Contact Person |
| Email | דוא"ל | Email |
| Phone | טלפון | Phone |
| Message | הודעה | Message |
| Budget | תקציב | Budget |
| Submit | שלח בקשה | Submit Request |

### 8.6 Event Types (Bilingual)

| Type | Hebrew | English |
|------|--------|---------|
| Performance | הופעה | Performance |
| Workshop | סדנה | Workshop |
| Lecture | הרצאה | Lecture |
| Exhibition | תערוכה | Exhibition |
| Other | אחר | Other |

---

## Implementation Strategy

### Option A: i18n Library (Recommended)
Use `next-intl` or `react-i18next` for proper internationalization:

```typescript
// messages/he.json
{
  "hero": {
    "tagline": "כל העולם במה",
    "subtitle": "The Jewish Culture Club",
    "description": "מקשרים אמנים ישראלים לקהילות יהודיות ברחבי העולם"
  }
}

// messages/en.json
{
  "hero": {
    "tagline": "All the world's a stage",
    "subtitle": "The Jewish Culture Club",
    "description": "Connecting Israeli artists with Jewish communities worldwide"
  }
}
```

### Option B: Simple Language Context
For faster implementation, use a React context with language toggle:

```typescript
const LanguageContext = createContext<'he' | 'en'>('he');

function useTranslation() {
  const lang = useContext(LanguageContext);
  return (key: string) => translations[lang][key];
}
```

---

## Phase 8 Timeline

| Task | Hours | Dependencies |
|------|-------|--------------|
| 8.1 Homepage Content | 2h | Content extracted ✅ |
| 8.2 UI Labels | 1h | 8.1 |
| 8.3 Category Names | 1h | Database seed update |
| 8.4 Artist Profile | 1h | 8.2 |
| 8.5 Booking Form | 1h | 8.2 |
| 8.6 Language Switcher | 1h | 8.1-8.5 |
| **Total** | **7h** | |

---

## Database Seed Data Updates

### Categories (Bilingual)

```python
categories = [
    {"name_he": "מוזיקה", "name_en": "Music", "slug": "music", "icon": "music"},
    {"name_he": "ריקוד", "name_en": "Dance", "slug": "dance", "icon": "dance"},
    {"name_he": "תיאטרון", "name_en": "Theater", "slug": "theater", "icon": "theater"},
    {"name_he": "אמנות חזותית", "name_en": "Visual Arts", "slug": "visual-arts", "icon": "art"},
    {"name_he": "סדנאות", "name_en": "Workshops", "slug": "workshops", "icon": "workshop"},
    {"name_he": "הרצאות", "name_en": "Lectures", "slug": "lectures", "icon": "lecture"},
    {"name_he": "קולנוע", "name_en": "Film", "slug": "film", "icon": "film"},
    {"name_he": "עיתונות", "name_en": "Journalism", "slug": "journalism", "icon": "journalism"},
]
```

### Sample Artists (For Demo)

```python
sample_artists = [
    {
        "name_he": "דוד לוי",
        "name_en": "David Levi",
        "bio_he": "זמר ומוזיקאי ישראלי עם 15 שנות ניסיון בהופעות בינלאומיות",
        "bio_en": "Israeli singer and musician with 15 years of international performance experience",
        "categories": ["music"],
        "price_range": "moderate",
    },
    # ... more artists
]
```

---

## RTL/LTR Layout Considerations

### CSS Setup
```css
/* Global RTL support */
[dir="rtl"] {
  text-align: right;
}

[dir="ltr"] {
  text-align: left;
}

/* Flexbox direction */
.flex-row {
  flex-direction: row;
}

[dir="rtl"] .flex-row {
  flex-direction: row-reverse;
}
```

### Component Updates
- Header: Swap logo and menu positions
- Search: Align input based on direction
- Cards: Mirror layout for RTL
- Forms: Align labels and inputs

---

## Quality Checklist

- [ ] All UI text is translatable
- [ ] Language switcher works
- [ ] RTL layout displays correctly
- [ ] Hebrew fonts load properly (Heebo/Assistant)
- [ ] English fonts load properly (Inter/Open Sans)
- [ ] Database has bilingual category names
- [ ] API returns content in requested language
- [ ] SEO meta tags are bilingual

---

*Document prepared by Drishti Consulting | January 20, 2026*
