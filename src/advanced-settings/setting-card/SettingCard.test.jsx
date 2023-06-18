import React from 'react';
import { render } from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { IntlProvider } from 'react-intl';
import SettingCard from './SettingCard';

// Mock the TextareaAutosize component
jest.mock('react-textarea-autosize', () => jest.fn((props) => (
  <textarea
    {...props}
    onFocus={() => {}}
    onBlur={() => {}}
  />
)));

describe('SettingCard', () => {
  const settingData = {
    deprecated: false,
    help: 'This is a help message',
    displayName: 'Setting Name',
  };
  const handleChange = jest.fn();
  afterEach(() => jest.clearAllMocks());
  it('matches the snapshot', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <SettingCard
          intl={{}}
          isOn
          name="settingName"
          onChange={() => {}}
          value="Setting Value"
          settingData={settingData}
        />
      </IntlProvider>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
  it('renders the setting card with the provided data', () => {
    const { getByText, getByLabelText } = render(
      <IntlProvider locale="en">
        <SettingCard
          intl={{}}
          isOn
          name="settingName"
          onChange={handleChange}
          value="Setting Value"
          settingData={settingData}
        />
      </IntlProvider>,
    );
    const cardTitle = getByText('Setting Name');
    const input = getByLabelText('Setting Name');
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
    const deprecatedStatus = getByText('Deprecated');
    expect(deprecatedStatus).toBeInTheDocument();
  });
  it('does not display the deprecated status when the setting is not deprecated', () => {
    const { queryByText } = render(
      <IntlProvider locale="en">
        <SettingCard
          intl={{}}
          isOn
          name="settingName"
          onChange={handleChange}
          value="Setting Value"
          settingData={settingData}
        />
      </IntlProvider>,
    );
    const deprecatedStatus = queryByText('This setting is deprecated');
    expect(deprecatedStatus).toBeNull();
  });
});
