"""Interest matching service - maps community event types to artist categories."""


# Mapping from community event_types to artist category slugs
EVENT_TYPE_TO_CATEGORIES: dict[str, list[str]] = {
    "Concerts": ["music"],
    "Lectures": ["literature", "journalism", "religion-judaism", "inspiration"],
    "Workshops": ["visual-arts", "culinary", "theater"],
    "Children Shows": ["comedy", "theater", "music"],
    "Holiday Events": ["music", "religion-judaism"],
    "Shabbat Programs": ["music", "religion-judaism"],
    "Educational Programs": ["literature", "journalism", "religion-judaism", "inspiration"],
    "Cultural Festivals": ["music", "film-television", "theater", "visual-arts", "comedy"],
    "Family Events": ["music", "comedy", "theater"],
    "Youth Programs": ["music", "comedy", "inspiration"],
}


def get_matched_categories(event_types: list[str]) -> list[str]:
    """Return unique category slugs matched from the given community event types."""
    slugs: set[str] = set()
    for et in event_types:
        if et in EVENT_TYPE_TO_CATEGORIES:
            slugs.update(EVENT_TYPE_TO_CATEGORIES[et])
    return sorted(slugs)


def calculate_interest_score(
    community_event_types: list[str],
    artist_category_slugs: list[str],
) -> float:
    """Calculate overlap ratio between community interests and artist categories.

    Returns a float between 0.0 and 1.0.
    """
    if not community_event_types or not artist_category_slugs:
        return 0.0

    matched = set(get_matched_categories(community_event_types))
    artist_cats = set(artist_category_slugs)

    if not matched:
        return 0.0

    overlap = matched & artist_cats
    return round(len(overlap) / len(matched), 2)
