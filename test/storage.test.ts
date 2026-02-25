import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  addSnippet,
  getAll,
  getByTitle,
  deleteById,
  readStore,
  writeStore,
} from "../src/utils/storage.js";

// Import mocked modules
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

// Mock the fs module
vi.mock("fs", () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

// Mock the os module for homedir
vi.mock("os", () => ({
  homedir: vi.fn(() => "/mocked/home"),
}));

// Mock path to avoid issues with ESM
vi.mock("path", () => ({
  join: (...args: string[]) => args.join("/"),
}));

// Type for mocked store
interface MockStore {
  snippets: Array<{
    id: number;
    title: string;
    code: string;
    tags: string[];
    createdAt: string;
  }>;
  lastId: number;
}

describe("Storage Utility", () => {
  let mockStore: MockStore;

  beforeEach(() => {
    // Reset mock store before each test
    mockStore = {
      snippets: [],
      lastId: 0,
    };

    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(mkdirSync).mockReturnValue(undefined);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockStore));
    vi.mocked(writeFileSync).mockReturnValue(undefined);
  });

  describe("addSnippet", () => {
    it("should add a snippet with generated id and timestamp", () => {
      const result = addSnippet({
        title: "Test Snippet",
        code: 'console.log("hello")',
        tags: ["js", "test"],
      });

      // Verify id is generated (should be lastId + 1 = 1)
      expect(result.id).toBe(1);

      // Verify timestamp is in YYYY-MM-DD format
      expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Verify the snippet object has all expected properties
      expect(result).toEqual({
        id: 1,
        title: "Test Snippet",
        code: 'console.log("hello")',
        tags: ["js", "test"],
        createdAt: expect.any(String),
      });

      // Verify writeStore was called
      expect(writeFileSync).toHaveBeenCalled();
    });

    it("should generate sequential IDs", () => {
      // Mock readFileSync to return updated store after each addSnippet call
      let callCount = 0;
      vi.mocked(readFileSync).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return JSON.stringify({ snippets: [], lastId: 0 });
        } else {
          return JSON.stringify({
            snippets: [
              {
                id: 1,
                title: "First Snippet",
                code: "code1",
                tags: [],
                createdAt: "2024-01-01",
              },
            ],
            lastId: 1,
          });
        }
      });

      const snippet1 = addSnippet({
        title: "First Snippet",
        code: "code1",
        tags: [],
      });

      const snippet2 = addSnippet({
        title: "Second Snippet",
        code: "code2",
        tags: [],
      });

      expect(snippet1.id).toBe(1);
      expect(snippet2.id).toBe(2);
    });

    it("should use Omit type - id and createdAt should not be in input", () => {
      // This test verifies the Omit logic by ensuring the function
      // only accepts title, code, and tags (not id or createdAt)
      const input = {
        title: "Test",
        code: "test code",
        tags: ["tag1"],
      };

      // TypeScript should only allow these three properties
      // If Omit is working correctly, we cannot pass id or createdAt
      const result = addSnippet(input);

      // Verify the result has id and createdAt added by the function
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.title).toBe(input.title);
      expect(result.code).toBe(input.code);
      expect(result.tags).toEqual(input.tags);
    });

    it("should handle empty tags array", () => {
      const result = addSnippet({
        title: "No Tags",
        code: "some code",
        tags: [],
      });

      expect(result.tags).toEqual([]);
    });

    it("should write to the store file", () => {
      addSnippet({
        title: "Test",
        code: "code",
        tags: [],
      });

      expect(writeFileSync).toHaveBeenCalledWith(
        "/mocked/home/.snipit/snippets.json",
        expect.any(String),
        "utf-8",
      );
    });
  });

  describe("getAll", () => {
    it("should return all snippets from store", () => {
      mockStore.snippets = [
        {
          id: 1,
          title: "Snippet 1",
          code: "code1",
          tags: [],
          createdAt: "2024-01-01",
        },
        {
          id: 2,
          title: "Snippet 2",
          code: "code2",
          tags: ["js"],
          createdAt: "2024-01-02",
        },
      ];
      mockStore.lastId = 2;
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockStore));

      const result = getAll();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Snippet 1");
      expect(result[1].title).toBe("Snippet 2");
    });

    it("should return empty array when no snippets exist", () => {
      mockStore.snippets = [];
      mockStore.lastId = 0;
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockStore));

      const result = getAll();

      expect(result).toEqual([]);
    });
  });

  describe("getByTitle", () => {
    it("should find snippet by title (case insensitive)", () => {
      mockStore.snippets = [
        {
          id: 1,
          title: "JavaScript Code",
          code: "console.log",
          tags: [],
          createdAt: "2024-01-01",
        },
      ];
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockStore));

      const result = getByTitle("javascript code");

      expect(result).toBeDefined();
      expect(result?.title).toBe("JavaScript Code");
    });

    it("should return undefined for non-existent title", () => {
      mockStore.snippets = [
        {
          id: 1,
          title: "Existing",
          code: "code",
          tags: [],
          createdAt: "2024-01-01",
        },
      ];
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockStore));

      const result = getByTitle("NonExistent");

      expect(result).toBeUndefined();
    });
  });

  describe("deleteById", () => {
    it("should delete snippet by id and return true", () => {
      mockStore.snippets = [
        {
          id: 1,
          title: "To Delete",
          code: "code",
          tags: [],
          createdAt: "2024-01-01",
        },
        {
          id: 2,
          title: "To Keep",
          code: "code",
          tags: [],
          createdAt: "2024-01-02",
        },
      ];
      mockStore.lastId = 2;
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockStore));

      const result = deleteById(1);

      expect(result).toBe(true);
      expect(writeFileSync).toHaveBeenCalled();
    });

    it("should return false when id does not exist", () => {
      mockStore.snippets = [
        {
          id: 1,
          title: "Existing",
          code: "code",
          tags: [],
          createdAt: "2024-01-01",
        },
      ];
      mockStore.lastId = 1;
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockStore));

      const result = deleteById(999);

      expect(result).toBe(false);
      expect(writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe("readStore", () => {
    it("should return default store when file does not exist", () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const result = readStore();

      expect(result).toEqual({
        snippets: [],
        lastId: 0,
      });
    });

    it("should parse and return existing store", () => {
      mockStore.snippets = [
        {
          id: 1,
          title: "Test",
          code: "code",
          tags: [],
          createdAt: "2024-01-01",
        },
      ];
      mockStore.lastId = 1;
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockStore));

      const result = readStore();

      expect(result.snippets).toHaveLength(1);
      expect(result.lastId).toBe(1);
    });
  });

  describe("writeStore", () => {
    it("should write store to file", () => {
      const store = {
        snippets: [
          {
            id: 1,
            title: "Test",
            code: "code",
            tags: [],
            createdAt: "2024-01-01",
          },
        ],
        lastId: 1,
      };

      writeStore(store);

      expect(writeFileSync).toHaveBeenCalledWith(
        "/mocked/home/.snipit/snippets.json",
        JSON.stringify(store, null, 2),
        "utf-8",
      );
    });

    it("should ensure directory exists before writing", () => {
      // Make sure existsSync returns false so ensureDirExists creates the directory
      vi.mocked(existsSync).mockReturnValue(false);

      writeStore({ snippets: [], lastId: 0 });

      expect(mkdirSync).toHaveBeenCalledWith("/mocked/home/.snipit", {
        recursive: true,
      });
    });
  });
});
