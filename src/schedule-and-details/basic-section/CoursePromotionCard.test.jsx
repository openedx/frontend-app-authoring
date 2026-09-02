import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import messages from './messages';
import CoursePromotionCard from './CoursePromotionCard';

describe('<CoursePromotionCard />', () => {
  const RootWrapper = (props) => (
    <IntlProvider locale="en">
      <CoursePromotionCard {...props} />
    </IntlProvider>
  );

  const props = {
    lmsLinkForAboutPage: 'link://to',
    courseDisplayName: 'foo course',
    platformName: 'Your platform name here',
  };

  it('renders the course promotion card', () => {
    const { getByText, getByRole } = render(<RootWrapper {...props} />);
    const inviteButton = getByRole('button', {
      name: messages.basicPromotionButton.defaultMessage,
    });

    expect(getByText(/Course Summary Page/i)).toBeInTheDocument();
    expect(
      getByText(/(for student enrollment and access)/i),
    ).toBeInTheDocument();
    expect(getByText(props.lmsLinkForAboutPage)).toBeInTheDocument();
    expect(inviteButton).toBeInTheDocument();
  });

  it('generates correct invite mailto link', () => {
    const { getByRole } = render(<RootWrapper {...props} />);
    const inviteLink = getByRole('link', {
      name: messages.basicPromotionButton.defaultMessage,
    });
    expect(decodeURIComponent(inviteLink.href)).toEqual(
      `mailto:${process.env.INVITE_STUDENTS_EMAIL_TO}?body=The course ${props.courseDisplayName}, provided by ${props.platformName}, is open for enrollment. Please navigate to this course at ${props.lmsLinkForAboutPage} to enroll.&subject=Enroll in ${props.courseDisplayName}.`,
    );
  });

  it('disables the invite link when not editable', () => {
    const { getByRole, queryByRole } = render(
      <RootWrapper {...props} isEditable={false} />,
    );
    const inviteButton = getByRole('button', {
      name: messages.basicPromotionButton.defaultMessage,
    });

    expect(inviteButton).toBeDisabled();
    expect(
      queryByRole('link', { name: messages.basicPromotionButton.defaultMessage }),
    ).not.toBeInTheDocument();
  });
});
