import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import ScheduleSidebar from '.';

const mockPathname = '/foo-bar';
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

describe('<ScheduleSidebar />', () => {
  const config = { STUDIO_BASE_URL: 'https://example.com' };
  const courseId = 'course123';
  it('should match the snapshot', () => {
    const tree = renderer
      .create(
        // eslint-disable-next-line react/jsx-no-constructed-context-values
        <AppContext.Provider value={{ config }}>
          <IntlProvider locale="en">
            <ScheduleSidebar
              intl={injectIntl}
              courseId={courseId}
              proctoredExamSettingsUrl="link://to"
            />
          </IntlProvider>
        </AppContext.Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
