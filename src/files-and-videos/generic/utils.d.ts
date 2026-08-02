export interface SortableFile {
  id: string;
  displayName: string;
  dateAdded: string | number;
  [key: string]: unknown;
}

export declare function sortFiles(files: SortableFile[], sortType: string): string[];