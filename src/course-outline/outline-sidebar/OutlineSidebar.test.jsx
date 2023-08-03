import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../store';
import OutlineSidebar from './OutlineSidebar';
import messages from './messages';

let store;
const mockPathname = '/foo-bar';
const courseId = '123';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const renderComponent = (props) => render(
  <AppProvider store={store} messages={{}}>
    <IntlProvider locale="en">
      <OutlineSidebar courseId={courseId} {...props} />
    </IntlProvider>
  </AppProvider>,
);

describe('<OutlineSidebar />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
  });

  it('render OutlineSidebar component correctly', () => {
    const { getByText } = renderComponent();

    expect(getByText(messages.section_1_title.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.section_1_descriptions_1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.section_1_descriptions_2.defaultMessage)).toBeInTheDocument();

    expect(getByText(messages.section_2_title.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.section_2_descriptions_1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.section_2_link.defaultMessage)).toBeInTheDocument();

    expect(getByText(messages.section_3_title.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.section_3_descriptions_1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.section_3_link.defaultMessage)).toBeInTheDocument();

    expect(getByText(messages.section_4_title.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.section_4_descriptions_1.defaultMessage)).toBeInTheDocument();

    expect(getByText(/To make a section, subsection, or unit unavailable to learners, select the Configure icon for that level, then select the appropriate/i)).toBeInTheDocument();
    expect(getByText(/option. Grades for hidden sections, subsections, and units are not included in grade calculations./i)).toBeInTheDocument();

    expect(getByText(/To hide the content of a subsection from learners after the subsection due date has passed, select the Configure icon for a subsection, then select/i)).toBeInTheDocument();
    expect(getByText(/Grades for the subsection remain included in grade calculations./i)).toBeInTheDocument();

    expect(getByText(messages.section_4_link.defaultMessage)).toBeInTheDocument();
  });
});
