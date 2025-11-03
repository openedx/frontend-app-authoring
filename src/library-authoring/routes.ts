/**
 * Constants and utility hook for the Library Authoring routes.
 */
import { useCallback, useMemo } from 'react';
import {
  generatePath,
  matchPath,
  useParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { ContainerType, getBlockType } from '../generic/key-utils';

export const BASE_ROUTE = '/library/:libraryId';

export enum LibQueryParamKeys {
  SidebarActions = 'sa',
  SidebarTab = 'st',
}

export const ROUTES = {
  // LibraryAuthoringPage routes:
  // * Components tab, with an optionally selected component in the sidebar.
  COMPONENTS: '/components/:selectedItemId?',
  // * Collections tab, with an optionally selected collectionId in the sidebar.
  COLLECTIONS: '/collections/:selectedItemId?',
  // * Sections tab, with an optionally selected section in the sidebar.
  SECTIONS: '/sections/:selectedItemId?',
  // * Subsections tab, with an optionally selected subsection in the sidebar.
  SUBSECTIONS: '/subsections/:selectedItemId?',
  // * Units tab, with an optionally selected unit in the sidebar.
  UNITS: '/units/:selectedItemId?',
  // * All Content tab, with an optionally selected collection or unit in the sidebar.
  HOME: '/:selectedItemId?',
  // LibraryCollectionPage route:
  // * with a selected collectionId and/or an optionally selected componentId.
  COLLECTION: '/collection/:collectionId/:selectedItemId?',
  // LibrarySectionPage route:
  // * with a selected containerId and an optionally selected subsection.
  SECTION: '/section/:containerId/:selectedItemId?/:index?',
  // LibrarySubsectionPage route:
  // * with a selected containerId and an optionally selected unit.
  SUBSECTION: '/subsection/:containerId/:selectedItemId?/:index?',
  // LibraryUnitPage route:
  // * with a selected containerId and/or an optionally selected componentId.
  UNIT: '/unit/:containerId/:selectedItemId?/:index?',
  // LibraryBackupPage route:
  BACKUP: '/backup',
};

export enum ContentType {
  home = '',
  collections = 'collections',
  components = 'components',
  units = 'units',
  subsections = 'subsections',
  sections = 'sections',
}

export const allLibraryPageTabs: ContentType[] = Object.values(ContentType);

export type NavigateToData = {
  selectedItemId?: string,
  collectionId?: string,
  containerId?: string,
  contentType?: ContentType,
  index?: number,
};

export type LibraryRoutesData = {
  insideCollection: boolean;
  insideCollections: boolean;
  insideComponents: boolean;
  insideSections: boolean;
  insideSection: boolean;
  insideSubsections: boolean;
  insideSubsection: boolean;
  insideUnits: boolean;
  insideUnit: boolean;

  /** Navigate using the best route from the current location for the given parameters.
   *  This function can be mutated if there are changes in the current route, so always include
   *  it in the dependencies array if used on a `useCallback`.
   */
  navigateTo: (dict?: NavigateToData) => void;
};

export const useLibraryRoutes = (): LibraryRoutesData => {
  const { pathname } = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Convert the returned PathMatch<string> | null values to PathMatch<string> | false
  // to make it easier to return them as booleans below.
  const insideCollection = matchPath(BASE_ROUTE + ROUTES.COLLECTION, pathname) || false;
  const insideCollections = matchPath(BASE_ROUTE + ROUTES.COLLECTIONS, pathname) || false;
  const insideComponents = matchPath(BASE_ROUTE + ROUTES.COMPONENTS, pathname) || false;
  const insideSections = matchPath(BASE_ROUTE + ROUTES.SECTIONS, pathname) || false;
  const insideSection = matchPath(BASE_ROUTE + ROUTES.SECTION, pathname) || false;
  const insideSubsections = matchPath(BASE_ROUTE + ROUTES.SUBSECTIONS, pathname) || false;
  const insideSubsection = matchPath(BASE_ROUTE + ROUTES.SUBSECTION, pathname) || false;
  const insideUnits = matchPath(BASE_ROUTE + ROUTES.UNITS, pathname) || false;
  const insideUnit = matchPath(BASE_ROUTE + ROUTES.UNIT, pathname) || false;

  // Sanity check to ensure that we are not inside more than one route at the same time.
  // istanbul ignore if: this is a developer error, not a user error.
  if (
    [
      insideCollection,
      insideCollections,
      insideComponents,
      insideSections,
      insideSection,
      insideSubsections,
      insideSubsection,
      insideUnits,
      insideUnit,
    ].filter((match) => match).length > 1) {
    throw new Error('Cannot be inside more than one route at the same time.');
  }

  /** This function is used to navigate to a specific route based on the provided parameters.
   */
  const navigateTo = useCallback(({
    selectedItemId,
    collectionId,
    containerId,
    contentType,
    index,
  }: NavigateToData = {}) => {
    const routeParams = {
      ...params,
      // Overwrite the params with the provided values.
      ...((selectedItemId !== undefined) && { selectedItemId }),
      ...((containerId !== undefined) && { containerId }),
      ...((collectionId !== undefined) && { collectionId }),
      ...((index !== undefined) && { index }),
    };
    let route: string;

    if (routeParams.selectedItemId
     && (['components', 'units', 'sections', 'subsections'].includes(routeParams.selectedItemId || ''))) {
      // These are not valid selectedItemIds, but routes
      routeParams.selectedItemId = undefined;
    }

    // Update containerId/collectionId in library context if is not undefined.
    // Ids can be cleared from route by passing in empty string so we need to set it.
    if (containerId !== undefined) {
      routeParams.selectedItemId = undefined;

      // If we can have a containerId alongside a routeParams.collectionId,
      // it means we are inside a collection trying to navigate to a unit/section/subsection,
      // so we want to clear the collectionId to not have ambiguity.
      if (routeParams.collectionId !== undefined) {
        routeParams.collectionId = undefined;
      }
    } else if (collectionId !== undefined) {
      routeParams.selectedItemId = undefined;
    } else if (contentType) {
      // We are navigating to the library home, so we need to clear the containerId and collectionId
      routeParams.containerId = undefined;
      routeParams.collectionId = undefined;
    }

    // The code below determines the best route to navigate to based on the
    // current pathname and the provided parameters.
    // Providing contentType overrides the current route so we can change tabs.
    if (contentType === ContentType.components) {
      if (!routeParams.selectedItemId?.startsWith('lb:')) {
        // If the selectedItemId is not a component, we need to set it to undefined
        routeParams.selectedItemId = undefined;
      }
      route = ROUTES.COMPONENTS;
    } else if (contentType === ContentType.collections) {
      // FIXME: We are using the Collection key, not the full OpaqueKey. So we
      // can't directly use the selectedItemId to determine if it's a collection.
      // We need to change this to use the full OpaqueKey in the future.
      if (routeParams.selectedItemId?.startsWith('lct:')
        || routeParams.selectedItemId?.startsWith('lb:')) {
        routeParams.selectedItemId = undefined;
      }
      route = ROUTES.COLLECTIONS;
    } else if (contentType === ContentType.units) {
      if (!routeParams.selectedItemId?.includes(':unit:')) {
        // Clear selectedItemId if it is not a unit.
        routeParams.selectedItemId = undefined;
      }
      route = ROUTES.UNITS;
    } else if (contentType === ContentType.subsections) {
      if (!routeParams.selectedItemId?.includes(':subsection:')) {
        // If the selectedItemId is not a subsection, we need to set it to undefined
        routeParams.selectedItemId = undefined;
      }
      route = ROUTES.SUBSECTIONS;
    } else if (contentType === ContentType.sections) {
      if (!routeParams.selectedItemId?.includes(':section:')) {
        // If the selectedItemId is not a section, we need to set it to undefined
        routeParams.selectedItemId = undefined;
      }
      route = ROUTES.SECTIONS;
    } else if (contentType === ContentType.home) {
      route = ROUTES.HOME;
    } else if (routeParams.containerId) {
      const containerType = getBlockType(routeParams.containerId);
      switch (containerType) {
        case ContainerType.Unit:
          route = ROUTES.UNIT;
          break;
        case ContainerType.Subsection:
          route = ROUTES.SUBSECTION;
          break;
        case ContainerType.Section:
          route = ROUTES.SECTION;
          break;
        default:
          // Fall back to home if unrecognized container type
          route = ROUTES.HOME;
          routeParams.containerId = undefined;
          break;
      }
    } else if (routeParams.collectionId) {
      route = ROUTES.COLLECTION;
      // From here, we will just stay in the current route
    } else if (insideComponents) {
      route = ROUTES.COMPONENTS;
    } else if (insideCollections) {
      route = ROUTES.COLLECTIONS;
    } else if (insideUnits) {
      route = ROUTES.UNITS;
    } else if (insideSubsections) {
      route = ROUTES.SUBSECTIONS;
    } else if (insideSections) {
      route = ROUTES.SECTIONS;
    } else {
      route = ROUTES.HOME;
    }

    // Since index is just the order number of the selectedItemId
    // clear index if selectedItemId is undefined
    if (routeParams.selectedItemId === undefined) {
      routeParams.index = undefined;
    }

    // Also remove the `sa` (sidebar action) search param if it exists.
    searchParams.delete(LibQueryParamKeys.SidebarActions);

    const newPath = generatePath(BASE_ROUTE + route, routeParams);
    // Prevent unnecessary navigation if the path is the same.
    if (newPath !== pathname) {
      navigate({
        pathname: newPath,
        search: searchParams.toString(),
      });
    }
  }, [
    navigate,
    params,
    searchParams,
    pathname,
  ]);

  return useMemo(() => ({
    navigateTo,
    insideCollection: !!insideCollection,
    insideCollections: !!insideCollections,
    insideComponents: !!insideComponents,
    insideSections: !!insideSections,
    insideSection: !!insideSection,
    insideSubsections: !!insideSubsections,
    insideSubsection: !!insideSubsection,
    insideUnits: !!insideUnits,
    insideUnit: !!insideUnit,
  }), [
    navigateTo,
    insideCollection,
    insideCollections,
    insideComponents,
    insideSections,
    insideSection,
    insideSubsections,
    insideSubsection,
    insideUnits,
    insideUnit,
  ]);
};
