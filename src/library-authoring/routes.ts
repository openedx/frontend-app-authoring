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
  // * Components tab, with an optionally selected componentId in the sidebar.
  COMPONENTS: '/components/:componentId?',
  // * Collections tab, with an optionally selected collectionId in the sidebar.
  COLLECTIONS: '/collections/:collectionId?',
  // * Units tab, with an optionally selected unitId in the sidebar.
  UNITS: '/units/:unitId?',
  // * All Content tab, with an optionally selected componentId in the sidebar.
  COMPONENT: '/component/:componentId',
  // * All Content tab, with an optionally selected collection or unit in the sidebar.
  HOME: '/:selectedItemId?',
  // LibraryCollectionPage route:
  // * with a selected collectionId and/or an optionally selected componentId.
  COLLECTION: '/collection/:collectionId/:componentId?',
  // LibraryUnitPage route:
  // * with a selected unitId and/or an optionally selected componentId.
  UNIT: '/unit/:unitId/:componentId?',
};

export enum ContentType {
  home = '',
  collections = 'collections',
  components = 'components',
  units = 'units',
}

export const allLibraryPageTabs: ContentType[] = Object.values(ContentType);

export type NavigateToData = {
  componentId?: string,
  collectionId?: string,
  contentType?: ContentType,
  unitId?: string,
  doubleClicked?: boolean,
};

export type LibraryRoutesData = {
  insideCollection: PathMatch<string> | null;
  insideCollections: PathMatch<string> | null;
  insideComponents: PathMatch<string> | null;
  insideUnits: PathMatch<string> | null;
  insideUnit: PathMatch<string> | null;

  // Navigate using the best route from the current location for the given parameters.
  navigateTo: (dict?: NavigateToData) => void;
};

export const useLibraryRoutes = (): LibraryRoutesData => {
  const { pathname } = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setComponentId, setUnitId, setCollectionId } = useLibraryContext();

  const insideCollection = matchPath(BASE_ROUTE + ROUTES.COLLECTION, pathname);
  const insideCollections = matchPath(BASE_ROUTE + ROUTES.COLLECTIONS, pathname);
  const insideComponents = matchPath(BASE_ROUTE + ROUTES.COMPONENTS, pathname);
  const insideUnits = matchPath(BASE_ROUTE + ROUTES.UNITS, pathname);
  const insideUnit = matchPath(BASE_ROUTE + ROUTES.UNIT, pathname);

  const navigateTo = useCallback(({
    componentId,
    collectionId,
    unitId,
    contentType,
    doubleClicked,
  }: NavigateToData = {}) => {
    const {
      collectionId: urlCollectionId,
      componentId: urlComponentId,
      unitId: urlUnitId,
      selectedItemId: urlSelectedItemId,
    } = params;

    const routeParams = {
      ...params,
      // Overwrite the current componentId/collectionId params if provided
      ...((componentId !== undefined) && { componentId }),
      ...((collectionId !== undefined) && { collectionId, selectedItemId: collectionId }),
      ...((unitId !== undefined) && { unitId, selectedItemId: unitId }),
      ...(contentType === ContentType.home && { selectedItemId: urlCollectionId || urlUnitId }),
      ...(contentType === ContentType.components && { componentId: urlComponentId || urlSelectedItemId }),
      ...(contentType === ContentType.collections && { collectionId: urlCollectionId || urlSelectedItemId }),
      ...(contentType === ContentType.units && { unitId: urlUnitId || urlSelectedItemId }),
    };
    let route: string;

    // Update componentId, unitId, collectionId in library context if is not undefined.
    // Ids can be cleared from route by passing in empty string so we need to set it.
    if (componentId !== undefined) {
      setComponentId(componentId);
    }
    if (unitId !== undefined) {
      setUnitId(unitId);
    }
    if (collectionId !== undefined) {
      setCollectionId(collectionId);
    }

    // Providing contentType overrides the current route so we can change tabs.
    if (contentType === ContentType.components) {
      route = ROUTES.COMPONENTS;
    } else if (contentType === ContentType.collections) {
      route = ROUTES.COLLECTIONS;
    } else if (contentType === ContentType.units) {
      route = ROUTES.UNITS;
    } else if (contentType === ContentType.home) {
      route = ROUTES.HOME;
    } else if (insideCollections) {
      // We're inside the Collections tab,
      route = (
        (collectionId && doubleClicked)
          // now open the previously-selected collection,
          ? ROUTES.COLLECTION
          // or stay there to list all collections, or a selected collection.
          : ROUTES.COLLECTIONS
      );
    } else if (insideCollection) {
      // We're viewing a Collection, so stay there,
      // and optionally select a component in that collection.
      route = ROUTES.COLLECTION;
    } else if (insideComponents) {
      // We're inside the Components tab, so stay there,
      // optionally selecting a component.
      route = ROUTES.COMPONENTS;
    } else if (insideUnits) {
      // We're inside the units tab,
      route = (
        (unitId && doubleClicked)
          // now open the previously-selected unit,
          ? ROUTES.UNIT
          // or stay there to list all units, or a selected unit.
          : ROUTES.UNITS
      );
    } else if (insideUnit) {
      // We're viewing a Unit, so stay there,
      // and optionally select a component in that Unit.
      route = ROUTES.UNIT;
    } else if (componentId) {
      // We're inside the All Content tab, so stay there,
      // and select a component.
      route = ROUTES.COMPONENT;
    } else if (collectionId && doubleClicked) {
      // now open the previously-selected collection
      route = ROUTES.COLLECTION;
    } else if (unitId && doubleClicked) {
      // now open the previously-selected unit
      route = ROUTES.UNIT;
    } else {
      // or stay there to list all content, or optionally select a collection.
      route = ROUTES.HOME;
    }

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
    setComponentId,
    setUnitId,
    setCollectionId,
  ]);

  return {
    navigateTo,
    insideCollection,
    insideCollections,
    insideComponents,
    insideUnits,
    insideUnit,
  };
};
