"""Tests for the tour suggestion / grouping algorithm."""

from datetime import date, timedelta

import pytest

from app.services.tour_grouping import (
    haversine_distance,
    find_nearby_communities,
    determine_region_name,
    estimate_audience_size,
    calculate_tour_score,
    calculate_tour_dates,
    calculate_total_distance,
    filter_bookings_by_date_window,
)


# ── haversine_distance ──────────────────────────────────────

class TestHaversineDistance:
    def test_same_point_returns_zero(self):
        assert haversine_distance(40.0, -74.0, 40.0, -74.0) == 0.0

    def test_known_distance_nyc_to_la(self):
        # NYC (40.7128, -74.0060) to LA (34.0522, -118.2437) ≈ 3940 km
        dist = haversine_distance(40.7128, -74.0060, 34.0522, -118.2437)
        assert 3900 < dist < 4000

    def test_short_distance(self):
        # Manhattan to Brooklyn ≈ ~10 km
        dist = haversine_distance(40.7580, -73.9855, 40.6782, -73.9442)
        assert 5 < dist < 15

    def test_tel_aviv_to_jerusalem(self):
        # Tel Aviv (32.0853, 34.7818) to Jerusalem (31.7683, 35.2137) ≈ 54 km
        dist = haversine_distance(32.0853, 34.7818, 31.7683, 35.2137)
        assert 50 < dist < 60


# ── find_nearby_communities ──────────────────────────────────

class TestFindNearbyCommunities:
    def test_empty_list(self):
        assert find_nearby_communities([], 500) == []

    def test_single_community(self):
        communities = [{"latitude": 40.0, "longitude": -74.0}]
        clusters = find_nearby_communities(communities, 500)
        assert len(clusters) == 1
        assert clusters[0] == [0]

    def test_two_close_communities_one_cluster(self):
        communities = [
            {"latitude": 40.7128, "longitude": -74.0060},  # NYC
            {"latitude": 40.6782, "longitude": -73.9442},  # Brooklyn
        ]
        clusters = find_nearby_communities(communities, 50)
        assert len(clusters) == 1
        assert sorted(clusters[0]) == [0, 1]

    def test_two_far_communities_two_clusters(self):
        communities = [
            {"latitude": 40.7128, "longitude": -74.0060},  # NYC
            {"latitude": 34.0522, "longitude": -118.2437},  # LA
        ]
        clusters = find_nearby_communities(communities, 500)
        assert len(clusters) == 2

    def test_three_communities_chain_cluster(self):
        # A-B close, B-C close, A-C far → all in one cluster via B
        communities = [
            {"latitude": 40.0, "longitude": -74.0},
            {"latitude": 40.5, "longitude": -74.0},  # ~55km from A
            {"latitude": 41.0, "longitude": -74.0},  # ~55km from B, ~110km from A
        ]
        clusters = find_nearby_communities(communities, 60)
        assert len(clusters) == 1

    def test_communities_without_coords_skipped(self):
        communities = [
            {"latitude": 40.0, "longitude": -74.0},
            {"latitude": None, "longitude": None},
            {"latitude": 40.1, "longitude": -74.0},
        ]
        clusters = find_nearby_communities(communities, 500)
        assert len(clusters) == 1
        assert 1 not in clusters[0]  # The None-coord community is excluded


# ── determine_region_name ────────────────────────────────────

class TestDetermineRegionName:
    def test_empty_list(self):
        assert determine_region_name([]) == "Unknown Region"

    def test_single_community(self):
        result = determine_region_name([{"location": "New York, NY, USA"}])
        assert "NY" in result

    def test_most_common_region_wins(self):
        communities = [
            {"location": "Brooklyn, NY, USA"},
            {"location": "Manhattan, NY, USA"},
            {"location": "Los Angeles, CA, USA"},
        ]
        result = determine_region_name(communities)
        assert "NY" in result or "USA" in result

    def test_no_location_field(self):
        communities = [{"name": "Test"}]
        assert determine_region_name(communities) == "Unknown Region"


