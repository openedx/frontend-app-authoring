// Factories should generate new objects with unique data so that they're not always the same.
import { v4 as uuidv4 } from 'uuid';
import { LIBRARY_ACCESS, LIBRARY_TYPES, LOADING_STATUS } from '../data';
import {
  HTML_TYPE, POLL_TYPE, PROBLEM_TYPE, VIDEO_TYPE,
} from './constants';
import { makeManufacturer, makeN } from './helpers';


const currentIds = {
  user: 0,
  library: 0,
  blocks: 0,
};


export function userFactory(overrides = undefined) {
  currentIds.user += 1;
  const id = currentIds.user;
  return {
    username: `TestUser${id}`,
    email: `example${id}@example.com`,
    access_level: LIBRARY_ACCESS.READ,
    ...overrides,
  };
}


export function libraryFactory(overrides = undefined) {
  currentIds.library += 1;
  const id = currentIds.library;
  const blocks = (overrides && overrides.blocks) || [];
  const base = {
    org: `TestOrg${id}`,
    slug: `TestSlug${id}`,
    bundle_uuid: uuidv4(),
    title: `Test library ${id}`,
    description: `This is a test library, number ${id} in the sequence.`,
    version: 0,
    has_unpublished_changes: false,
    has_unpublished_deletes: false,
    type: LIBRARY_TYPES.COMPLEX,
    license: '',
    blocks: [],
    blockTypes: [VIDEO_TYPE, POLL_TYPE, HTML_TYPE, PROBLEM_TYPE],
    ...overrides,
  };
  const withId = {
    ...base,
    id: `lib:${base.org}:${base.slug}`,
    // Use overrides one more time in case id was overridden.
    ...overrides,
  };
  return {
    ...withId,
    // Specify a set of overrides for blocks, and blocks will be generated for them.
    // eslint-disable-next-line no-use-before-define
    blocks: makeN(makeManufacturer(blockFactory, { library: withId })(blocks), blocks.length),
  };
}

export function blockMetadataFactory(overrides = undefined, { block } = {}) {
  return {
    block_type: block.block_type,
    display_name: block.display_name,
    has_unpublished_changes: false,
    id: block.id,
    ...overrides,
  };
}

export function blockFactory(overrides = undefined, { library } = {}) {
  currentIds.blocks += 1;
  const id = currentIds.blocks;
  const baseLibrary = library || libraryFactory();
  const base = {
    block_type: VIDEO_TYPE.block_type,
    display_name: `Block ${id}`,
    has_unpublished_changes: false,
    ...overrides,
  };
  return {
    ...base,
    id: `lb:${baseLibrary.id}:${base.block_type}`,
    // Not accurate to how studio builds this.
    def_key: `bundle-olx:${uuidv4()}:test/${id}.xml`,
    // id may be overridden.
    ...overrides,
  };
}


export function blockStateFactory(overrides = undefined, { block } = {}) {
  const baseBlock = block || blockFactory();
  const base = {
    metadata: blockMetadataFactory(overrides && overrides.metadata, { block: baseBlock }),
    assets: [],
    errorMessage: '',
    olx: '',
    status: LOADING_STATUS.LOADED,
    ...overrides,
  };
  return {
    ...base,
    view: {
      content: `<div>Block ${base.id}</div>`,
      resources: [],
    },
    ...overrides,
  };
}


export const userFactoryLine = makeManufacturer(userFactory);
export const libraryFactoryLine = makeManufacturer(libraryFactory);
