# Smart Tour Algorithm - Analysis & Enhancement Plan

## Current Implementation (Phase 5)

### What Was Built

The current tour algorithm provides **basic geographic clustering** of communities:

```
┌─────────────────────────────────────────────────────────────┐
│                   CURRENT ALGORITHM FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. GET PENDING BOOKINGS                                     │
│     └─ Filter: artist_id, status='pending', no tour_id      │
│                                                              │
│  2. EXTRACT COMMUNITY COORDINATES                            │
│     └─ latitude, longitude for each booking's community      │
│                                                              │
│  3. CALCULATE PAIRWISE DISTANCES (Haversine)                │
│     └─ Great circle distance between all community pairs     │
│                                                              │
│  4. BUILD ADJACENCY GRAPH                                    │
│     └─ Connect communities within max_distance_km (500km)    │
│                                                              │
│  5. FIND CLUSTERS (BFS)                                      │
│     └─ Connected components = tour groups                    │
│                                                              │
│  6. CALCULATE TOUR METRICS                                   │
│     ├─ Region name (most common location)                    │
│     ├─ Date range (earliest to latest + buffer)              │
│     ├─ Total distance (nearest-neighbor route)               │
│     └─ Estimated budget (sum of budgets)                     │
│                                                              │
│  7. RETURN SUGGESTIONS                                       │
│     └─ Sorted by number of bookings (descending)             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Algorithm Components

#### 1. Haversine Distance Formula
```python
def haversine_distance(lat1, lon1, lat2, lon2) -> float:
    R = 6371  # Earth's radius in km
    # ... calculates great-circle distance
    return distance_km
```
**Status:** ✅ Implemented

#### 2. Community Clustering (BFS)
```python
def find_nearby_communities(communities, max_distance_km) -> list[clusters]:
    # Build adjacency graph based on distance
    # BFS to find connected components
    return clusters
```
**Status:** ✅ Implemented

#### 3. Route Distance (Nearest Neighbor)
```python
def calculate_total_distance(communities) -> float:
    # Simple greedy nearest-neighbor TSP approximation
    return total_km
```
**Status:** ✅ Implemented (basic)

---

## What's Missing (vs. Proposal)

### From Original Acceptance Criteria

| Criteria | Current | Gap |
|----------|---------|-----|
| Suggests by proximity | ✅ Yes | - |
| Considers community size | ❌ No | Algorithm ignores audience_size |
| Returns valid tour route | ✅ Yes | - |

### Additional Gaps Identified

1. **No date proximity consideration** - Communities are grouped only by geography, not by requested dates
2. **No scoring/ranking logic** - Tours aren't scored by quality metrics
3. **No map visualization** - Frontend shows list only, no visual map
4. **Basic route optimization** - Nearest-neighbor is O(n²), not optimal

---

## Enhancement Proposal: Smart Tour Algorithm v2

### Option A: Quick Wins (2-4 hours)
*Minimal changes to make algorithm "smarter"*

#### A1. Add Community Size Weighting
```python
def score_tour(cluster) -> float:
    """Score a tour based on multiple factors."""
    score = 0

    # Factor 1: Number of bookings (current behavior)
    score += len(cluster.bookings) * 10

    # Factor 2: Total audience reach (NEW)
    total_audience = sum(c.audience_size or 100 for c in cluster.communities)
    score += total_audience * 0.1

    # Factor 3: Budget potential (NEW)
    total_budget = sum(b.budget or 0 for b in cluster.bookings)
    score += total_budget * 0.01

    return score
```

#### A2. Add Date Proximity Filtering
```python
# Only cluster bookings within same month/quarter
def filter_by_date_range(bookings, date_range_days=30):
    # Group bookings by date windows
    # Return separate clusters for different time periods
```

#### A3. Improve Sorting
```python
# Sort by score instead of just count
suggestions.sort(key=lambda x: score_tour(x), reverse=True)
```

**Effort:** 2-4 hours
**Impact:** Medium - Algorithm is smarter but no visual changes

---

### Option B: Map Visualization (4-6 hours)
*Add visual map of tour routes*

#### B1. Add Map Component (Leaflet/Mapbox)
```typescript
// frontend/src/components/tours/TourMap.tsx
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';

function TourMap({ communities, route }) {
  return (
    <MapContainer center={centerPoint} zoom={6}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {communities.map(c => (
        <Marker position={[c.latitude, c.longitude]} />
      ))}
      <Polyline positions={route} color="blue" />
    </MapContainer>
  );
}
```

#### B2. Add Route to API Response
```python
# Return ordered route, not just communities
class TourSuggestion:
    route: list[dict]  # Ordered list with lat/lng
    route_distance_km: float
```

**Effort:** 4-6 hours
**Impact:** High - Visual representation is compelling for users

---

### Option C: Advanced Algorithm (8-12 hours)
*True "smart" tour optimization*

#### C1. Multi-Factor Scoring System
```python
class TourScorer:
    weights = {
        'geographic_density': 0.25,    # How close are communities
        'audience_reach': 0.25,        # Total potential audience
        'date_alignment': 0.20,        # How well dates match
        'budget_efficiency': 0.15,     # Revenue vs. travel cost
        'route_efficiency': 0.15,      # Travel distance vs. stops
    }

    def score(self, tour: TourSuggestion) -> float:
        scores = {
            'geographic_density': self._density_score(tour),
            'audience_reach': self._audience_score(tour),
            'date_alignment': self._date_score(tour),
            'budget_efficiency': self._budget_score(tour),
            'route_efficiency': self._route_score(tour),
        }
        return sum(scores[k] * self.weights[k] for k in self.weights)
