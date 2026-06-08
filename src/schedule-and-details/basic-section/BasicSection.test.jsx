import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

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

  it('shows the page banner', () => {
    const { getByText } = render(<RootWrapper {...props} />);
    expect(
      getByText(`Promoting your course with ${props.platformName}`),
    ).toBeInTheDocument();
    expect(
      getByText(messages.basicBannerText.defaultMessage),
    ).toBeInTheDocument();
  });
});
