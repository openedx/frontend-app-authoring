// Factories should generate new objects with unique data so that they're not always the same.
import { v4 as uuidv4 } from 'uuid';
import { LIBRARY_ACCESS } from '../data';
import {
  HTML_TYPE, POLL_TYPE, PROBLEM_TYPE, VIDEO_TYPE,
} from './constants';
import { makeManufacturer } from './helpers';

const currentIds = {
  user: 0,
  library: 0,
};


export function userFactory(overrides) {
  currentIds.user += 1;
  const id = currentIds.user;
  return {
    username: `TestUser${id}`,
    email: `example${id}@example.com`,
    access_level: LIBRARY_ACCESS.READ,
    ...overrides,
  };
}


export function libraryFactory(overrides) {
  currentIds.library += 1;
  const id = currentIds.library;
  const base = {
    org: `TestOrg${id}`,
    slug: `TestSlug${id}`,
    bundle_uuid: uuidv4(),
    title: `Test library ${id}`,
    description: `This is a test library, number ${id} in the sequence.`,
    version: 0,
    has_unpublished_changes: false,
    has_unpublished_deletes: false,
    blocks: [],
    blockTypes: [VIDEO_TYPE, POLL_TYPE, HTML_TYPE, PROBLEM_TYPE],
    ...overrides,
  };
  return {
    ...base,
    id: `lib:${base.org}:${base.slug}`,
    // Use overrides one more time in case id was overridden.
    ...overrides,
  };
}


export const userFactoryLine = makeManufacturer(userFactory);
export const libraryFactoryLine = makeManufacturer(libraryFactory);
