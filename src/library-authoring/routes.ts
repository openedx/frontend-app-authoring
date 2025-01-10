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

export const BASE_ROUTE = '/library/:libraryId';

export const ROUTES = {
  // LibraryAuthoringPage routes:
  // * Components tab, with an optionally selected componentId in the sidebar.
  COMPONENTS: '/components/:componentId?',
  // * Collections tab, with an optionally selected collectionId in the sidebar.
  COLLECTIONS: '/collections/:collectionId?',
  // * All Content tab, with an optionally selected componentId in the sidebar.
  COMPONENT: '/component/:componentId',
  // * All Content tab, with an optionally selected collectionId in the sidebar.
  HOME: '/:collectionId?',
  // LibraryCollectionPage route:
  // * with a selected collectionId and/or an optionally selected componentId.
  COLLECTION: '/collection/:collectionId/:componentId?',
};

export enum ContentType {
  home = '',
  components = 'components',
  collections = 'collections',
}

export type NavigateToData = {
  componentId?: string,
  collectionId?: string,
  contentType?: ContentType,
};

export type LibraryRoutesData = {
  insideCollection: PathMatch<string> | null;
  insideCollections: PathMatch<string> | null;
  insideComponents: PathMatch<string> | null;

  // Navigate using the best route from the current location for the given parameters.
  navigateTo: (dict?: NavigateToData) => void;
};

export const useLibraryRoutes = (): LibraryRoutesData => {
  const { pathname } = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const insideCollection = matchPath(BASE_ROUTE + ROUTES.COLLECTION, pathname);
  const insideCollections = matchPath(BASE_ROUTE + ROUTES.COLLECTIONS, pathname);
  const insideComponents = matchPath(BASE_ROUTE + ROUTES.COMPONENTS, pathname);

  const navigateTo = useCallback(({
    componentId,
    collectionId,
    contentType,
  }: NavigateToData = {}) => {
    const routeParams = {
      ...params,
      // Overwrite the current componentId/collectionId params if provided
      ...((componentId !== undefined) && { componentId }),
      ...((collectionId !== undefined) && { collectionId }),
    };
    let route;

    // Providing contentType overrides the current route so we can change tabs.
    if (contentType === ContentType.components) {
      route = ROUTES.COMPONENTS;
    } else if (contentType === ContentType.collections) {
      route = ROUTES.COLLECTIONS;
    } else if (contentType === ContentType.home) {
      route = ROUTES.HOME;
    } else if (insideCollections) {
      // We're inside the Collections tab,
      route = (
        (collectionId && collectionId === params.collectionId)
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
    } else if (componentId) {
      // We're inside the All Content tab, so stay there,
      // and select a component.
      route = ROUTES.COMPONENT;
    } else {
      // We're inside the All Content tab,
      route = (
        (collectionId && collectionId === params.collectionId)
          // now open the previously-selected collection
          ? ROUTES.COLLECTION
          // or stay there to list all content, or optionally select a collection.
          : ROUTES.HOME
      );
    }

    const newPath = generatePath(BASE_ROUTE + route, routeParams);
    navigate({
      pathname: newPath,
      search: searchParams.toString(),
    });
  }, [navigate, params, searchParams, pathname]);

  return {
    navigateTo,
    insideCollection,
    insideCollections,
    insideComponents,
  };
};
