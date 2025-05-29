/**
 * Constants and utility hook for the Library Authoring routes.
 */
import { useCallback } from 'react';
import {
  generatePath,
  matchPath,
  useParams,
  useLocation,
  useNavigate,
  useSearchParams,
  type PathMatch,
} from 'react-router-dom';
import { useLibraryContext } from './common/context/LibraryContext';

export const BASE_ROUTE = '/library/:libraryId';

export const ROUTES = {
  // LibraryAuthoringPage routes:
  // * Components tab, with an optionally selected component in the sidebar.
  COMPONENTS: '/components/:selectedItemId?',
  // * Collections tab, with an optionally selected collectionId in the sidebar.
  COLLECTIONS: '/collections/:selectedItemId?',
  // * Sections tab, with an optionally selected sectionId in the sidebar.
  SECTIONS: '/sections/:selectedItemId?',
  // * Subsections tab, with an optionally selected subsectionId in the sidebar.
  SUBSECTIONS: '/subsections/:selectedItemId?',
  // * Units tab, with an optionally selected unitId in the sidebar.
  UNITS: '/units/:selectedItemId?',
  // * All Content tab, with an optionally selected collection or unit in the sidebar.
  HOME: '/:selectedItemId?',
  // LibraryCollectionPage route:
  // * with a selected collectionId and/or an optionally selected componentId.
  COLLECTION: '/collection/:collectionId/:selectedItemId?',
  // LibrarySectionPage route:
  // * with a selected sectionId and/or an optionally selected subsectionId.
  SECTION: '/section/:sectionId/:subsectionId?',
  // LibrarySubsectionPage route:
  // * with a selected subsectionId and/or an optionally selected unitId.
  SUBSECTION: '/subsection/:subsectionId/:unitId?',
  // LibraryUnitPage route:
  // * with a selected unitId and/or an optionally selected componentId.
  UNIT: '/unit/:unitId/:selectedItemId?',
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
  contentType?: ContentType,
  unitId?: string,
};

export type LibraryRoutesData = {
  insideCollection: PathMatch<string> | null;
  insideCollections: PathMatch<string> | null;
  insideComponents: PathMatch<string> | null;
  insideSections: PathMatch<string> | null;
  insideSection: PathMatch<string> | null;
  insideSubsections: PathMatch<string> | null;
  insideSubsection: PathMatch<string> | null;
  insideUnits: PathMatch<string> | null;
  insideUnit: PathMatch<string> | null;

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
  const { setUnitId, setCollectionId } = useLibraryContext();

  const insideCollection = matchPath(BASE_ROUTE + ROUTES.COLLECTION, pathname);
  const insideCollections = matchPath(BASE_ROUTE + ROUTES.COLLECTIONS, pathname);
  const insideComponents = matchPath(BASE_ROUTE + ROUTES.COMPONENTS, pathname);
  const insideSections = matchPath(BASE_ROUTE + ROUTES.SECTIONS, pathname);
  const insideSection = matchPath(BASE_ROUTE + ROUTES.SECTION, pathname);
  const insideSubsections = matchPath(BASE_ROUTE + ROUTES.SUBSECTIONS, pathname);
  const insideSubsection = matchPath(BASE_ROUTE + ROUTES.SUBSECTION, pathname);
  const insideUnits = matchPath(BASE_ROUTE + ROUTES.UNITS, pathname);
  const insideUnit = matchPath(BASE_ROUTE + ROUTES.UNIT, pathname);

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
    ].filter((match): match is PathMatch<string> => match !== null).length > 1) {
    throw new Error('Cannot be inside more than one route at the same time.');
  }

  /** This function is used to navigate to a specific route based on the provided parameters.
   */
  const navigateTo = useCallback(({
    selectedItemId,
    collectionId,
    unitId,
    contentType,
  }: NavigateToData = {}) => {
    const routeParams = {
      ...params,
      // Overwrite the params with the provided values.
      ...((selectedItemId !== undefined) && { selectedItemId }),
      ...((unitId !== undefined) && { unitId }),
      ...((collectionId !== undefined) && { collectionId }),
    };
    let route: string;

    // Update unitId/collectionId in library context if is not undefined.
    // Ids can be cleared from route by passing in empty string so we need to set it.
    if (unitId !== undefined) {
      setUnitId(unitId);
      routeParams.selectedItemId = undefined;

      // If we can have a unitId alongside a routeParams.collectionId, it means we are inside a collection
      // trying to navigate to a unit, so we want to clear the collectionId to not have ambiquity.
      if (routeParams.collectionId !== undefined) {
        setCollectionId(undefined);
        routeParams.collectionId = undefined;
      }
    } else if (collectionId !== undefined) {
      setCollectionId(collectionId);
      routeParams.selectedItemId = undefined;
    } else if (contentType) {
      // We are navigating to the library home, so we need to clear the unitId and collectionId
      setUnitId(undefined);
      routeParams.unitId = undefined;
      setCollectionId(undefined);
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
      if (routeParams.selectedItemId?.includes(':unit:')
        || routeParams.selectedItemId?.includes(':subsection:')
        || routeParams.selectedItemId?.includes(':section:')
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
    } else if (routeParams.unitId) {
      route = ROUTES.UNIT;
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

    // Also remove the `sa` (sidebar action) search param if it exists.
    searchParams.delete('sa');

    const newPath = generatePath(BASE_ROUTE + route, routeParams);
    navigate({
      pathname: newPath,
      search: searchParams.toString(),
    });
  }, [
    navigate,
    params,
    searchParams,
    pathname,
    setUnitId,
    setCollectionId,
  ]);

  return {
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
  };
};
