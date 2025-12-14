import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const getHelpUrlsApiUrl = () => `${getConfig().STUDIO_BASE_URL}/api/contentstore/v1/help_urls`;

export interface HelpUrls {
  advanced: string;
  certificates: string;
  checklist: string;
  container: string;
  contentGroups: string;
  contentHighlights: string;
  contentLibraries: string;
  default: string;
  developCourse: string;
  enrollmentTracks: string;
  exportCourse: string;
  exportLibrary: string;
  files: string;
  grading: string;
  groupConfigurations: string;
  home: string;
  imageAccessibility: string;
  importCourse: string;
  importLibrary: string;
  login: string;
  outline: string;
  pages: string;
  register: string;
  schedule: string;
  socialSharing: string;
  teamCourse: string;
  teamLibrary: string;
  textbooks: string;
  unit: string;
  updates: string;
  video: string;
  visibility: string;
  welcome: string;
}

export async function getHelpUrls(): Promise<HelpUrls> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getHelpUrlsApiUrl());
  return camelCaseObject(data);
}