```

#### C2. Traveling Salesman Optimization
```python
from itertools import permutations
# Or use Google OR-Tools for larger sets

def optimize_route(communities: list) -> list:
    """Find optimal ordering of communities to minimize travel."""
    if len(communities) <= 8:
        # Brute force for small sets
        best_route = min(
            permutations(communities),
            key=lambda r: total_distance(r)
        )
    else:
        # Use 2-opt improvement heuristic
        best_route = two_opt_improve(nearest_neighbor_route(communities))
    return best_route
```

#### C3. Date Window Analysis
```python
def analyze_date_windows(bookings) -> list[DateWindow]:
    """Find optimal date windows for touring."""
    # Group by month
    # Identify clusters of dates
    # Suggest best windows
    return [
        DateWindow(start="2026-03-01", end="2026-03-15", booking_count=5),
        DateWindow(start="2026-05-10", end="2026-05-20", booking_count=3),
    ]
```

#### C4. Budget Optimization
```python
def estimate_tour_economics(tour: TourSuggestion) -> dict:
    """Calculate tour financial viability."""
    revenue = sum(b.budget for b in tour.bookings)

    # Estimate costs
    travel_cost = tour.total_distance_km * 0.5  # $0.50/km estimate
    accommodation = tour.nights * 150  # $150/night estimate

    profit_margin = (revenue - travel_cost - accommodation) / revenue

    return {
        'estimated_revenue': revenue,
        'estimated_costs': travel_cost + accommodation,
        'profit_margin': profit_margin,
        'viable': profit_margin > 0.3  # 30% minimum margin
    }
```

**Effort:** 8-12 hours
**Impact:** Very High - True "AI-powered" tour suggestions

---

## Implementation Status

### ✅ Option A - Quick Wins (COMPLETED January 20, 2026)

All Option A enhancements have been implemented:

1. **Community Size Weighting** ✅
   - Added `estimate_audience_size()` function
   - Converts string labels (small/medium/large) to numeric values
   - Integrated into tour scoring

2. **Date Proximity Filtering** ✅
   - Added `filter_bookings_by_date_window()` function
   - Groups bookings within configurable date range (default: 30 days)
   - Separate tour suggestions per date window

3. **Multi-Factor Scoring** ✅
   - Added `calculate_tour_score()` function
   - Five scoring factors:
     - Number of bookings (25%)
     - Audience reach (25%)
     - Budget potential (20%)
     - Route efficiency (15%)
     - Date clustering (15%)

4. **Score-Based Sorting** ✅
   - Tours now sorted by quality score (highest first)
   - API response includes `score` and `total_audience` fields

**This fulfills the original proposal acceptance criteria:**
- ✅ Algorithm suggests communities by proximity
- ✅ Considers community size in ranking
- ✅ Returns valid tour route

### Phase 14 (Future): Options B + C
- Map visualization (B)
- Route optimization with 2-opt (C2)
- Budget/economics analysis (C4)

---

## Revised Phase 14: Advanced Features Definition

Based on the analysis, here's what Phase 14 should include:

### Phase 14: Advanced Features (Detailed)

| Feature | Description | Effort | Priority |
|---------|-------------|--------|----------|
| **14.1 Tour Map View** | Interactive map showing communities and routes | 4h | High |
| **14.2 Multi-Factor Scoring** | Score tours by audience, dates, budget, efficiency | 3h | High |
| **14.3 Route Optimization** | 2-opt or OR-Tools for optimal route | 3h | Medium |
| **14.4 Date Window Analysis** | Suggest best touring periods | 2h | Medium |
| **14.5 Budget Calculator** | Estimate tour economics | 2h | Low |
| **14.6 Favorite Artists** | Users can save favorite artists | 2h | Medium |
| **14.7 Recommendations** | "Artists you might like" algorithm | 4h | Low |
| **14.8 Advanced Search Filters** | Price range, availability, language | 2h | Medium |

**Total Phase 14 Estimate:** 22 hours

---

## Technical Implementation Notes

### Dependencies Needed

```python
# backend/requirements.txt additions
ortools==9.8.3296        # Google OR-Tools for route optimization
folium==0.15.1           # Server-side map generation (optional)
```

```json
// frontend/package.json additions
"react-leaflet": "^4.2.1",
"leaflet": "^1.9.4",
"@types/leaflet": "^1.9.8"
```

### API Changes

```python
# New endpoint
@router.get("/suggestions/analyze")
async def analyze_tour_suggestions(
    artist_id: int,
    include_map: bool = False,
    include_economics: bool = False,
    scoring_weights: dict = None,
):
    """Enhanced tour analysis with optional features."""
```

### Database Changes

```sql
-- Add to communities table
ALTER TABLE communities ADD COLUMN audience_size INTEGER DEFAULT 100;

-- Add to bookings table
ALTER TABLE bookings ADD COLUMN flexibility_days INTEGER DEFAULT 7;
```

---

*Document prepared by Drishti Consulting | January 20, 2026*
