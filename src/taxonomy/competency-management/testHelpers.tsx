import type { ReactNode } from 'react';
import {
  CompetencyAssociationsContext,
  type CompetencyAssociationsContextValue,
} from './CompetencyAssociationsContext';

/** Builds a full `CompetencyAssociationsContextValue`, overriding only the
 * fields a given test cares about. Used by component tests below
 * `CompetencyAssociationsProvider` that want to control focus/data state
 * directly, without mocking every HTTP request the real provider would
 * otherwise issue - the provider's own data-fetching and focus mechanics
 * get their own dedicated coverage in `CompetencyAssociationsContext.test.tsx`.
 */
export const buildMockCompetencyAssociationsContextValue = (
  overrides: Partial<CompetencyAssociationsContextValue> = {},
): CompetencyAssociationsContextValue => ({
  tagId: 42,
  focus: null,
  focusGroup: jest.fn(),
  focusRuleBox: jest.fn(),
  notifyCourseExpanded: jest.fn(),
  associateSubsection: jest.fn(),
  updateGroupOperator: jest.fn(),
  updateRuleScore: jest.fn().mockResolvedValue(undefined),
  canEditCourse: () => true,
  groupsQuery: {
    isLoading: false,
    isError: false,
    isSuccess: true,
    data: { groups: [], criteria: [] },
  } as unknown as CompetencyAssociationsContextValue['groupsQuery'],
  profileQuery: {
    isLoading: false,
    isError: false,
    isSuccess: true,
    data: undefined,
  } as unknown as CompetencyAssociationsContextValue['profileQuery'],
  index: undefined,
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

/** A lightly-mocked stand-in for `CompetencyAssociationsProvider` - renders
 * the raw context directly with a hand-built value, instead of the real
 * provider's own data-fetching.
 */
export const MockCompetencyAssociationsProvider = ({ value, children }: MockCompetencyAssociationsProviderProps) => (
  <CompetencyAssociationsContext.Provider value={buildMockCompetencyAssociationsContextValue(value)}>
    {children}
  </CompetencyAssociationsContext.Provider>
);
