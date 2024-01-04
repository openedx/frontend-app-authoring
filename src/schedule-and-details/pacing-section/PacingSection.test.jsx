import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import messages from './messages';
import PacingSection from '.';

describe('<PacingSection />', () => {
  const onChangeMock = jest.fn();
  const RootWrapper = (props) => (
    <IntlProvider locale="en">
      <PacingSection {...props} />
    </IntlProvider>
  );

  const props = {
    intl: {},
    selfPaced: false,
    startDate: '2023-06-12',
    onChange: onChangeMock,
  };

  it('renders pacing section successfully', () => {
    const { getByText } = render(<RootWrapper {...props} />);
    expect(getByText(messages.pacingTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.pacingDescription.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.pacingRestriction.defaultMessage)).toBeInTheDocument();

    expect(getByText(messages.pacingTypeInstructorLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.pacingTypeInstructorDescription.defaultMessage)).toBeInTheDocument();

    expect(getByText(messages.pacingTypeSelfLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.pacingTypeSelfDescription.defaultMessage)).toBeInTheDocument();
  });

  it('shows radio inputs correctly', () => {
    const { getAllByRole } = render(<RootWrapper {...props} />);
    const radioList = getAllByRole('radio');
    expect(radioList[0].checked).toBeTruthy();
    expect(radioList[0].disabled).toBeTruthy();
    expect(radioList[1].checked).toBeFalsy();
    expect(radioList[1].disabled).toBeTruthy();
  });

  it('shows disabled radio inputs correctly', () => {
    const year = new Date().getFullYear() + 1;
    const pastDate = `${year}-12-31`;
    const initialProps = { ...props, startDate: pastDate };
    const { getAllByRole, queryAllByText } = render(
      <RootWrapper {...initialProps} />,
    );
    const radioList = getAllByRole('radio');
    expect(radioList[0].checked).toBeTruthy();
    expect(radioList[0].disabled).toBeFalsy();
    expect(radioList[1].checked).toBeFalsy();
    expect(radioList[1].disabled).toBeFalsy();
    expect(queryAllByText(messages.pacingRestriction.defaultMessage).length).toBe(0);
  });

  it('should call onChange radio input', () => {
    const pastDate = '2023-12-31';
    const initialProps = { ...props, startDate: pastDate };
    const { getAllByRole } = render(<RootWrapper {...initialProps} />);
    const radioList = getAllByRole('radio');
    expect(radioList[1].checked).toBeFalsy();
    fireEvent.click(radioList[1]);
    expect(onChangeMock).toHaveBeenCalled();
  });
});
