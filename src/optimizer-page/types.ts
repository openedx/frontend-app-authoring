export interface Unit {
  id: string;
  displayName: string;
  blocks: {
    id: string;
    displayName?: string;
    url: string;
    brokenLinks: string[];
    lockedLinks: string[];
    externalForbiddenLinks: string[];
    previousRunLinks: { originalLink: string; isUpdated: boolean; updatedLink?: string }[];
  }[];
}

export interface SubSection {
  id: string;
  displayName: string;
  units: Unit[];
}

export interface Section {
  id: string;
  displayName: string;
  subsections: SubSection[];
}

export interface LinkCheckResult {
  sections: Section[];
  courseUpdates?: {
    id: string;
    displayName: string;
    url: string;
    brokenLinks: string[];
    lockedLinks: string[];
    externalForbiddenLinks: string[];
    previousRunLinks: { originalLink: string; isUpdated: boolean; updatedLink?: string }[];
  }[];
  customPages?: {
    id: string;
    displayName: string;
    url: string;
    brokenLinks: string[];
    lockedLinks: string[];
    externalForbiddenLinks: string[];
    previousRunLinks: { originalLink: string; isUpdated: boolean; updatedLink?: string }[];
  }[];
}

export interface Filters {
  brokenLinks: boolean,
  lockedLinks: boolean,
  externalForbiddenLinks: boolean,
}
