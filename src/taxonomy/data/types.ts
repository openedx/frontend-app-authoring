/** Metadata about a taxonomy */
export interface TaxonomyData {
  id: number;
  name: string;
  description: string;
  exportId: string;
  enabled: boolean;
  allowMultiple: boolean;
  allowFreeText: boolean;
  systemDefined: boolean;
  visibleToAuthors: boolean;
  tagsCount: number;
  orgs: string[];
  allOrgs: boolean;
  canChangeTaxonomy: boolean;
  canDeleteTaxonomy: boolean;
  canTagObject: boolean;
}

/** The list of taxonomies */
export interface TaxonomyListData {
  next: string;
  previous: string;
  count: number;
  numPages: number;
  currentPage: number;
  start: number;
  canAddTaxonomy: boolean;
  results: TaxonomyData[];
}

export interface QueryOptions {
  pageIndex: number;
  pageSize: number;
}

export interface TagData {
  childCount: number;
  descendantCount: number;
  depth: number;
  externalId: string;
  id: number;
  parentValue: string | null;
  subTagsUrl: string | null;
  /** Unique ID for this tag, also its display text */
  value: string;
  usageCount?: number;
  /** Database ID. Don't rely on this, as it is not present for free-text tags. */
  _id?: string;
}

export interface TagListData {
  count: number;
  currentPage: number;
  next: string;
  numPages: number;
  previous: string;
  results: TagData[];
  start: number;
}