# ── estimate_audience_size ───────────────────────────────────

class TestEstimateAudienceSize:
    def test_none_returns_default(self):
        assert estimate_audience_size(None) == 100

    def test_string_small(self):
        assert estimate_audience_size("small") == 50

    def test_string_medium(self):
        assert estimate_audience_size("medium") == 150

    def test_string_large(self):
        assert estimate_audience_size("large") == 300

    def test_string_very_large(self):
        assert estimate_audience_size("very_large") == 500

    def test_string_xl(self):
        assert estimate_audience_size("xl") == 500

    def test_int_passthrough(self):
        assert estimate_audience_size(250) == 250

    def test_unknown_string_returns_default(self):
        assert estimate_audience_size("gigantic") == 100

    def test_case_insensitive(self):
        assert estimate_audience_size("SMALL") == 50
        assert estimate_audience_size("Large") == 300


# ── calculate_tour_score ─────────────────────────────────────

class TestCalculateTourScore:
    def test_basic_score_positive(self):
        communities = [
            {"audience_size": "medium"},
            {"audience_size": "large"},
        ]
        bookings = [
            {"budget": 1000, "requested_date": date.today()},
            {"budget": 1500, "requested_date": date.today() + timedelta(days=3)},
        ]
        score = calculate_tour_score(communities, bookings, total_distance=100)
        assert score > 0

    def test_more_bookings_higher_score(self):
        communities_2 = [{"audience_size": 100}] * 2
        communities_4 = [{"audience_size": 100}] * 4
        today = date.today()
        bookings_2 = [{"budget": 500, "requested_date": today}] * 2
        bookings_4 = [{"budget": 500, "requested_date": today}] * 4
        score_2 = calculate_tour_score(communities_2, bookings_2, 100)
        score_4 = calculate_tour_score(communities_4, bookings_4, 100)
        assert score_4 > score_2

    def test_higher_budget_higher_score(self):
        communities = [{"audience_size": 100}] * 2
        today = date.today()
        low_budget = [{"budget": 100, "requested_date": today}] * 2
        high_budget = [{"budget": 5000, "requested_date": today}] * 2
        score_low = calculate_tour_score(communities, low_budget, 100)
        score_high = calculate_tour_score(communities, high_budget, 100)
        assert score_high > score_low

    def test_shorter_route_higher_efficiency_score(self):
        communities = [{"audience_size": 100}] * 3
        today = date.today()
        bookings = [{"budget": 500, "requested_date": today}] * 3
        score_short = calculate_tour_score(communities, bookings, total_distance=50)
        score_long = calculate_tour_score(communities, bookings, total_distance=1000)
        assert score_short > score_long

    def test_tighter_dates_higher_score(self):
        communities = [{"audience_size": 100}] * 2
        today = date.today()
        tight = [
            {"budget": 500, "requested_date": today},
            {"budget": 500, "requested_date": today + timedelta(days=2)},
        ]
        spread = [
            {"budget": 500, "requested_date": today},
            {"budget": 500, "requested_date": today + timedelta(days=25)},
        ]
        score_tight = calculate_tour_score(communities, tight, 100)
        score_spread = calculate_tour_score(communities, spread, 100)
        assert score_tight > score_spread

    def test_single_community_gets_middle_efficiency(self):
        communities = [{"audience_size": 100}]
        bookings = [{"budget": 500, "requested_date": date.today()}]
        score = calculate_tour_score(communities, bookings, total_distance=0)
        assert score > 0

    def test_zero_budget_no_crash(self):
        communities = [{"audience_size": 100}] * 2
        bookings = [{"budget": 0}, {"budget": None}]
        score = calculate_tour_score(communities, bookings, 100)
        assert score >= 0


# ── calculate_tour_dates ─────────────────────────────────────

