import {
  fireEvent,
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';
import { buildMockCompetencyAssociationsContextValue, MockCompetencyAssociationsProvider } from '../testHelpers';
import type { CompetencyCriterion } from '../data/types';
import RuleBox from './RuleBox';

const criteria: CompetencyCriterion[] = [
  {
    id: 1,
    objectId: 'block-a',
    competencyCriteriaGroupId: 10,
    ruleProfileId: null,
    ruleTypeOverride: 'grade',
    rulePayloadOverride: { op: 'gte', value: 0.7, scale: 'percent' },
  },
];

const rule = { ruleType: 'grade', rulePayload: { op: 'gte' as const, value: 0.7, scale: 'percent' as const } };

const renderRuleBox = (contextOverrides: Parameters<typeof buildMockCompetencyAssociationsContextValue>[0] = {}) => (
  render(
    <MockCompetencyAssociationsProvider value={contextOverrides}>
      <RuleBox
        groupId={10}
        ruleKey="grade:gte:0.7:percent"
        rule={rule}
        criteria={criteria}
        subsectionNamesByUsageKey={{ 'block-a': 'Subsection A' }}
      />
    </MockCompetencyAssociationsProvider>,
  )
);

describe('<RuleBox />', () => {
  beforeEach(() => {
    initializeMocks();
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the given rule\'s score threshold and its chips', () => {
    renderRuleBox();

    expect(screen.getByText('With a score of 70% or higher')).toBeInTheDocument();
    expect(screen.getByText('Subsection A')).toBeInTheDocument();
  });

  it('calls focusRuleBox with its own groupId/ruleKey when clicked', () => {
    const focusRuleBox = jest.fn();
    renderRuleBox({ focusRuleBox });

    fireEvent.click(screen.getByRole('button'));
    expect(focusRuleBox).toHaveBeenCalledWith(10, 'grade:gte:0.7:percent');
  });

  it('does not call scrollIntoView when not the focused box', () => {
    renderRuleBox({ focus: null });
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('does not call scrollIntoView when a different box is focused', () => {
    renderRuleBox({ focus: { groupId: 10, ruleKey: 'grade:lte:0.5:percent' } });
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrolls itself into view when it is the focused box', () => {
    renderRuleBox({ focus: { groupId: 10, ruleKey: 'grade:gte:0.7:percent' } });
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' });
  });
});
