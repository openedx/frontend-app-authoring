import type { ReactNode } from 'react';
import {
  CompetencyAssociationsContext,
  type CompetencyAssociationsContextValue,
} from '../CompetencyAssociationsContext';

/** A full context value with only the fields a test cares about overridden, so
 * component tests can control focus and data without the real provider's HTTP requests.
 */
export const buildMockCompetencyAssociationsContextValue = (
  overrides: Partial<CompetencyAssociationsContextValue> = {},
): CompetencyAssociationsContextValue => ({
  status: 'success',
  error: null,
  focus: null,
  focusGroup: jest.fn(),
  focusRuleBox: jest.fn(),
  notifyCourseExpanded: jest.fn(),
  associateSubsection: jest.fn(),
  isAssociating: false,
  canEditCourse: () => true,
  groupsIndex: undefined,
  systemDefaultProfile: undefined,
  associatedObjectIds: new Set(),
  accessibleCourseGroups: [],
  competencyExternalId: null,
  ...overrides,
});

export interface MockCompetencyAssociationsProviderProps {
  value?: Partial<CompetencyAssociationsContextValue>;
  children: ReactNode;
}

export const MockCompetencyAssociationsProvider = ({ value, children }: MockCompetencyAssociationsProviderProps) => (
  <CompetencyAssociationsContext.Provider value={buildMockCompetencyAssociationsContextValue(value)}>
    {children}
  </CompetencyAssociationsContext.Provider>
);
