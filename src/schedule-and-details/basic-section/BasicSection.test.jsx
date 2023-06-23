import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { INVITE_STUDENTS_LINK_ID } from './constants';
import messages from './messages';
import BasicSection from '.';

describe('<BasicSection />', () => {
  const RootWrapper = (props) => (
    <IntlProvider locale="en">
      <BasicSection {...props} />
    </IntlProvider>
  );

  const props = {
    intl: {},
    org: 'foo org',
    courseNumber: 'bar number',
    run: 'foo run',
    lmsLinkForAboutPage: 'link://to',
    marketingEnabled: true,
    courseDisplayName: 'foo course',
    platformName: 'Your platform name here',
  };

  it('renders basic section successfully', () => {
    const { getByText } = render(<RootWrapper {...props} />);
    expect(getByText(messages.basicTitle.defaultMessage)).toBeInTheDocument();
    expect(
      getByText(messages.basicDescription.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByText(messages.courseOrganization.defaultMessage),
    ).toBeInTheDocument();
    expect(getByText(props.org)).toBeInTheDocument();
    expect(getByText(messages.courseNumber.defaultMessage)).toBeInTheDocument();
    expect(getByText(props.courseNumber)).toBeInTheDocument();
    expect(getByText(messages.courseRun.defaultMessage)).toBeInTheDocument();
    expect(getByText(props.run)).toBeInTheDocument();
  });

  it('shows the page banner if the marketingEnabled is true', () => {
    const { getByText, queryAllByText } = render(<RootWrapper {...props} />);
    expect(
      getByText(messages.basicBannerTitle.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByText(messages.basicBannerText.defaultMessage),
    ).toBeInTheDocument();
    expect(queryAllByText('Course summary page').length).toBe(0);
  });

  it('shows the course promotion if the marketingEnabled is false', () => {
    const initialProps = { ...props, marketingEnabled: false };
    const { getByText, getByRole, queryAllByText } = render(
      <RootWrapper {...initialProps} />,
    );
    const inviteButton = getByRole('button', {
      name: messages.basicPromotionButton.defaultMessage,
    });

    expect(getByText(/Course Summary Page/i)).toBeInTheDocument();
    expect(
      getByText(/(for student enrollment and access)/i),
    ).toBeInTheDocument();
    expect(getByText(props.lmsLinkForAboutPage)).toBeInTheDocument();
    expect(inviteButton).toBeInTheDocument();
    expect(queryAllByText(messages.basicBannerTitle.defaultMessage).length).toBe(0);
  });

  it('checks link link to invite', () => {
    const initialProps = { ...props, marketingEnabled: false };
    const { getByTestId } = render(<RootWrapper {...initialProps} />);
    const inviteLink = getByTestId(INVITE_STUDENTS_LINK_ID);
    expect(decodeURIComponent(inviteLink.href)).toEqual(
      `mailto:${process.env.INVITE_STUDENTS_EMAIL_TO}?body=The course ${props.courseDisplayName}, provided by ${props.platformName}, is open for enrollment. Please navigate to this course at ${props.lmsLinkForAboutPage} to enroll.&subject=Enroll in ${props.courseDisplayName}.`,
    );
  });
});
