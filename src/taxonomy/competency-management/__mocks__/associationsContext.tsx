import type { ReactNode } from 'react';
import {
  CompetencyAssociationsContext,
  type CompetencyAssociationsContextBase,
  type CompetencyAssociationsContextValue,
} from '../CompetencyAssociationsContext';
import { buildCompetencyCriteriaGroupsIndex } from '../utils';
import type { CompetencyCriteriaGroupsIndex } from '../utils';
import type { CompetencyRuleProfile } from '../data/types';
import { singleGroupResponse, systemDefaultProfile } from './criteriaGroups';

export type MockCompetencyAssociationsOverrides = Partial<CompetencyAssociationsContextBase> & {
  status?: CompetencyAssociationsContextValue['status'];
  groupsIndex?: CompetencyCriteriaGroupsIndex;
  systemDefaultProfile?: CompetencyRuleProfile;
};

/** A full context value with only the fields a test cares about overridden, so
 * component tests can control focus and data without the real provider's HTTP requests.
 * The default is a loaded context over `singleGroupResponse` and the system default profile;
 * `groupsIndex` and `systemDefaultProfile` are dropped unless `status` is `'success'`.
 */
export const buildMockCompetencyAssociationsContextValue = (
  overrides: MockCompetencyAssociationsOverrides = {},
): CompetencyAssociationsContextValue => {
  const shared: CompetencyAssociationsContextBase = {
    error: null,
    focus: null,
    placeholder: { parentRuleGroupId: null, logicOperator: 'OR', rulePayload: null },
    hasPlaceholder: false,
    addPlaceholderRuleBox: jest.fn(),
    addPlaceholderGroup: jest.fn(),
    setPlaceholderLogicOperator: jest.fn(),
    setPlaceholderRulePayload: jest.fn(),
    focusGroup: jest.fn(),
    focusRuleBox: jest.fn(),
    notifyCourseExpanded: jest.fn(),
    associateSubsection: jest.fn(),
    updateGroupOperator: jest.fn(),
    updateRuleScore: jest.fn().mockResolvedValue(undefined),
    isAssociating: false,
    hasPermissionsError: false,
    expansionCountByCourseId: {},
    canEditCourse: () => true,
    associatedObjectIds: new Set(),
    accessibleCourseGroups: [],
    competencyExternalId: null,
    ...overrides,
  };
  if (overrides.status === 'pending' || overrides.status === 'error') {
    return { ...shared, status: overrides.status, groupsIndex: undefined, systemDefaultProfile: undefined };
  }
  return {
    ...shared,
    status: 'success',
    groupsIndex: overrides.groupsIndex ?? buildCompetencyCriteriaGroupsIndex(singleGroupResponse),
    systemDefaultProfile: overrides.systemDefaultProfile ?? systemDefaultProfile,
  };
};

export interface MockCompetencyAssociationsProviderProps {
  value?: MockCompetencyAssociationsOverrides;
  children: ReactNode;
}

export const MockCompetencyAssociationsProvider = ({ value, children }: MockCompetencyAssociationsProviderProps) => (
  <CompetencyAssociationsContext.Provider value={buildMockCompetencyAssociationsContextValue(value)}>
    {children}
  </CompetencyAssociationsContext.Provider>
);
