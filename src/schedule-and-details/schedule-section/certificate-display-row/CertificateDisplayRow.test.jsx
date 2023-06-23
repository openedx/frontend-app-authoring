import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { courseDetailsMock } from '../../__mocks__';
import messages from './messages';
import { CERTIFICATE_DISPLAY_BEHAVIOR, CertificateDisplayRow } from '.';

describe('<CertificateDisplayRow />', () => {
  const onChangeMock = jest.fn();
  const RootWrapper = (props) => (
    <IntlProvider locale="en">
      <CertificateDisplayRow {...props} />
    </IntlProvider>
  );

  const props = {
    intl: {},
    certificateAvailableDate: courseDetailsMock.certificateAvailableDate,
    availableDateErrorFeedback: '',
    certificatesDisplayBehavior: courseDetailsMock.certificatesDisplayBehavior,
    displayBehaviorErrorFeedback: '',
    onChange: onChangeMock,
  };

  it('renders without crashing', () => {
    const { getByText, getByRole, queryAllByText } = render(
      <RootWrapper {...props} />,
    );
    const buttonReadMore = getByRole('button', {
      name: messages.certificateDisplayBehaviorToggleTitle.defaultMessage,
    });
    expect(
      getByText(messages.certificateBehaviorLabel.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByText(messages.certificateBehaviorHelpText.defaultMessage),
    ).toBeInTheDocument();
    expect(buttonReadMore).toBeInTheDocument();
    expect(
      queryAllByText(messages.certificateAvailableDateLabel.defaultMessage)
        .length,
    ).toBe(0);
  });

  it('shows more text on click button', () => {
    const { getByText, getByRole } = render(<RootWrapper {...props} />);
    const buttonReadMore = getByRole('button', {
      name: messages.certificateDisplayBehaviorToggleTitle.defaultMessage,
    });
    fireEvent.click(buttonReadMore);
    expect(
      getByText(
        messages.certificateDisplayBehaviorToggleHeading1.defaultMessage,
      ),
    ).toBeInTheDocument();
    expect(
      getByText(
        messages.certificateDisplayBehaviorToggleHeading2.defaultMessage,
      ),
    ).toBeInTheDocument();
    expect(
      getByText(
        messages.certificateDisplayBehaviorToggleHeading3.defaultMessage,
      ),
    ).toBeInTheDocument();
  });

  it('toggles different option', () => {
    const { getByText, getByRole } = render(<RootWrapper {...props} />);
    const button = getByRole('button', {
      name: messages.certificateBehaviorDropdownOption2.defaultMessage,
    });
    fireEvent.click(button);
    const option = getByText(
      messages.certificateBehaviorDropdownOption3.defaultMessage,
    );
    expect(option).toBeInTheDocument();
    fireEvent.click(option);
    const updatedButtonReadMore = screen.getByRole('button', {
      name: messages.certificateBehaviorDropdownOption3.defaultMessage,
    });
    expect(updatedButtonReadMore).toBeInTheDocument();
  });

  it('should show certificate available datepicker', () => {
    const initialProps = {
      ...props,
      certificatesDisplayBehavior: CERTIFICATE_DISPLAY_BEHAVIOR.endWithDate,
    };
    const { getByText } = render(<RootWrapper {...initialProps} />);
    expect(
      getByText(messages.certificateAvailableDateLabel.defaultMessage),
    ).toBeInTheDocument();
  });
});
