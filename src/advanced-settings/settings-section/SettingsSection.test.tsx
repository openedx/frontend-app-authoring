import { render, fireEvent, initializeMocks } from '@src/testUtils';
import SettingsSection from './SettingsSection';
import messages from './messages';
import type { SettingEntry } from '../data/types';

// Mock SettingCard to avoid pulling in CodeMirror and other heavy dependencies.
jest.mock(
  '../setting-card/SettingCard',
  () => jest.fn(({ name }: { name: string; }) => <div data-testid={`setting-card-${name}`}>{name}</div>),
);

const defaultProps = {
  category: 'Grading',
  settingsEntries: [] as SettingEntry[],
  showDeprecated: false,
  showSaveSettingsPrompt: jest.fn(),
  saveSettingsPrompt: false,
  setEditedSettings: jest.fn(),
  handleSettingBlur: jest.fn(),
  isEditableState: false,
  setIsEditableState: jest.fn(),
};

const makeEntry = (name: string, deprecated = false): SettingEntry => [
  name,
  { displayName: name, value: 'test', help: '', deprecated },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderSection = (props: Record<string, any> = {}) =>
  render(
    <SettingsSection
      {...defaultProps}
      {...props}
    />,
  );

describe('<SettingsSection />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the category title', () => {
    const { getByText } = renderSection({
      settingsEntries: [makeEntry('noGrade')],
    });
    expect(getByText(messages.categoryGrading.defaultMessage)).toBeInTheDocument();
  });

  it('renders a SettingCard for each visible setting', () => {
    const { getByTestId } = renderSection({
      settingsEntries: [makeEntry('noGrade'), makeEntry('showCorrectness')],
    });
    expect(getByTestId('setting-card-noGrade')).toBeInTheDocument();
    expect(getByTestId('setting-card-showCorrectness')).toBeInTheDocument();
  });

  it('hides deprecated settings when showDeprecated is false', () => {
    const { queryByTestId } = renderSection({
      settingsEntries: [makeEntry('noGrade'), makeEntry('oldSetting', true)],
      showDeprecated: false,
    });
    expect(queryByTestId('setting-card-noGrade')).toBeInTheDocument();
    expect(queryByTestId('setting-card-oldSetting')).toBeNull();
  });

  it('shows deprecated settings when showDeprecated is true', () => {
    const { getByTestId } = renderSection({
      settingsEntries: [makeEntry('noGrade'), makeEntry('oldSetting', true)],
      showDeprecated: true,
    });
    expect(getByTestId('setting-card-noGrade')).toBeInTheDocument();
    expect(getByTestId('setting-card-oldSetting')).toBeInTheDocument();
  });

  it('renders nothing when all settings are deprecated and showDeprecated is false', () => {
    const { queryByText, queryByRole } = renderSection({
      settingsEntries: [makeEntry('oldSetting', true)],
      showDeprecated: false,
    });
    expect(queryByText(messages.categoryGrading.defaultMessage)).toBeNull();
    expect(queryByRole('button')).toBeNull();
  });

  it('collapses the section when the trigger is clicked', () => {
    const { getByRole } = renderSection({
      settingsEntries: [makeEntry('noGrade')],
    });
    const trigger = getByRole('button');
    // Section is open by default
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Click the trigger to collapse
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders subcategory headers when a subcategoryMap is provided', () => {
    const { getByText } = renderSection({
      settingsEntries: [makeEntry('maxAttempts'), makeEntry('videoAutoAdvance')],
      subcategoryMap: { maxAttempts: 'Problems', videoAutoAdvance: 'Video' },
      subcategoryOrder: ['Problems', 'Video'],
    });
    expect(getByText(messages.subcategoryProblems.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.subcategoryVideo.defaultMessage)).toBeInTheDocument();
  });
});
