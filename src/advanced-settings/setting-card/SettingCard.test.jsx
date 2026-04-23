import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SettingCard from './SettingCard';
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

const RootWrapper = () => (
  <IntlProvider locale="en">
    <SettingCard
      isOn
      name="settingName"
      setEdited={setEdited}
      setIsEditableState={setIsEditableState}
      showSaveSettingsPrompt={showSaveSettingsPrompt}
      settingData={settingData}
      handleBlur={handleBlur}
      isEditableState
      saveSettingsPrompt={false}
    />
  </IntlProvider>
);

describe('<SettingCard />', () => {
  afterEach(() => jest.clearAllMocks());
  it('renders the setting card with the provided data', () => {
    const { getByText, getByRole } = render(<RootWrapper />);
    const cardTitle = getByText(/Setting Name/i);
    const input = getByRole('textbox');
    expect(cardTitle).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input.value).toBe(settingData.value);
  });
  it('displays the deprecated status when the setting is deprecated', () => {
    const deprecatedSettingData = { ...settingData, deprecated: true };
    const { getByText } = render(
      <IntlProvider locale="en">
        <SettingCard
          isOn
          name="settingName"
          setEdited={setEdited}
          setIsEditableState={setIsEditableState}
          showSaveSettingsPrompt={showSaveSettingsPrompt}
          settingData={deprecatedSettingData}
          handleBlur={handleBlur}
          isEditableState={false}
          saveSettingsPrompt
        />
      </IntlProvider>,
    );
    const deprecatedStatus = getByText(messages.deprecated.defaultMessage);
    expect(deprecatedStatus).toBeInTheDocument();
  });
  it('does not display the deprecated status when the setting is not deprecated', () => {
    const { queryByText } = render(<RootWrapper />);
    expect(queryByText(messages.deprecated.defaultMessage)).toBeNull();
  });
  it('calls setEdited on blur', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<RootWrapper />);
    const inputBox = getByRole('textbox');
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
});
