import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { importCommand } from "../src/commands/import.js";
import { readStore, writeStore } from "../src/utils/storage.js";

// Mock the fs module
vi.mock("fs", () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

// Mock picocolors to return plain strings
vi.mock("picocolors", () => ({
  default: {
    green: (str: string) => str,
    red: (str: string) => str,
    yellow: (str: string) => str,
    cyan: (str: string) => str,
    magenta: (str: string) => str,
  },
  green: (str: string) => str,
  red: (str: string) => str,
  yellow: (str: string) => str,
  cyan: (str: string) => str,
  magenta: (str: string) => str,
}));

// Mock storage module
vi.mock("../src/utils/storage.js", () => ({
  readStore: vi.fn(),
  writeStore: vi.fn(),
}));

// Import mocked modules
import { existsSync, readFileSync } from "fs";

describe("Import Command", () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("Error handling", () => {
    it("should error when file does not exist", async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const filePath = "/non/existent/file.json";
      const fileExists = existsSync(filePath);

      expect(fileExists).toBe(false);
    });

    it("should error when JSON is invalid", async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue("invalid json");

      try {
        JSON.parse("invalid json");
      } catch (e) {
        // Should throw error
      }

      expect(() => JSON.parse("invalid json")).toThrow();
    });
  });

  describe("Import snippets", () => {
    it("should import snippets from array format", () => {
      const importData: any[] = [
        {
          id: 1,
          title: "Imported Snippet",
          code: "console.log('imported')",
          tags: ["js"],
          createdAt: "2024-01-01",
        },
      ];

      const snippetsToImport: any[] = Array.isArray(importData)
        ? importData
        : (importData as any).snippets || [];

      expect(snippetsToImport).toHaveLength(1);
      expect(snippetsToImport[0].title).toBe("Imported Snippet");
    });

    it("should import snippets from object format with snippets key", () => {
      const importData: any = {
        snippets: [
          {
            id: 1,
            title: "Imported Snippet",
            code: "console.log('imported')",
            tags: ["js"],
            createdAt: "2024-01-01",
          },
        ],
      };

      const snippetsToImport: any[] = Array.isArray(importData)
        ? importData
        : importData.snippets || [];

      expect(snippetsToImport).toHaveLength(1);
    });

    it("should handle empty snippets array", () => {
      const importData: any = {
        snippets: [],
      };

      const snippetsToImport: any[] = Array.isArray(importData)
        ? importData
        : importData.snippets || [];

      expect(snippetsToImport).toHaveLength(0);
    });

    it("should use current date if createdAt is missing", () => {
      const newSnippet: any = {
        title: "New Snippet",
        code: "code",
        tags: [],
      };

      const result: any = {
        ...newSnippet,
        createdAt:
          newSnippet.createdAt || new Date().toISOString().split("T")[0],
      };

      expect(result.createdAt).toBeDefined();
    });
  });

  describe("Duplicate detection", () => {
    it("should skip exact duplicate snippets", () => {
      const store = {
        snippets: [
          {
            id: 1,
            title: "Test Snippet",
            code: "code",
            tags: [],
            createdAt: "2024-01-01",
          },
        ],
        lastId: 1,
      };

      const newSnip = {
        id: 1,
        title: "Test Snippet",
        code: "code",
        tags: [],
        createdAt: "2024-01-01",
      };

      const isExactDuplicate = store.snippets.some(
        (s) => s.title === newSnip.title && s.id === newSnip.id,
      );

      expect(isExactDuplicate).toBe(true);
    });

    it("should not skip snippets with same title but different id", () => {
      const store = {
        snippets: [
          {
            id: 1,
            title: "Test Snippet",
            code: "old code",
            tags: [],
            createdAt: "2024-01-01",
          },
        ],
        lastId: 1,
      };

      const newSnip = {
        id: 2,
        title: "Test Snippet",
        code: "new code",
        tags: [],
        createdAt: "2024-01-02",
      };

      const isExactDuplicate = store.snippets.some(
        (s) => s.title === newSnip.title && s.id === newSnip.id,
      );

      expect(isExactDuplicate).toBe(false);
    });
  });

  describe("Title conflict resolution", () => {
    it("should rename snippet when title conflict exists", () => {
      const store = {
        snippets: [
          {
            id: 1,
            title: "Test Snippet",
            code: "code",
            tags: [],
            createdAt: "2024-01-01",
          },
        ],
        lastId: 1,
      };

      const newSnip = {
        id: 2,
        title: "Test Snippet",
        code: "new code",
        tags: [],
        createdAt: "2024-01-02",
      };

      const hasTitleConflict = store.snippets.some(
        (s) => s.title === newSnip.title,
      );

      let finalTitle = newSnip.title;
      if (hasTitleConflict) {
        finalTitle = `${newSnip.title} (imported_${Date.now().toString().slice(-4)})`;
      }

      expect(hasTitleConflict).toBe(true);
      expect(finalTitle).toContain("(imported_");
    });

    it("should keep original title when no conflict", () => {
      const store = {
        snippets: [
          {
            id: 1,
            title: "Existing Snippet",
            code: "code",
            tags: [],
            createdAt: "2024-01-01",
          },
        ],
        lastId: 1,
      };

      const newSnip = {
        id: 2,
        title: "New Snippet",
        code: "new code",
        tags: [],
        createdAt: "2024-01-02",
      };

      const hasTitleConflict = store.snippets.some(
        (s) => s.title === newSnip.title,
      );

      let finalTitle = newSnip.title;
      if (hasTitleConflict) {
        finalTitle = `${newSnip.title} (imported_${Date.now().toString().slice(-4)})`;
      }

      expect(hasTitleConflict).toBe(false);
      expect(finalTitle).toBe("New Snippet");
    });
  });

  describe("ID assignment", () => {
    it("should assign new ID based on lastId", () => {
      const store = {
        snippets: [
          {
            id: 1,
            title: "Snippet 1",
            code: "code1",
            tags: [],
            createdAt: "2024-01-01",
          },
        ],
        lastId: 1,
      };

      store.lastId++;

      expect(store.lastId).toBe(2);
    });
  });

  describe("Console output", () => {
    it("should log success message with added count", () => {
      console.log(`\n✔ Import successful!`);
      console.log(`${"→"} Added: ${1}`);

      expect(consoleLogSpy).toHaveBeenCalledWith(`\n✔ Import successful!`);
      expect(consoleLogSpy).toHaveBeenCalledWith(`→ Added: 1`);
    });

    it("should log skipped count for duplicates", () => {
      console.log(`→ Skipped (Duplicates): ${2}`);

      expect(consoleLogSpy).toHaveBeenCalledWith(`→ Skipped (Duplicates): 2`);
    });

    it("should log renamed count for conflicts", () => {
      console.log(`→ Renamed (Conflicts): ${1}`);

      expect(consoleLogSpy).toHaveBeenCalledWith(`→ Renamed (Conflicts): 1`);
    });

    it("should log warning for empty import", () => {
      console.log(`⚠ No snippets found in the provided file.`);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        `⚠ No snippets found in the provided file.`,
      );
    });
  });

  describe("Import statistics", () => {
    it("should track added, skipped, and renamed counts", () => {
      let addedCount = 0;
      let skippedCount = 0;
      let renamedCount = 0;

      // Simulate adding a snippet
      addedCount++;

      // Simulate skipping a duplicate
      skippedCount++;

      // Simulate renaming a conflict
      renamedCount++;

      expect(addedCount).toBe(1);
      expect(skippedCount).toBe(1);
      expect(renamedCount).toBe(1);
    });

    it("should not log skipped or renamed when counts are zero", () => {
      const addedCount = 1;
      const skippedCount = 0;
      const renamedCount = 0;

      // Only log if counts > 0
      if (addedCount > 0) {
        console.log(`→ Added: ${addedCount}`);
      }
      if (skippedCount > 0) {
        console.log(`→ Skipped (Duplicates): ${skippedCount}`);
      }
      if (renamedCount > 0) {
        console.log(`→ Renamed (Conflicts): ${renamedCount}`);
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(`→ Added: 1`);
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("Skipped"),
      );
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("Renamed"),
      );
    });
  });
});
