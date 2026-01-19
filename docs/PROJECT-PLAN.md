# Kolamba - Project Working Plan

**Project:** פלטפורמת Marketplace לסיורי אמנים בקהילות יהודיות
**Proposal:** PP-KOL-002-26 v2.0
**Duration:** 4 weeks (20 working days)
**Total Hours:** 40 hours
**Start Date:** TBD (upon contract signing)

---

## 1. Project Timeline Overview

```
Week 1          Week 2          Week 3          Week 4
|---------------|---------------|---------------|---------------|
Jan 20-24       Jan 27-31       Feb 3-7        Feb 10-14
```

---

## 2. Gantt Chart

```
TASK                                    W1                  W2                  W3                  W4
                                   M  T  W  T  F      M  T  W  T  F      M  T  W  T  F      M  T  W  T  F
                                   20 21 22 23 24     27 28 29 30 31     3  4  5  6  7      10 11 12 13 14
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

PHASE 1: FOUNDATION & DESIGN (6h)
├─ 1.1 Project Setup               ██ ██                                                              (2h)
├─ 1.2 Database Design                ██ ██                                                           (2h)
└─ 1.3 UX Wireframes                     ██ ██                                                        (2h)
                                            ◆ M1: Design Approved

PHASE 2: HOMEPAGE & SEARCH (8h)
├─ 2.1 Backend: API Setup                    ██ ██                                                    (2h)
├─ 2.2 Backend: Search API                         ██ ██                                              (2h)
├─ 2.3 Frontend: Homepage                                ██ ██                                        (2h)
└─ 2.4 Frontend: Search UI                                     ██ ██                                  (2h)
                                                                    ◆ M2: Homepage Live

PHASE 3: ARTIST PROFILES (6h)
├─ 3.1 Backend: Artist API                                           ██ ██                            (2h)
├─ 3.2 Frontend: Artist List                                               ██ ██                      (2h)
└─ 3.3 Frontend: Artist Profile                                                  ██ ██                (2h)
                                                                                      ◆ M3: Artists Ready

PHASE 4: COMMUNITY & BOOKING (6h)
├─ 4.1 Backend: Community API                                                         ██ ██           (2h)
├─ 4.2 Frontend: Community Reg                                                              ██        (1h)
├─ 4.3 Backend: Booking API                                                                 ██ ██     (2h)
└─ 4.4 Frontend: Booking Form                                                                   ██    (1h)
                                                                                                 ◆ M4: Booking Ready

PHASE 5: TOUR LOGIC (8h)
├─ 5.1 Tour Algorithm Design                                                   ██ ██                  (2h)
├─ 5.2 Backend: Tour API                                                             ██ ██ ██         (3h)
└─ 5.3 Frontend: Tour Display                                                              ██ ██ ██   (3h)
                                                                                                    ◆ M5: Tour Logic Done

PHASE 6: AUTH & DASHBOARD (4h)
├─ 6.1 Backend: Auth API                              ██ ██                                           (2h)
└─ 6.2 Frontend: Auth + Dashboard                                         ██ ██                       (2h)

PHASE 7: QA & DEPLOYMENT (2h)
├─ 7.1 Testing & Bug Fixes                                                                      ██    (1h)
└─ 7.2 Production Deploy                                                                           ██ (1h)
                                                                                                    ◆ M6: GO LIVE

═══════════════════════════════════════════════════════════════════════════════════════════════════════════

LEGEND:
██ = Work block (each block ≈ 1 hour)
◆  = Milestone
```

---

## 3. Work Breakdown Structure (WBS)

### Phase 1: Foundation & Design (6 hours)

| ID | Task | Hours | Dependencies | Deliverables |
|----|------|-------|--------------|--------------|
| 1.1 | Project Setup | 2h | - | Git repo, CI/CD, dev environment |
| 1.2 | Database Design | 2h | 1.1 | Schema, migrations, seed data |
| 1.3 | UX Wireframes | 2h | - | Wireframes for all MVP pages |

**Milestone 1:** Design Approved ✓

---

### Phase 2: Homepage & Search (8 hours)

