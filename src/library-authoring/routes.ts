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
  COMPONENTS: '/components/:componentId?',
  COLLECTIONS: '/collections/:collectionId?',
  COMPONENT: '/component/:componentId',
  COLLECTION: '/collection/:collectionId/:componentId?',
  HOME: '/:collectionId?',
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
      componentId,
      // Overwrite the current collectionId param only if one is specified
      ...(collectionId && { collectionId }),
    };
    let route;

    // contentType overrides the current route
    if (contentType === ContentType.components) {
      route = ROUTES.COMPONENTS;
    } else if (contentType === ContentType.collections) {
      route = ROUTES.COLLECTIONS;
    } else if (contentType === ContentType.home) {
      route = ROUTES.HOME;
    } else if (insideCollections) {
      route = (
        (collectionId && collectionId === params.collectionId)
          // Open the previously-selected collection
          ? ROUTES.COLLECTION
          // Otherwise just preview the collection, if specified
          : ROUTES.COLLECTIONS
      );
    } else if (insideCollection) {
      route = ROUTES.COLLECTION;
    } else if (insideComponents) {
      route = ROUTES.COMPONENTS;
    } else if (componentId) {
      route = ROUTES.COMPONENT;
    } else {
      route = (
        (collectionId && collectionId === params.collectionId)
          // Open the previously-selected collection
          ? ROUTES.COLLECTION
          // Otherwise just preview the collection, if specified
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
