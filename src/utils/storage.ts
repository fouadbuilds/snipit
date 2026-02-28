import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type { Snippet, SnipitStore } from "../types/index.js";

// ~/.snipit/snippets.json
const SNIPIT_DIR = join(homedir(), ".snipit");
const STORE_PATH = join(SNIPIT_DIR, "snippets.json");

const DEFAULT_STORE: SnipitStore = {
  snippets: [],
  lastId: 0,
};

function ensureDirExists(): void {
  if (!existsSync(SNIPIT_DIR)) {
    mkdirSync(SNIPIT_DIR, { recursive: true });
  }
}

export function readStore(): SnipitStore {
  ensureDirExists();
  if (!existsSync(STORE_PATH)) {
    return { ...DEFAULT_STORE };
  }
  const raw = readFileSync(STORE_PATH, "utf-8");
  return JSON.parse(raw) as SnipitStore;
}

export function writeStore(store: SnipitStore): void {
  ensureDirExists();
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function getAll(): Snippet[] {
  return readStore().snippets;
}

export function getByTitle(title: string): Snippet | undefined {
  const store = readStore();

  return store.snippets.find(
    (s) => s.title.toLowerCase() === title.toLowerCase(),
  );
}

export function addSnippet(snippet: Omit<Snippet, "id" | "createdAt">): Snippet {
  const store = readStore();
  const newSnippet: Snippet = {
    ...snippet,
    id: store.lastId + 1,
    createdAt: new Date().toISOString().split("T")[0],
  };
  store.snippets.push(newSnippet);
  store.lastId = newSnippet.id;
  writeStore(store);
  return newSnippet;
}

export function deleteById(id:number):boolean {
    const store = readStore()
    const lastStoreSize = store.snippets.length
    store.snippets = store.snippets.filter((s) => s.id != id)
    if (store.snippets.length === lastStoreSize) {
        return false
    }
    writeStore(store)
    return true

}