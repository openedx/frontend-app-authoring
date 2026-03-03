export interface Usage {
  label: string;
  url: string;
}

export interface Group {
  id: number;
  name: string;
  usage: Usage[];
  version: number;
}

export interface AvailableGroupParameters {
  courseId: string;
}

export interface AvailableGroup {
  active?: boolean;
  description?: string;
  groups: Group[];
  id: number;
  name: string;
  parameters?: AvailableGroupParameters;
  readOnly?: boolean;
  scheme: string;
  version: number;
}
