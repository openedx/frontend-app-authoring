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
}

export interface Filters {
  brokenLinks: boolean,
  lockedLinks: boolean,
  externalForbiddenLinks: boolean,
}
