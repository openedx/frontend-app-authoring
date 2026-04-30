import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SettingCard from './SettingCard';
import messages from './messages';

// Avoid pulling in CodeMirror for JSON-type cards; SettingCard behaviour is
// what we're testing here, not JsonInput internals.
jest.mock('./inputs/JsonInput', () => jest.fn(() => <div data-testid="json-input" />));

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
  // --- Input type rendering ---

  it('renders a toggle switch for boolean settings', () => {
    const { getByRole } = render(
      <IntlProvider locale="en">
        <SettingCard
          name="selfPaced"
          settingData={{ deprecated: false, help: 'help', displayName: 'Self Paced', value: true }}
          handleBlur={handleBlur}
          setEdited={setEdited}
          showSaveSettingsPrompt={showSaveSettingsPrompt}
          setIsEditableState={setIsEditableState}
          isEditableState={false}
          saveSettingsPrompt={false}
        />
      </IntlProvider>,
    );
    expect(getByRole('switch')).toBeChecked();
  });

  it('renders a number input for numeric settings', () => {
    const { getByRole } = render(
      <IntlProvider locale="en">
        <SettingCard
          name="maxAttempts"
          settingData={{ deprecated: false, help: 'help', displayName: 'Max Attempts', value: 5 }}
          handleBlur={handleBlur}
          setEdited={setEdited}
          showSaveSettingsPrompt={showSaveSettingsPrompt}
          setIsEditableState={setIsEditableState}
          isEditableState={false}
          saveSettingsPrompt={false}
        />
      </IntlProvider>,
    );
    expect(getByRole('textbox')).toHaveValue('5');
  });

  it('renders a select for enum settings', () => {
    const { getByRole } = render(
      <IntlProvider locale="en">
        <SettingCard
          name="showanswer"
          settingData={{ deprecated: false, help: 'help', displayName: 'Show Answer', value: 'always' }}
          handleBlur={handleBlur}
          setEdited={setEdited}
          showSaveSettingsPrompt={showSaveSettingsPrompt}
          setIsEditableState={setIsEditableState}
          isEditableState={false}
          saveSettingsPrompt={false}
        />
      </IntlProvider>,
    );
    expect(getByRole('combobox')).toHaveValue('always');
  });

  it('renders a JSON editor for array/object settings', () => {
    const { getByTestId } = render(
      <IntlProvider locale="en">
        <SettingCard
          name="allowedExtensions"
          settingData={{ deprecated: false, help: 'help', displayName: 'Allowed Extensions', value: ['pdf'] }}
          handleBlur={handleBlur}
          setEdited={setEdited}
          showSaveSettingsPrompt={showSaveSettingsPrompt}
          setIsEditableState={setIsEditableState}
          isEditableState={false}
          saveSettingsPrompt={false}
        />
      </IntlProvider>,
    );
    expect(getByTestId('json-input')).toBeInTheDocument();
  });

  // --- handleImmediateChange: boolean and enum commit on change, not blur ---

  it('calls setEdited immediately when a boolean setting is toggled', () => {
    const { getByRole } = render(
      <IntlProvider locale="en">
        <SettingCard
          name="selfPaced"
          settingData={{ deprecated: false, help: 'help', displayName: 'Self Paced', value: false }}
          handleBlur={handleBlur}
          setEdited={setEdited}
          showSaveSettingsPrompt={showSaveSettingsPrompt}
          setIsEditableState={setIsEditableState}
          isEditableState={false}
          saveSettingsPrompt={false}
        />
      </IntlProvider>,
    );
    fireEvent.click(getByRole('switch'));
    expect(setEdited).toHaveBeenCalled();
    expect(handleBlur).toHaveBeenCalled();
  });

  it('calls setEdited immediately when an enum setting is changed', () => {
    const { getByRole } = render(
      <IntlProvider locale="en">
        <SettingCard
          name="showanswer"
          settingData={{ deprecated: false, help: 'help', displayName: 'Show Answer', value: 'always' }}
          handleBlur={handleBlur}
          setEdited={setEdited}
          showSaveSettingsPrompt={showSaveSettingsPrompt}
          setIsEditableState={setIsEditableState}
          isEditableState={false}
          saveSettingsPrompt={false}
        />
      </IntlProvider>,
    );
    fireEvent.change(getByRole('combobox'), { target: { value: 'never' } });
    expect(setEdited).toHaveBeenCalled();
    expect(handleBlur).toHaveBeenCalled();
  });

  // --- getDisplayValue catch branch ---

  it('falls back to raw value when JSON.parse throws in getDisplayValue', () => {
    // value: undefined → initialValue = JSON.stringify(undefined) = undefined
    // JSON.parse(undefined) throws → catch returns raw (line 61)
    const { getByRole } = render(
      <IntlProvider locale="en">
        <SettingCard
          name="settingName"
          settingData={{ deprecated: false, help: 'help', displayName: 'Setting Name', value: undefined }}
          handleBlur={handleBlur}
          setEdited={setEdited}
          showSaveSettingsPrompt={showSaveSettingsPrompt}
          setIsEditableState={setIsEditableState}
          isEditableState={false}
          saveSettingsPrompt={false}
        />
      </IntlProvider>,
    );
    // StringInput renders with '' as fallback (undefined → default prop value)
    expect(getByRole('textbox')).toHaveValue('');
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
