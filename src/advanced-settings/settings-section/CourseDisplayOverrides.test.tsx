import { render, fireEvent, initializeMocks } from '@src/testUtils';
import CourseDisplayOverrides from './CourseDisplayOverrides';
import messages from './messages';
import type { SettingEntry } from '../data/types';

// Mock SettingCard to avoid pulling in CodeMirror and other heavy dependencies.
jest.mock('../setting-card/SettingCard', () => jest.fn(({ name }: { name: string }) => (
  <div data-testid={`setting-card-${name}`}>{name}</div>
)));

const emptyEntry = (name: string): SettingEntry => [name, {
  displayName: name, value: '', help: '', deprecated: false,
}];
const filledEntry = (name: string): SettingEntry => [name, {
  displayName: name, value: 'My Course', help: '', deprecated: false,
}];

const defaultProps = {
  showSaveSettingsPrompt: jest.fn(),
  saveSettingsPrompt: false,
  setEditedSettings: jest.fn(),
  handleSettingBlur: jest.fn(),
  isEditableState: false,
  setIsEditableState: jest.fn(),
};

const renderOverrides = (displaySettingsEntries: SettingEntry[], props = {}) => render(
  <CourseDisplayOverrides
    {...defaultProps}
    displaySettingsEntries={displaySettingsEntries}
    {...props}
  />,
);

describe('<CourseDisplayOverrides />', () => {
  beforeEach(() => { initializeMocks(); });

  it('renders the Course Display Overrides label', () => {
    const { getByText } = renderOverrides([emptyEntry('displayName')]);
    expect(getByText(messages.courseDisplayOverridesLabel.defaultMessage)).toBeInTheDocument();
  });

  it('toggle is off when all fields are empty', () => {
    const { getByRole } = renderOverrides([
      emptyEntry('displayName'),
      emptyEntry('displayCoursenumber'),
      emptyEntry('displayOrganization'),
    ]);
    expect(getByRole('switch')).not.toBeChecked();
  });

  it('toggle is on when at least one field has content', () => {
    const { getByRole } = renderOverrides([
      filledEntry('displayName'),
      emptyEntry('displayCoursenumber'),
      emptyEntry('displayOrganization'),
    ]);
    expect(getByRole('switch')).toBeChecked();
  });

  it('hides nested fields when toggle is off', () => {
    const { queryByTestId } = renderOverrides([
      emptyEntry('displayName'),
      emptyEntry('displayCoursenumber'),
      emptyEntry('displayOrganization'),
    ]);
    expect(queryByTestId('setting-card-displayName')).toBeNull();
  });

  it('shows nested fields when toggle is on', () => {
    const { getByTestId } = renderOverrides([
      filledEntry('displayName'),
      emptyEntry('displayCoursenumber'),
    ]);
    expect(getByTestId('setting-card-displayName')).toBeInTheDocument();
  });

  it('shows nested fields after enabling the toggle', () => {
    const { getByRole, getByTestId } = renderOverrides([
      emptyEntry('displayName'),
    ]);
    fireEvent.click(getByRole('switch'));
    expect(getByTestId('setting-card-displayName')).toBeInTheDocument();
  });

  it('shows the blocked message when trying to disable the toggle while fields have content', () => {
    const { getByRole, getByText } = renderOverrides([
      filledEntry('displayName'),
      emptyEntry('displayCoursenumber'),
    ]);
    // Toggle is currently on — try to turn it off
    fireEvent.click(getByRole('switch'));
    expect(getByText(messages.courseDisplayOverridesBlockedMessage.defaultMessage)).toBeInTheDocument();
  });

  it('does not show the blocked message initially', () => {
    const { queryByText } = renderOverrides([emptyEntry('displayName')]);
    expect(queryByText(messages.courseDisplayOverridesBlockedMessage.defaultMessage)).toBeNull();
  });

  it('allows disabling the toggle when all fields are empty', () => {
    const { getByRole, queryByTestId } = renderOverrides([
      emptyEntry('displayName'),
    ]);
    // Enable first
    fireEvent.click(getByRole('switch'));
    expect(queryByTestId('setting-card-displayName')).toBeInTheDocument();
    // Disable — should work because no content
    fireEvent.click(getByRole('switch'));
    expect(queryByTestId('setting-card-displayName')).toBeNull();
  });
});
