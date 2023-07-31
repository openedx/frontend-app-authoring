import React from 'react';
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

jest.mock('react-textarea-autosize', () => jest.fn((props) => (
  <textarea
    {...props}
    onFocus={() => {}}
    onBlur={() => {}}
  />
)));

const RootWrapper = () => (
  <IntlProvider locale="en">
    <SettingCard
      intl={{}}
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
    const { getByText, getByLabelText } = render(<RootWrapper />);
    const cardTitle = getByText(/Setting Name/i);
    const input = getByLabelText(/Setting Name/i);
    expect(cardTitle).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input.value).toBe(JSON.stringify(settingData.value, null, 4));
  });
  it('displays the deprecated status when the setting is deprecated', () => {
    const deprecatedSettingData = { ...settingData, deprecated: true };
    const { getByText } = render(
      <IntlProvider locale="en">
        <SettingCard
          intl={{}}
          isOn
          name="settingName"
          setEdited={setEdited}
          setIsEditableState={setIsEditableState}
          showSaveSettingsPrompt={showSaveSettingsPrompt}
          settingData={deprecatedSettingData}
          handleBlur={handleBlur}
          isEditable={false}
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
    const { getByLabelText } = render(<RootWrapper />);
    const inputBox = getByLabelText(/Setting Name/i);
    fireEvent.focus(inputBox);
    userEvent.clear(inputBox);
    userEvent.type(inputBox, '3, 2, 1');
    await waitFor(() => {
      expect(inputBox).toHaveValue('3, 2, 1');
    });
    await (async () => {
      expect(setEdited).toHaveBeenCalled();
      expect(handleBlur).toHaveBeenCalled();
    });
    fireEvent.focusOut(inputBox);
  });
});
