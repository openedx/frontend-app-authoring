import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { courseSettingsMock } from '../__mocks__';
import messages from './messages';
import DetailsSection from '.';

describe('<DetailsSection />', () => {
  const onChangeMock = jest.fn();
  const RootWrapper = (props) => (
    <IntlProvider locale="en">
      <DetailsSection {...props} />
    </IntlProvider>
  );

  const props = {
    language: courseSettingsMock.languageOptions[1][0],
    languageOptions: courseSettingsMock.languageOptions,
    onChange: onChangeMock,
  };

  it('renders details section successfully', () => {
    const { getByText, getByRole } = render(
      <RootWrapper {...props} />,
    );
    expect(getByText(messages.detailsTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.detailsDescription.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.dropdownHelpText.defaultMessage)).toBeInTheDocument();
    expect(
      getByRole('button', { name: courseSettingsMock.languageOptions[1][1] }),
    ).toBeInTheDocument();
  });

  it('should call onChange if dropdown value changed', () => {
    const { getByRole } = render(<RootWrapper {...props} />);
    const option = getByRole('button', {
      name: courseSettingsMock.languageOptions[1][1],
    });
    fireEvent.click(option);
    const anotherOption = getByRole('button', {
      name: courseSettingsMock.languageOptions[0][1],
    });

    waitFor(() => expect(anotherOption));
    fireEvent.click(anotherOption);
    expect(onChangeMock).toHaveBeenCalledWith(
      courseSettingsMock.languageOptions[0][0],
      'language',
    );
  });

  it('should render an empty option if no option is selected', () => {
    const initialProps = { ...props, language: '' };
    const { getByRole } = render(<RootWrapper {...initialProps} />);
    expect(
      getByRole('button', { name: messages.dropdownEmpty.defaultMessage }),
    ).toBeInTheDocument();
  });
});
