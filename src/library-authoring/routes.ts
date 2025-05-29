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
  // * Sections tab, with an optionally selected sectionId in the sidebar.
  SECTIONS: '/sections/:sectionId?',
  // * Subsections tab, with an optionally selected subsectionId in the sidebar.
  SUBSECTIONS: '/subsections/:subsectionId?',
  // * Units tab, with an optionally selected unitId in the sidebar.
  UNITS: '/units/:unitId?',
  // * All Content tab, with an optionally selected componentId in the sidebar.
  COMPONENT: '/component/:componentId',
  // * All Content tab, with an optionally selected collection or unit in the sidebar.
  HOME: '/:selectedItemId?',
  // LibraryCollectionPage route:
  // * with a selected collectionId and/or an optionally selected componentId.
  COLLECTION: '/collection/:collectionId/:componentId?',
  // LibrarySectionPage route:
  // * with a selected sectionId and/or an optionally selected subsectionId.
  SECTION: '/section/:sectionId/:subsectionId?',
  // LibrarySubsectionPage route:
  // * with a selected subsectionId and/or an optionally selected unitId.
  SUBSECTION: '/subsection/:subsectionId/:unitId?',
  // LibraryUnitPage route:
  // * with a selected unitId and/or an optionally selected componentId.
  UNIT: '/unit/:unitId/:componentId?',
};

export enum ContentType {
  home = '',
  collections = 'collections',
  components = 'components',
  units = 'units',
  sections = 'sections',
  subsections = 'subsections',
}

export const allLibraryPageTabs: ContentType[] = Object.values(ContentType);

export type NavigateToData = {
  componentId?: string,
  collectionId?: string,
  contentType?: ContentType,
  sectionId?: string,
  subsectionId?: string,
  unitId?: string,
  doubleClicked?: boolean,
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

  // Navigate using the best route from the current location for the given parameters.
  navigateTo: (dict?: NavigateToData) => void;
};

export const useLibraryRoutes = (): LibraryRoutesData => {
  const { pathname } = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    setComponentId,
    setSectionId,
    setSubsectionId,
    setUnitId,
    setCollectionId,
  } = useLibraryContext();

  const insideCollection = matchPath(BASE_ROUTE + ROUTES.COLLECTION, pathname);
  const insideCollections = matchPath(BASE_ROUTE + ROUTES.COLLECTIONS, pathname);
  const insideComponents = matchPath(BASE_ROUTE + ROUTES.COMPONENTS, pathname);
  const insideSections = matchPath(BASE_ROUTE + ROUTES.SECTIONS, pathname);
  const insideSection = matchPath(BASE_ROUTE + ROUTES.SECTION, pathname);
  const insideSubsections = matchPath(BASE_ROUTE + ROUTES.SUBSECTIONS, pathname);
  const insideSubsection = matchPath(BASE_ROUTE + ROUTES.SUBSECTION, pathname);
  const insideUnits = matchPath(BASE_ROUTE + ROUTES.UNITS, pathname);
  const insideUnit = matchPath(BASE_ROUTE + ROUTES.UNIT, pathname);

  const navigateTo = useCallback(({
    componentId,
    collectionId,
    sectionId,
    subsectionId,
    unitId,
    contentType,
    doubleClicked,
  }: NavigateToData = {}) => {
    const {
      collectionId: urlCollectionId,
      componentId: urlComponentId,
      sectionId: urlSectionId,
      subsectionId: urlSubsectionId,
      unitId: urlUnitId,
      selectedItemId: urlSelectedItemId,
    } = params;

    const routeParams = {
      ...params,
      // Overwrite the current componentId/collectionId params if provided
      ...((componentId !== undefined) && { componentId }),
      ...((collectionId !== undefined) && { collectionId, selectedItemId: collectionId }),
      ...((sectionId !== undefined) && { sectionId, selectedItemId: sectionId }),
      ...((subsectionId !== undefined) && { subsectionId, selectedItemId: subsectionId }),
      ...((unitId !== undefined) && { unitId, selectedItemId: unitId }),
      ...(contentType === ContentType.home && { selectedItemId: urlCollectionId || urlUnitId }),
      ...(contentType === ContentType.components && { componentId: urlComponentId || urlSelectedItemId }),
      ...(contentType === ContentType.collections && { collectionId: urlCollectionId || urlSelectedItemId }),
      ...(contentType === ContentType.sections && { unitId: urlSectionId || urlSelectedItemId }),
      ...(contentType === ContentType.subsections && { unitId: urlSubsectionId || urlSelectedItemId }),
      ...(contentType === ContentType.units && { unitId: urlUnitId || urlSelectedItemId }),
    };
    let route: string;

    // Update componentId, unitId, collectionId in library context if is not undefined.
    // Ids can be cleared from route by passing in empty string so we need to set it.
    if (componentId !== undefined) {
      setComponentId(componentId);
    }
    if (sectionId !== undefined) {
      setSectionId(sectionId);
    }
    if (subsectionId !== undefined) {
      setSubsectionId(subsectionId);
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
    } else if (contentType === ContentType.sections) {
      route = ROUTES.SECTIONS;
    } else if (contentType === ContentType.subsections) {
      route = ROUTES.SUBSECTIONS;
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
        if (doubleClicked) {
          // if any container is doubleClicked in collections tab
          // Open the selected container page
          if (sectionId) {
            route = ROUTES.SECTION;
          } else if (subsectionId) {
            route = ROUTES.SUBSECTION
          } else if (unitId) {
            route = ROUTES.UNIT;
          } else {
            route = ROUTES.COLLECTION;
          }
        } else {
          // We're viewing a Collection, so stay there,
          // and optionally select a component or container in that collection.
          route = ROUTES.COLLECTION;
        }
    } else if (insideComponents) {
      // We're inside the Components tab, so stay there,
      // optionally selecting a component.
      route = ROUTES.COMPONENTS;
    } else if (insideSections) {
      // We're inside the sections tab,
      route = (
        (sectionId && doubleClicked)
          // now open the previously-selected section,
          ? ROUTES.SECTION
          // or stay there to list all sections, or a selected section.
          : ROUTES.SECTIONS
      );
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
    } else if (insideSubsections) {
      // We're inside the subsections tab,
      route = (
        (subsectionId && doubleClicked)
          // now open the previously-selected subsection,
          ? ROUTES.SUBSECTION
          // or stay there to list all subsections, or a selected subsection.
          : ROUTES.SUBSECTIONS
      );
    } else if (insideSubsection) {
      route = (
        (unitId && doubleClicked)
          // now open the unit,
          ? ROUTES.UNIT
          // We're viewing a subsection, so stay there,
          // and optionally select a unit in that subsection.
          : ROUTES.SUBSECTION
      );
    } else if (insideSection) {
      route = (
        (subsectionId && doubleClicked)
          // now open the subsection,
          ? ROUTES.SUBSECTION
          // We're viewing a section, so stay there,
          // and optionally select a subsection in that section.
          : ROUTES.SECTION
      );
    } else if (componentId) {
      // We're inside the All Content tab, so stay there,
      // and select a component.
      route = ROUTES.COMPONENT;
    } else if (collectionId && doubleClicked) {
      // now open the previously-selected collection
      route = ROUTES.COLLECTION;
    } else if (sectionId && doubleClicked) {
      // now open the previously-selected section
      route = ROUTES.SECTION;
    } else if (subsectionId && doubleClicked) {
      // now open the previously-selected subsection
      route = ROUTES.SUBSECTION;
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
    setSectionId,
    setSubsectionId,
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
