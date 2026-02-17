/**
 * Tests for the favorites module (lib/favorites.ts)
 */

import {
  getFavoriteLists,
  createList,
  addToList,
  removeFromList,
  isInAnyList,
  toggleFavorite,
} from "@/lib/favorites";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

describe("getFavoriteLists", () => {
  it("returns empty array when no data", () => {
    expect(getFavoriteLists()).toEqual([]);
  });

  it("returns saved lists", () => {
    const data = { lists: [{ id: "abc", name: "My List", artistIds: [1, 2] }] };
    localStorageMock.setItem("kolamba_favorites", JSON.stringify(data));
    const lists = getFavoriteLists();
    expect(lists).toHaveLength(1);
    expect(lists[0].name).toBe("My List");
  });

  it("handles corrupted JSON gracefully", () => {
    localStorageMock.setItem("kolamba_favorites", "not-json");
    expect(getFavoriteLists()).toEqual([]);
  });
});

describe("createList", () => {
  it("creates a new list with a name and empty artistIds", () => {
    const list = createList("Test List");
    expect(list.name).toBe("Test List");
    expect(list.artistIds).toEqual([]);
    expect(list.id).toBeDefined();
  });

  it("persists the list to localStorage", () => {
    createList("Persisted");
    const lists = getFavoriteLists();
    expect(lists).toHaveLength(1);
    expect(lists[0].name).toBe("Persisted");
  });
});

describe("addToList", () => {
  it("adds an artist to an existing list", () => {
    const list = createList("My Artists");
    addToList(list.id, 42);
    const lists = getFavoriteLists();
    expect(lists[0].artistIds).toContain(42);
  });

  it("does not add duplicate artist IDs", () => {
    const list = createList("My Artists");
    addToList(list.id, 42);
    addToList(list.id, 42);
    const lists = getFavoriteLists();
    expect(lists[0].artistIds.filter((id) => id === 42)).toHaveLength(1);
  });

  it("does nothing for non-existent list", () => {
    addToList("nonexistent", 42);
    expect(getFavoriteLists()).toEqual([]);
  });
});

describe("removeFromList", () => {
  it("removes an artist from a list", () => {
    const list = createList("My Artists");
    addToList(list.id, 10);
    addToList(list.id, 20);
    removeFromList(list.id, 10);
    const lists = getFavoriteLists();
    expect(lists[0].artistIds).toEqual([20]);
  });

  it("does nothing if artist not in list", () => {
    const list = createList("My Artists");
    addToList(list.id, 10);
    removeFromList(list.id, 99);
    const lists = getFavoriteLists();
    expect(lists[0].artistIds).toEqual([10]);
  });
});

describe("isInAnyList", () => {
  it("returns false when no lists exist", () => {
    expect(isInAnyList(42)).toBe(false);
  });

  it("returns true when artist is in a list", () => {
    const list = createList("Favs");
    addToList(list.id, 42);
    expect(isInAnyList(42)).toBe(true);
  });

  it("returns false when artist not in any list", () => {
    const list = createList("Favs");
    addToList(list.id, 10);
    expect(isInAnyList(42)).toBe(false);
  });
});

describe("toggleFavorite", () => {
  it("creates a list and adds artist when no lists exist", () => {
    const result = toggleFavorite(42, "Test Artist");
    expect(result).toBe(true);
    expect(isInAnyList(42)).toBe(true);
    const lists = getFavoriteLists();
    expect(lists).toHaveLength(1);
    expect(lists[0].name).toBe("Test Artist");
  });

  it("adds to first list when lists already exist", () => {
    createList("Existing List");
    const result = toggleFavorite(42, "Another Artist");
    expect(result).toBe(true);
    const lists = getFavoriteLists();
    expect(lists[0].artistIds).toContain(42);
  });

  it("removes from all lists when already favorited", () => {
    const list = createList("Favs");
    addToList(list.id, 42);
    const result = toggleFavorite(42, "Test Artist");
    expect(result).toBe(false);
    expect(isInAnyList(42)).toBe(false);
  });

  it("toggle on then off returns to unfavorited state", () => {
    toggleFavorite(42, "Artist A");
    expect(isInAnyList(42)).toBe(true);
    toggleFavorite(42, "Artist A");
    expect(isInAnyList(42)).toBe(false);
  });
});