| ID | Task | Hours | Dependencies | Deliverables |
|----|------|-------|--------------|--------------|
| 2.1 | Backend: API Setup | 2h | 1.1, 1.2 | FastAPI structure, models, health check |
| 2.2 | Backend: Search API | 2h | 2.1 | `/api/search/artists` with filters |
| 2.3 | Frontend: Homepage | 2h | 1.3 | Hero, featured artists, categories |
| 2.4 | Frontend: Search UI | 2h | 2.2, 2.3 | Search bar, filters, results grid |

**Milestone 2:** Homepage Live ✓

---

### Phase 3: Artist Profiles (6 hours)

| ID | Task | Hours | Dependencies | Deliverables |
|----|------|-------|--------------|--------------|
| 3.1 | Backend: Artist API | 2h | 2.1 | CRUD for artists, categories |
| 3.2 | Frontend: Artist List | 2h | 3.1 | `/artists` page with grid |
| 3.3 | Frontend: Artist Profile | 2h | 3.1 | `/artists/[id]` detail page |

**Milestone 3:** Artists Ready ✓

---

### Phase 4: Community & Booking (6 hours)

| ID | Task | Hours | Dependencies | Deliverables |
|----|------|-------|--------------|--------------|
| 4.1 | Backend: Community API | 2h | 2.1 | CRUD for communities |
| 4.2 | Frontend: Community Reg | 1h | 4.1 | Registration form |
| 4.3 | Backend: Booking API | 2h | 3.1, 4.1 | Create/manage bookings |
| 4.4 | Frontend: Booking Form | 1h | 4.3 | Booking request UI |

**Milestone 4:** Booking Ready ✓

---

### Phase 5: Tour Logic (8 hours)

| ID | Task | Hours | Dependencies | Deliverables |
|----|------|-------|--------------|--------------|
| 5.1 | Tour Algorithm Design | 2h | 1.2 | Algorithm spec, scoring logic |
| 5.2 | Backend: Tour API | 3h | 5.1, 4.1 | `/api/tours/suggest` endpoint |
| 5.3 | Frontend: Tour Display | 3h | 5.2 | Tour suggestions UI, map view |

**Milestone 5:** Tour Logic Done ✓

---

### Phase 6: Auth & Dashboard (4 hours)

| ID | Task | Hours | Dependencies | Deliverables |
|----|------|-------|--------------|--------------|
| 6.1 | Backend: Auth API | 2h | 2.1 | JWT auth, login/register |
| 6.2 | Frontend: Auth + Dashboard | 2h | 6.1 | Login, register, basic dashboard |

---

### Phase 7: QA & Deployment (2 hours)

| ID | Task | Hours | Dependencies | Deliverables |
|----|------|-------|--------------|--------------|
| 7.1 | Testing & Bug Fixes | 1h | All | QA pass, bug fixes |
| 7.2 | Production Deploy | 1h | 7.1 | Live on production |

**Milestone 6:** GO LIVE 🚀

---

## 4. Detailed Daily Schedule

### Week 1: Foundation & Core

| Day | Date | Tasks | Hours | Focus |
|-----|------|-------|-------|-------|
| Mon | Day 1 | 1.1 Project Setup | 2h | Git, Railway, CI/CD |
| Tue | Day 2 | 1.2 Database Design | 2h | Schema, migrations |
| Wed | Day 3 | 1.3 UX Wireframes | 2h | All page wireframes |
| Thu | Day 4 | 2.1 Backend API Setup | 2h | FastAPI structure |
| Fri | Day 5 | 2.2 Search API | 2h | Search endpoint |

**Week 1 Total: 10 hours**

---

### Week 2: Homepage & Artists

| Day | Date | Tasks | Hours | Focus |
|-----|------|-------|-------|-------|
| Mon | Day 6 | 2.3 Homepage Frontend | 2h | Homepage UI |
| Tue | Day 7 | 2.4 Search UI | 2h | Search components |
| Wed | Day 8 | 3.1 Artist API | 2h | Artist CRUD |
| Thu | Day 9 | 3.2 Artist List | 2h | Artist grid page |
| Fri | Day 10 | 3.3 Artist Profile | 2h | Artist detail page |

**Week 2 Total: 10 hours**

