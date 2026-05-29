import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import type { UserPartitionInfoTypes, UserPartitionTypes } from '@src/data/types';
import { getCourseContainerChildren } from '@src/course-unit/data/api';
import type { XBlockActionsTypes } from '@src/course-unit/xblock-container-iframe/types';
import { normalizeUserPartitionInfo } from '@src/course-unit/xblock-container-iframe/utils';

const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL;

export type UnitComponentActions = Pick<
XBlockActionsTypes,
'canCopy' | 'canDuplicate' | 'canDelete' | 'canMove' | 'canManageAccess'
>;

export const EMPTY_UNIT_COMPONENT_ACTIONS: UnitComponentActions = {
  canCopy: false,
  canDuplicate: false,
  canDelete: false,
  canMove: false,
  canManageAccess: false,
};

export interface UnitComponent {
  blockId: string;
  blockType: string;
  displayName: string;
  userPartitionInfo?: UserPartitionInfoTypes;
  userPartitions?: UserPartitionTypes[];
  actions: UnitComponentActions;
}

// Shape of one entry in the component_templates array returned by the API
export interface ComponentTemplate {
  type: string;
  displayName: string;
  beta?: boolean;
  templates: Array<{
    boilerplateName?: string;
    category?: string;
    displayName: string;
    supportLevel?: string | boolean;
  }>;
  supportLegend: {
    allowUnsupportedXblocks?: boolean;
    documentationLabel?: string;
    showLegend?: boolean;
  };
}

// Full response from the unit_handler endpoint
export interface UnitHandlerData {
  unitId: string;
  displayName: string;
  components: UnitComponent[];
}

function componentHasPartitionGroupAccess(
  component: Pick<UnitComponent, 'userPartitionInfo' | 'userPartitions'>,
): boolean {
  const partitions = component.userPartitionInfo?.selectablePartitions
    ?? component.userPartitions
    ?? [];
  return partitions.some(
    (partition) => partition.groups?.some((group) => group.selected),
  );
}

export function deriveHasPartitionGroupComponents(
  unit: {
    hasPartitionGroupComponents?: boolean;
    userPartitionInfo?: UserPartitionInfoTypes;
  },
  components?: UnitComponent[],
): boolean {
  const selectedPartitionIndex = unit.userPartitionInfo?.selectedPartitionIndex ?? -1;
  const unitHasDirectPartitionAccess = selectedPartitionIndex !== -1
    && !Number.isNaN(selectedPartitionIndex);

  if (components?.length) {
    if (unitHasDirectPartitionAccess) {
      return unit.hasPartitionGroupComponents ?? false;
    }
    return components.some(componentHasPartitionGroupAccess);
  }

  return unit.hasPartitionGroupComponents ?? false;
}

export function findSectionIdForUnit(
  sectionsList: Array<{
    id: string;
    childInfo?: { children?: Array<{ childInfo?: { children?: Array<{ id: string }> } }> };
  }>,
  unitId: string,
): string | undefined {
  return sectionsList.find((section) => (
    section.childInfo?.children?.some((subsection) => (
      subsection.childInfo?.children?.some((unit) => unit.id === unitId)
    ))
  ))?.id;
}

function mapContainerChildToUnitComponent(child: {
  blockId: string;
  blockType: string;
  name: string;
  userPartitionInfo?: UserPartitionInfoTypes;
  userPartitions?: UserPartitionTypes[];
  actions?: Partial<UnitComponentActions>;
}): UnitComponent {
  return {
    blockId: child.blockId,
    blockType: child.blockType,
    displayName: child.name,
    userPartitionInfo: normalizeUserPartitionInfo(child),
    userPartitions: child.userPartitions,
    actions: {
      canCopy: child.actions?.canCopy ?? false,
      canDuplicate: child.actions?.canDuplicate ?? false,
      canDelete: child.actions?.canDelete ?? false,
      canMove: child.actions?.canMove ?? false,
      canManageAccess: child.actions?.canManageAccess ?? false,
    },
  };
}

/**
 * Get unit components and their available actions via the container children API
 * (same source as the Unit page component menus).
 */
export async function getUnitHandler(unitId: string): Promise<UnitHandlerData> {
  const containerData = await getCourseContainerChildren(unitId);
  return {
    unitId,
    displayName: containerData.displayName,
    components: containerData.children.map(mapContainerChildToUnitComponent),
  };
}

const getContainerHandlerApiUrl = (unitId: string) => (
  `${getStudioBaseUrl()}/api/contentstore/v1/container_handler/${unitId}`
);

/**
 * Fetch component templates for a unit by calling the existing container_handler API.
 * Templates are course-level (identical for all units in a course), so callers
 * should cache the result per courseId rather than per unit.
 */
export async function getComponentTemplates(unitId: string): Promise<ComponentTemplate[]> {
  const { data } = await getAuthenticatedHttpClient().get(getContainerHandlerApiUrl(unitId));
  const camelData = camelCaseObject(data);
  return (camelData.componentTemplates ?? []) as ComponentTemplate[];
}