class TestCalculateTourDates:
    def test_no_bookings(self):
        start, end = calculate_tour_dates([])
        assert start is None
        assert end is None

    def test_no_dates_in_bookings(self):
        start, end = calculate_tour_dates([{"requested_date": None}])
        assert start is None
        assert end is None

    def test_single_date(self):
        today = date.today()
        start, end = calculate_tour_dates([{"requested_date": today}])
        assert start == today - timedelta(days=2)
        assert end == today + timedelta(days=2)

    def test_date_range_with_buffer(self):
        d1 = date(2026, 6, 10)
        d2 = date(2026, 6, 15)
        start, end = calculate_tour_dates([
            {"requested_date": d1},
            {"requested_date": d2},
        ])
        assert start == d1 - timedelta(days=2)
        assert end == d2 + timedelta(days=2)

    def test_custom_buffer(self):
        today = date.today()
        start, end = calculate_tour_dates([{"requested_date": today}], buffer_days=5)
        assert start == today - timedelta(days=5)
        assert end == today + timedelta(days=5)


# ── calculate_total_distance ─────────────────────────────────

class TestCalculateTotalDistance:
    def test_empty_list(self):
        assert calculate_total_distance([]) == 0.0

    def test_single_community(self):
        assert calculate_total_distance([{"latitude": 40.0, "longitude": -74.0}]) == 0.0

    def test_two_communities(self):
        communities = [
            {"latitude": 40.7128, "longitude": -74.0060},  # NYC
            {"latitude": 40.6782, "longitude": -73.9442},  # Brooklyn
        ]
        dist = calculate_total_distance(communities)
        assert 3 < dist < 15  # ~5km

    def test_communities_without_coords_ignored(self):
        communities = [
            {"latitude": 40.0, "longitude": -74.0},
            {"latitude": None, "longitude": None},
            {"latitude": 41.0, "longitude": -74.0},
        ]
        dist = calculate_total_distance(communities)
        assert dist > 0  # Only the two valid ones counted

    def test_distance_is_non_negative(self):
        communities = [
            {"latitude": 40.0, "longitude": -74.0},
            {"latitude": 41.0, "longitude": -75.0},
            {"latitude": 42.0, "longitude": -73.0},
        ]
        assert calculate_total_distance(communities) >= 0


# ── filter_bookings_by_date_window ───────────────────────────

class _FakeBooking:
    """Minimal booking-like object for testing the filter."""
    def __init__(self, requested_date):
        self.requested_date = requested_date


class TestFilterBookingsByDateWindow:
    def test_empty_list(self):
        assert filter_bookings_by_date_window([]) == []

    def test_all_same_date_one_group(self):
        today = date.today()
        bookings = [_FakeBooking(today), _FakeBooking(today), _FakeBooking(today)]
        groups = filter_bookings_by_date_window(bookings, date_range_days=30)
        assert len(groups) == 1
        assert len(groups[0]) == 3

    def test_two_groups_split_by_gap(self):
        d1 = date(2026, 3, 1)
        d2 = date(2026, 3, 5)
        d3 = date(2026, 5, 1)  # 61 days after d1
        d4 = date(2026, 5, 3)
        bookings = [_FakeBooking(d1), _FakeBooking(d2), _FakeBooking(d3), _FakeBooking(d4)]
        groups = filter_bookings_by_date_window(bookings, date_range_days=30)
        assert len(groups) == 2

    def test_undated_bookings_added_to_all_groups(self):
        d1 = date(2026, 3, 1)
        d2 = date(2026, 6, 1)
        undated = _FakeBooking(None)
        bookings = [_FakeBooking(d1), _FakeBooking(d2), undated]
        groups = filter_bookings_by_date_window(bookings, date_range_days=30)
        assert len(groups) == 2
        # Undated booking should be in both groups
        for group in groups:
            assert undated in group

    def test_all_undated_returns_one_group(self):
        bookings = [_FakeBooking(None), _FakeBooking(None)]
        groups = filter_bookings_by_date_window(bookings, date_range_days=30)
        assert len(groups) == 1
        assert len(groups[0]) == 2