---

### Week 3: Communities, Booking & Tours

| Day | Date | Tasks | Hours | Focus |
|-----|------|-------|-------|-------|
| Mon | Day 11 | 4.1 Community API | 2h | Community CRUD |
| Tue | Day 12 | 4.2 Community Reg + 5.1 Tour Design | 1h + 1h | Registration + Algorithm |
| Wed | Day 13 | 5.1 Tour Design (cont) + 4.3 Booking API | 1h + 1h | Algorithm + Booking |
| Thu | Day 14 | 4.3 Booking API (cont) + 4.4 Booking Form | 1h + 1h | Booking flow |
| Fri | Day 15 | 5.2 Tour API | 2h | Tour endpoint |

**Week 3 Total: 10 hours**

---

### Week 4: Auth, Polish & Launch

| Day | Date | Tasks | Hours | Focus |
|-----|------|-------|-------|-------|
| Mon | Day 16 | 5.2 Tour API (cont) + 5.3 Tour UI | 1h + 1h | Tour features |
| Tue | Day 17 | 5.3 Tour UI (cont) + 6.1 Auth API | 2h | Tour + Auth |
| Wed | Day 18 | 6.1 Auth (cont) + 6.2 Dashboard | 2h | Auth + Dashboard |
| Thu | Day 19 | 7.1 Testing & Bug Fixes | 2h | QA |
| Fri | Day 20 | 7.2 Production Deploy | 1h | Launch! |

**Week 4 Total: 10 hours**

---

## 5. Milestones & Deliverables

| # | Milestone | Target Date | Deliverables | Acceptance Criteria |
|---|-----------|-------------|--------------|---------------------|
| M1 | Design Approved | End of Day 3 | Wireframes, DB schema | Client sign-off on UX |
| M2 | Homepage Live | End of Day 7 | Working homepage with search | Search returns results |
| M3 | Artists Ready | End of Day 10 | Artist profiles complete | Can view all artist details |
| M4 | Booking Ready | End of Day 14 | Booking flow works | Can submit booking request |
| M5 | Tour Logic Done | End of Day 17 | Tour suggestions working | Algorithm returns valid tours |
| M6 | GO LIVE | Day 20 | Production deployment | Site live on domain |

---

## 6. Dependencies Graph

```
                    ┌─────────┐
                    │ 1.1     │ Project Setup
                    │ Setup   │
                    └────┬────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
      ┌─────────┐  ┌─────────┐  ┌─────────┐
      │ 1.2     │  │ 1.3     │  │ 6.1     │
      │ DB      │  │ UX      │  │ Auth    │
      └────┬────┘  └────┬────┘  └────┬────┘
           │            │            │
           ▼            │            ▼
      ┌─────────┐       │       ┌─────────┐
      │ 2.1     │       │       │ 6.2     │
      │ API     │◄──────┘       │ Dash    │
      └────┬────┘               └─────────┘
           │
     ┌─────┴─────┬─────────────┐
     │           │             │
     ▼           ▼             ▼
┌─────────┐ ┌─────────┐  ┌─────────┐
│ 2.2     │ │ 3.1     │  │ 4.1     │
│ Search  │ │ Artist  │  │ Commun  │
└────┬────┘ └────┬────┘  └────┬────┘
     │           │            │
     ▼           │            │
┌─────────┐      │            │
│ 2.3-2.4 │      │            │
│ Home UI │      │            │
└─────────┘      │            │
                 │            │
           ┌─────┴────┐       │
           │          │       │
           ▼          ▼       │
      ┌─────────┐ ┌─────────┐ │
      │ 3.2-3.3 │ │ 4.3     │◄┘
      │ Art UI  │ │ Booking │
      └─────────┘ └────┬────┘
                       │
                       ▼
                  ┌─────────┐
                  │ 4.4     │
                  │ Book UI │
                  └─────────┘

                  ┌─────────┐
                  │ 5.1     │ Tour Design
                  │ Design  │
                  └────┬────┘
                       │
                       ▼
                  ┌─────────┐
                  │ 5.2     │
                  │ Tour API│
                  └────┬────┘
                       │
                       ▼
                  ┌─────────┐
                  │ 5.3     │
                  │ Tour UI │
                  └─────────┘
                       │
                       ▼
                  ┌─────────┐
                  │ 7.1-7.2 │
                  │ QA+LIVE │
                  └─────────┘
```

