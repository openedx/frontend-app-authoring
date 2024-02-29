import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { enrollmentTrackGroupsMock } from '../__mocks__';
import EnrollmentTrackGroupsSection from '.';

const renderComponent = (props = {}) => render(
  <IntlProvider locale="en">
    <EnrollmentTrackGroupsSection
      availableGroup={enrollmentTrackGroupsMock}
      {...props}
    />
  </IntlProvider>,
);

describe('<EnrollmentTrackGroupsSection />', () => {
  it('renders component correctly', () => {
    const { getByText, getAllByTestId } = renderComponent();
    expect(getByText(enrollmentTrackGroupsMock.name)).toBeInTheDocument();
    expect(getAllByTestId('content-group-card')).toHaveLength(
      enrollmentTrackGroupsMock.groups.length,
    );
  });
});
