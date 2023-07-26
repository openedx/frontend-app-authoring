import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SettingCard from './SettingCard';
import messages from './messages';

const handleChange = jest.fn();

const settingData = {
  deprecated: false,
  help: 'This is a help message',
  displayName: 'Setting Name',
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
      onChange={handleChange}
      value="Setting Value"
      settingData={settingData}
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
    expect(input.value).toBe('Setting Value');
  });
  it('displays the deprecated status when the setting is deprecated', () => {
    const deprecatedSettingData = { ...settingData, deprecated: true };
    const { getByText } = render(
      <IntlProvider locale="en">
        <SettingCard
          intl={{}}
          isOn
          name="settingName"
          onChange={handleChange}
          value="Setting Value"
          settingData={deprecatedSettingData}
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
});
