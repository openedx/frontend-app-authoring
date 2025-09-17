export interface TeamMember {
  name: string;
  username: string;
  email: string;
  roles: string[];
}

export interface LibraryMetadata {
  id: string;
  org: string;
  title: string;
  slug: string;
}

export interface TableCellValue<T> {
  row: {
    original: T;
  };
}
