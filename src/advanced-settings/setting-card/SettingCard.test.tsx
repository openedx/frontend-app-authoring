import {
  fireEvent,
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';

import SettingCard, { type SettingCardProps } from './SettingCard';
import messages from './messages';

const setEdited = jest.fn();
const showSaveSettingsPrompt = jest.fn();
const setIsEditableState = jest.fn();
const handleBlur = jest.fn();

const settingData = {
  deprecated: false,
  help: 'This is a help message',
  displayName: 'Setting Name',
  value: 'Setting Value',
};

jest.mock('react-textarea-autosize', () =>
  jest.fn((props) => (
    <textarea
      {...props}
      onFocus={() => {}}
    />
  )));

const renderComponent = (props: Partial<SettingCardProps> = {}) =>
  render(
    <SettingCard
      name="settingName"
      setEdited={setEdited}
      setIsEditableState={setIsEditableState}
      showSaveSettingsPrompt={showSaveSettingsPrompt}
      settingData={settingData}
      handleBlur={handleBlur}
      isEditableState
      saveSettingsPrompt={false}
      {...props}
    />,
  );

describe('<SettingCard />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the setting card with the provided data', () => {
    renderComponent();
    const cardTitle = screen.getByText(/Setting Name/i);
    const input = screen.getByLabelText(/Setting Name/i);
    expect(cardTitle).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(JSON.stringify(settingData.value, null, 4));
  });

  it('displays the deprecated status when the setting is deprecated', () => {
    renderComponent({
      settingData: { ...settingData, deprecated: true },
      isEditableState: false,
      saveSettingsPrompt: true,
    });
    expect(screen.getByText(messages.deprecated.defaultMessage)).toBeInTheDocument();
  });

  it('does not display the deprecated status when the setting is not deprecated', () => {
    renderComponent();
    expect(screen.queryByText(messages.deprecated.defaultMessage)).toBeNull();
  });

  it('calls setEdited on blur', async () => {
    const user = userEvent.setup();
    renderComponent();
    const inputBox = screen.getByLabelText(/Setting Name/i);
    fireEvent.focus(inputBox);
    await user.clear(inputBox);
    await user.type(inputBox, '3, 2, 1');
    await waitFor(() => {
      expect(inputBox).toHaveValue('3, 2, 1');
    });
    await user.tab(); // blur off of the input.
    await waitFor(() => {
      expect(setEdited).toHaveBeenCalled();
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  it('disables the setting input when `disabled` is true', () => {
    renderComponent({ disabled: true });
    expect(screen.getByLabelText(/Setting Name/i)).toBeDisabled();
  });
});
