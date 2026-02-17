/**
 * Tests for the API client (lib/api.ts)
 */

import { ApiError, API_URL } from "@/lib/api";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

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
  jest.clearAllMocks();
  localStorageMock.clear();
});

describe("API_URL", () => {
  it("appends /api if not present", () => {
    // The module-level constant is already resolved; just check format
    expect(API_URL).toMatch(/\/api$/);
  });
});

describe("ApiError", () => {
  it("has correct name and status", () => {
    const error = new ApiError("Not found", 404);
    expect(error.name).toBe("ApiError");
    expect(error.status).toBe(404);
    expect(error.message).toBe("Not found");
  });

  it("is instanceof Error", () => {
    const error = new ApiError("test", 500);
    expect(error).toBeInstanceOf(Error);
  });
});

describe("api.get", () => {
  it("calls fetch with correct URL and GET method", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [{ id: 1, name: "Music" }],
    });

    const { api } = await import("@/lib/api");
    const result = await api.get("/categories");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/categories"),
      expect.objectContaining({ method: "GET" })
    );
    expect(result).toEqual([{ id: 1, name: "Music" }]);
  });

  it("throws ApiError on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: "Not found" }),
    });

    const { api } = await import("@/lib/api");
    await expect(api.get("/artists/99999")).rejects.toThrow(ApiError);
  });
});

describe("api.post", () => {
  it("sends JSON body with POST method", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 1, status: "pending" }),
    });

    const { api } = await import("@/lib/api");
    const data = { artist_id: 1, location: "NYC" };
    await api.post("/bookings", data);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/bookings"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(data),
      })
    );
  });
});

describe("api.put", () => {
  it("sends JSON body with PUT method", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 1, status: "confirmed" }),
    });

    const { api } = await import("@/lib/api");
    await api.put("/bookings/1", { status: "confirmed" });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/bookings/1"),
      expect.objectContaining({ method: "PUT" })
    );
  });
});

describe("api.delete", () => {
  it("sends DELETE request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: "Deleted" }),
    });

    const { api } = await import("@/lib/api");
    await api.delete("/bookings/1");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/bookings/1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });
});

describe("authentication headers", () => {
  it("includes Authorization header when token is in localStorage", async () => {
    localStorageMock.setItem("access_token", "test-jwt-token");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 1 }),
    });

    const { api } = await import("@/lib/api");
    await api.get("/auth/me");

    const fetchCall = mockFetch.mock.calls[0];
    expect(fetchCall[1].headers).toHaveProperty("Authorization", "Bearer test-jwt-token");
  });
});
