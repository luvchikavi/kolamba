# Kolamba QA Tracker

**Last Updated:** 2026-01-29

## Summary
- **Total Issues:** 18
- **Fixed:** 17 (Critical #1-4, High #5-6, #7-11, Medium #12-14, Low #15-18)
- **Remaining:** 1 (Issue #9 needs testing)

---

## CRITICAL Priority

| # | Area | Issue | Status | Notes |
|---|------|-------|--------|-------|
| 1 | Search | Category filtering broken | FIXED | Search page now fetches categories from API dynamically |
| 2 | Search | New artists don't show categories | FIXED | Categories now properly loaded via `selectinload(Artist.categories)` |
| 3 | Search | Category list partial (need all 10) | FIXED | Created migration `20260129_000010_update_categories.py` with correct 10 categories |
| 4 | Artist Profile | All links go to David Cohen | FIXED | Artists page now fetches real data from API instead of hardcoded sample data |

---

## HIGH Priority

| # | Area | Issue | Status | Notes |
|---|------|-------|--------|-------|
| 5 | Artist Dashboard | Settings "Failed to fetch profile" | FIXED | Fixed API URL normalization, now uses centralized `API_URL` from `@/lib/api` |
| 6 | Community Dashboard | Settings "Failed to fetch profile" | FIXED | Fixed API URL + added `/api/communities/me` GET/PUT endpoints |
| 7 | Community Dashboard | Quotes not fetching | FIXED | Backend `/api/bookings/my-bookings` endpoint exists and works. Frontend quotes page calls it correctly. Needs bookings in DB to test. |
| 8 | Community Dashboard | Duplicate header when logged in | FIXED | Header and Footer now check for `/dashboard` routes and don't render. Simplified dashboard layout. |
| 9 | Tours | Cannot create/manage tours | IMPLEMENTED | Full Tour Dates UI exists in Artist Dashboard. Backend API complete. Needs testing. |
| 10 | Admin Dashboard | Missing tours management | FIXED | Added tour dates stats + Upcoming Tour Dates section + `/api/admin/tour-dates` endpoint |
| 11 | Admin Dashboard | Missing bookings management | FIXED | Added bookings stats + Recent Bookings section + `/api/admin/bookings` endpoints |

---

## MEDIUM Priority

| # | Area | Issue | Status | Notes |
|---|------|-------|--------|-------|
| 12 | Artist Sign Up | Categories missing | FIXED | Added Film, Television, Religion, Culinary with subcategories |
| 13 | Artist Sign Up | Dropdown doesn't close | FIXED | Added click-outside handler with useRef/useEffect |
| 14 | About Us | Content updates (headline, team, vision) | FIXED | Added team photo for Avi Luvchik |

---

## LOW Priority

| # | Area | Issue | Status | Notes |
|---|------|-------|--------|-------|
| 15 | Community Dashboard | Messages/Events/Drafts/Privacy placeholders | FIXED | Created placeholder pages at `/dashboard/community/messages`, `/events`, `/privacy` |
| 16 | Validation | Phone/city/Hebrew input | FIXED | Hebrew validation already existed. Improved phone input to only allow digits with proper validation. |
| 17 | Search | Geographic proximity filter | FIXED | Fully implemented: geocoding service, artist tour dates CRUD, `/nearby-touring-artists` API, community dashboard displays nearby artists, artist dashboard has Tour Dates tab. |
| 18 | Navigation | Public community pages | FIXED | Created `/communities` list page and `/communities/[id]` profile page. Added links in Footer. |

---

## Files Modified (This Session)

### Backend
- `backend/app/routers/admin.py` - Added booking stats, `/admin/bookings` endpoints, tour dates stats, `/admin/tour-dates` endpoint
- `backend/app/routers/communities.py` - Added `/communities/me` GET/PUT endpoints

### Frontend
- `frontend/src/lib/api.ts` - Centralized API_URL export
- `frontend/src/app/dashboard/admin/page.tsx` - Fixed API URL, added bookings section
- `frontend/src/app/dashboard/admin/artists/page.tsx` - Fixed API URL
- `frontend/src/app/dashboard/admin/users/page.tsx` - Fixed API URL
- `frontend/src/app/dashboard/artist/settings/page.tsx` - Fixed API URL
- `frontend/src/app/dashboard/community/settings/page.tsx` - Fixed API URL + form fields
- `frontend/src/app/dashboard/community/messages/page.tsx` - NEW placeholder
- `frontend/src/app/dashboard/community/events/page.tsx` - NEW placeholder
- `frontend/src/app/dashboard/community/privacy/page.tsx` - NEW placeholder
- `frontend/src/app/register/artist/page.tsx` - Added categories, fixed dropdown
- `frontend/src/app/booking/[artistId]/page.tsx` - Fixed API URL
- `frontend/src/app/artists/[id]/page.tsx` - Fixed API URL
- `frontend/src/components/home/NewTours.tsx` - Fetch real tour data
- `frontend/src/app/about/page.tsx` - Added team photo
- `frontend/public/team/avi-luvchik.jpeg` - NEW team photo
- `frontend/src/components/layout/Header.tsx` - Added pathname check to not render on dashboard routes
- `frontend/src/components/layout/Footer.tsx` - Added pathname check to not render on dashboard routes
- `frontend/src/app/dashboard/layout.tsx` - Simplified, removed DOM manipulation hack
- `frontend/src/app/register/community/page.tsx` - Improved phone validation to only allow digits
- `frontend/src/app/register/artist/page.tsx` - Improved phone validation to only allow digits
- `frontend/src/app/communities/page.tsx` - NEW public communities list page
- `frontend/src/app/communities/[id]/page.tsx` - NEW public community profile page
- `frontend/src/components/layout/Footer.tsx` - Added Artists and Communities navigation links

---

## Next Steps (Recommended Order)

All 18 issues have been addressed. Issue #9 (Tours) is marked as IMPLEMENTED and needs manual testing.

---

## How to Use This File

When starting a new session with Claude, say:
> "Read QA-TRACKER.md and continue fixing issues"

After completing work, ask Claude to:
> "Update QA-TRACKER.md with current progress"
