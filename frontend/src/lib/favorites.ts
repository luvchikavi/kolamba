const STORAGE_KEY = "kolamba_favorites";

export interface FavoriteList {
  id: string;
  name: string;
  artistIds: number[];
}

interface FavoritesData {
  lists: FavoriteList[];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function getData(): FavoritesData {
  if (typeof window === "undefined") return { lists: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lists: [] };
    return JSON.parse(raw) as FavoritesData;
  } catch {
    return { lists: [] };
  }
}

function saveData(data: FavoritesData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getFavoriteLists(): FavoriteList[] {
  return getData().lists;
}

export function createList(name: string): FavoriteList {
  const data = getData();
  const list: FavoriteList = { id: generateId(), name, artistIds: [] };
  data.lists.push(list);
  saveData(data);
  return list;
}

export function addToList(listId: string, artistId: number): void {
  const data = getData();
  const list = data.lists.find((l) => l.id === listId);
  if (list && !list.artistIds.includes(artistId)) {
    list.artistIds.push(artistId);
    saveData(data);
  }
}

export function removeFromList(listId: string, artistId: number): void {
  const data = getData();
  const list = data.lists.find((l) => l.id === listId);
  if (list) {
    list.artistIds = list.artistIds.filter((id) => id !== artistId);
    saveData(data);
  }
}

export function isInAnyList(artistId: number): boolean {
  const data = getData();
  return data.lists.some((l) => l.artistIds.includes(artistId));
}

export function toggleFavorite(artistId: number, artistName: string): boolean {
  const data = getData();

  // If already favorited, remove from all lists
  if (data.lists.some((l) => l.artistIds.includes(artistId))) {
    for (const list of data.lists) {
      list.artistIds = list.artistIds.filter((id) => id !== artistId);
    }
    saveData(data);
    return false; // now unfavorited
  }

  // If no lists exist, create one named after the artist
  if (data.lists.length === 0) {
    const list: FavoriteList = {
      id: generateId(),
      name: artistName,
      artistIds: [artistId],
    };
    data.lists.push(list);
  } else {
    // Add to the first list
    data.lists[0].artistIds.push(artistId);
  }
  saveData(data);
  return true; // now favorited
}
