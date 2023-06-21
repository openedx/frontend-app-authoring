import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { IntlProvider } from 'react-intl';

import { CERTIFICATE_DISPLAY_BEHAVIOR, CertificateDisplayRow } from '.';
import { courseDetails } from '../../__mocks__';

describe('<CertificateDisplayRow />', () => {
  const onChangeMock = jest.fn();
  const RootWrapper = (props) => (
    <IntlProvider locale="en">
      <CertificateDisplayRow {...props} />
    </IntlProvider>
  );

  const props = {
    intl: {},
    certificateAvailableDate: courseDetails.certificateAvailableDate,
    availableDateErrorFeedback: '',
    certificatesDisplayBehavior: courseDetails.certificatesDisplayBehavior,
    displayBehaviorErrorFeedback: '',
    onChange: onChangeMock,
  };

  it('renders without crashing', () => {
    const { getByText, getByRole, queryAllByText } = render(
      <RootWrapper {...props} />,
    );
    const buttonReadMore = getByRole('button', {
      name: 'Read more about this setting',
    });
    expect(getByText(/Certificate display behavior/i)).toBeInTheDocument();
    expect(
      getByText(/Certificates are awarded at the end of a course run/i),
    ).toBeInTheDocument();
    expect(buttonReadMore).toBeInTheDocument();
    expect(queryAllByText('Certificate Available Date').length).toBe(0);
  });

  it('shows more text on click button', () => {
    const { getByText, getByRole } = render(<RootWrapper {...props} />);
    const buttonReadMore = getByRole('button', {
      name: 'Read more about this setting',
    });
    fireEvent.click(buttonReadMore);
    expect(getByText(/Immediately upon passing/i)).toBeInTheDocument();
    expect(getByText(/On course end date/i)).toBeInTheDocument();
    expect(getByText(/A date after the course end date/i)).toBeInTheDocument();
  });

  it('toggles different option', () => {
    const { getByText, getByRole } = render(<RootWrapper {...props} />);
    const button = getByRole('button', { name: 'End date of course' });
    fireEvent.click(button);
    const option = getByText(/A date after the course end date/i);
    expect(option).toBeInTheDocument();
    fireEvent.click(option);
    const updatedButtonReadMore = screen.getByRole('button', {
      name: 'A date after the course end date',
    });
    expect(updatedButtonReadMore).toBeInTheDocument();
  });

  it('should show certificate available datepicker', () => {
    const initialProps = {
      ...props,
      certificatesDisplayBehavior: CERTIFICATE_DISPLAY_BEHAVIOR.endWithDate,
    };
    const { getByText } = render(<RootWrapper {...initialProps} />);
    expect(getByText(/Certificate Available Date/i)).toBeInTheDocument();
  });
});
