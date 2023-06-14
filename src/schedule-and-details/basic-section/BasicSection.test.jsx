import React from 'react';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
// eslint-disable-next-line import/no-extraneous-dependencies
import { IntlProvider } from 'react-intl';

import { INVITE_STUDENTS_LINK_ID } from './constants';
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

  it('matches the snapshots', () => {
    const tree = renderer.create(<RootWrapper {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders basic section successfully', () => {
    const { getByText } = render(<RootWrapper {...props} />);
    expect(getByText(/Basic information/i)).toBeInTheDocument();
    expect(getByText(/The nuts and bolts of this course/i)).toBeInTheDocument();
    expect(getByText(/Organization/i)).toBeInTheDocument();
    expect(getByText(props.org)).toBeInTheDocument();
    expect(getByText(/Course number/i)).toBeInTheDocument();
    expect(getByText(props.courseNumber)).toBeInTheDocument();
    expect(getByText(/Course run/i)).toBeInTheDocument();
    expect(getByText(props.run)).toBeInTheDocument();
  });

  it('shows the page banner if the marketingEnabled is true', () => {
    const { getByText, queryAllByText } = render(<RootWrapper {...props} />);
    expect(getByText(/Promoting your course with edX/i)).toBeInTheDocument();
    expect(
      getByText(
        /Your course summary page will not be viewable until your course has been announced. To provide content for the page and preview it, follow the instructions provided by your Program Manager. Please note that changes here may take up to a business day to appear on your course summary page./i,
      ),
    ).toBeInTheDocument();
    expect(queryAllByText('Course Summary Page').length).toBe(0);
  });

  it('shows the course promotion if the marketingEnabled is false', () => {
    const initialProps = { ...props, marketingEnabled: false };
    const { getByText, getByRole, queryAllByText } = render(
      <RootWrapper {...initialProps} />,
    );
    const inviteButton = getByRole('button', { name: 'Invite your students' });

    expect(getByText(/Course Summary Page/i)).toBeInTheDocument();
    expect(
      getByText(/(for student enrollment and access)/i),
    ).toBeInTheDocument();
    expect(getByText(props.lmsLinkForAboutPage)).toBeInTheDocument();
    expect(inviteButton).toBeInTheDocument();
    expect(queryAllByText('Promoting your course with edX').length).toBe(0);
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
