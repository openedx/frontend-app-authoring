// Factories should generate new objects with unique data so that they're not always the same.
import { v4 as uuidv4 } from 'uuid';
import { LIBRARY_ACCESS, LIBRARY_TYPES, LOADING_STATUS } from '../data';
import {
  HTML_TYPE, POLL_TYPE, PROBLEM_TYPE, VIDEO_TYPE,
} from './constants';
import { makeManufacturer } from './helpers';

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
    blockTypes: [VIDEO_TYPE, POLL_TYPE, HTML_TYPE, PROBLEM_TYPE],
    allow_lti: false,
    ...overrides,
  };
  return {
    ...base,
    id: `lib:${base.org}:${base.slug}`,
    // Use overrides one more time in case id was overridden.
    ...overrides,
  };
}

const fetchableFactory = (baseFactory, defaultStatus = LOADING_STATUS.STANDBY) => (overrides, options) => {
  let newOverrides = overrides || {};
  const base = { status: defaultStatus, value: null };
  if (newOverrides.value !== null) {
    newOverrides = { value: baseFactory(newOverrides.value, options) };
  }
  return { ...base, ...newOverrides };
};

const defaultLiteral = (literal) => (override) => {
  if (override !== undefined) {
    return override;
  }
  return literal();
};

function blockMetadataFactoryBase(overrides = undefined, { block } = {}) {
  return {
    block_type: block.block_type,
    display_name: block.display_name,
    has_unpublished_changes: false,
    id: block.id,
    ...overrides,
  };
}

export const blockMetadataFactory = fetchableFactory(blockMetadataFactoryBase, LOADING_STATUS.STANDBY);

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
    id: `lb:${baseLibrary.id}:${base.block_type}:${id}`,
    // Not accurate to how studio builds this.
    def_key: `bundle-olx:${uuidv4()}:test/${id}.xml`,
    // id may be overridden.
    ...overrides,
  };
}

const viewFactoryBase = (overrides, { block } = {}) => {
  const sourceBlock = block || blockFactory();
  return {
    content: `<div>Block ${sourceBlock.id}</div>`,
    resources: [],
    ...overrides,
  };
};

const viewFactory = fetchableFactory(viewFactoryBase, LOADING_STATUS.LOADED);

const assetsFactory = fetchableFactory(defaultLiteral(() => []), LOADING_STATUS.LOADED);
const olxFactory = fetchableFactory(defaultLiteral(() => ''), LOADING_STATUS.LOADED);
const deletionFactory = fetchableFactory(defaultLiteral(() => null), LOADING_STATUS.STANDBY);

export function blockStateFactory(overrides = undefined, { block } = {}) {
  const baseBlock = block || blockFactory();
  const newOverrides = overrides || {};
  return {
    errorMessage: null,
    status: LOADING_STATUS.LOADED,
    ...newOverrides,
    deletion: deletionFactory(newOverrides.metadata),
    metadata: blockMetadataFactory(newOverrides.metadata, { block: baseBlock }),
    assets: assetsFactory(newOverrides.assets),
    olx: olxFactory(newOverrides.olx),
    view: viewFactory(newOverrides.view),
  };
}

export const userFactoryLine = makeManufacturer(userFactory);
export const libraryFactoryLine = makeManufacturer(libraryFactory);
export const blockFactoryLine = makeManufacturer(blockFactory);
