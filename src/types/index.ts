export interface Snippet {
    id: number, 
    title: string, 
    code: string,
    tags: string[]
    createdAt: string
}

export interface SnipitStore {
  snippets: Snippet[];
  lastId: number;
}