---

## 7. Resource Allocation

### Developer Time Distribution

```
Phase                          Hours    % of Total
═══════════════════════════════════════════════════
Phase 1: Foundation & Design     6h       15%  ████
Phase 2: Homepage & Search       8h       20%  █████
Phase 3: Artist Profiles         6h       15%  ████
Phase 4: Community & Booking     6h       15%  ████
Phase 5: Tour Logic              8h       20%  █████
Phase 6: Auth & Dashboard        4h       10%  ███
Phase 7: QA & Deployment         2h        5%  ██
═══════════════════════════════════════════════════
TOTAL                           40h      100%
```

### Technology Distribution

```
Backend (Python/FastAPI)        18h       45%  ███████████
Frontend (Next.js)              16h       40%  ██████████
DevOps/Infrastructure            4h       10%  ███
Design/UX                        2h        5%  ██
═══════════════════════════════════════════════════
TOTAL                           40h      100%
```

---

## 8. Risk Management

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Client feedback delays | Medium | High | Set clear review deadlines (24h) |
| Scope creep | High | High | Strict adherence to MVP scope |
| Technical blockers | Low | Medium | Use proven tech stack |
| Integration issues | Medium | Medium | API-first development |
| Deployment issues | Low | High | Test deployment early (Day 1) |

### Contingency Buffer
- Built-in: 2 hours in QA phase for unexpected issues
- If major delays: Reduce tour UI complexity first

---

## 9. Communication Plan

### Check-in Schedule

| Frequency | Type | Purpose |
|-----------|------|---------|
| End of Week 1 | Video call | Review wireframes, approve design |
| End of Week 2 | Video call | Demo homepage & artists |
| End of Week 3 | Video call | Demo booking & tour logic |
| End of Week 4 | Video call | Final review, go-live |

### Daily Updates
- Brief status update via WhatsApp/Email
- Blockers reported immediately

### Deliverable Reviews
- Client has 24 hours to review and provide feedback
- Feedback incorporated in next work session

---

## 10. Acceptance Criteria

### Homepage
- [ ] Displays Kolamba vision/hero section
- [ ] Shows featured artists (if any exist)
- [ ] Category navigation works
- [ ] Search bar functional
- [ ] Responsive on mobile

### Artist Features
- [ ] Can view artist listing with grid
- [ ] Filters work (category, price, language)
- [ ] Artist profile shows all info
- [ ] Contact info visible

### Community Features
- [ ] Can register as community
- [ ] Profile shows location, audience size

### Booking
- [ ] Can submit booking request
- [ ] Artist receives notification
- [ ] Booking status tracked

### Tour Logic
- [ ] Algorithm suggests communities by proximity
- [ ] Considers community size in ranking
- [ ] Returns valid tour route

### Technical
- [ ] Site loads in < 3 seconds
- [ ] Works in Chrome, Safari, Firefox
- [ ] Hebrew & English supported
- [ ] SSL certificate active
- [ ] No critical security vulnerabilities

---

## 11. Handover Checklist

At project completion, client receives:

### Code & Access
- [ ] Full source code (Git repository)
- [ ] All environment variables documented
- [ ] Railway dashboard access
- [ ] Database access credentials
- [ ] Domain/DNS access

### Documentation
- [ ] This project plan
- [ ] Architecture document
- [ ] API documentation (auto-generated)
- [ ] Deployment guide

### Support
- [ ] 30 days bug fix support
- [ ] Knowledge transfer session (1 hour)

---

## Appendix: Payment Schedule

| Milestone | Amount | Due |
|-----------|--------|-----|
| Contract signing | ₪6,000 + VAT (50%) | Day 0 |
| Project delivery | ₪6,000 + VAT (50%) | Day 20 |
| **Total** | **₪12,000 + VAT** | |

---

**Document Version:** 1.0
**Last Updated:** 2026-01-19
**Prepared by:** Drishti Consulting
