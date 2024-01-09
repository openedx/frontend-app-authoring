import MockAdapter from 'axios-mock-adapter';
import { render } from '@testing-library/react';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import initializeStore from '../../store';
import { executeThunk } from '../../utils';
import { fetchCourseSectionVerticalData } from '../data/thunk';
import { getCourseSectionVerticalApiUrl } from '../data/api';
import { courseSectionVerticalMock } from '../__mocks__';
import AddComponent from './AddComponent';
import messages from './messages';

let store;
let axiosMock;
const blockId = '123';

const renderComponent = (props) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <AddComponent {...props} />
    </IntlProvider>
  </AppProvider>,
);

describe('<AddComponent />', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
  });

  it('render AddComponent component correctly', () => {
    const { getByRole } = renderComponent();
    const componentTemplates = courseSectionVerticalMock.component_templates;

    expect(getByRole('heading', { name: messages.title.defaultMessage })).toBeInTheDocument();
    Object.keys(componentTemplates).map((component) => (
      expect(getByRole('button', {
        name: new RegExp(`${messages.buttonText.defaultMessage} ${componentTemplates[component].display_name}`, 'i'),
      })).toBeInTheDocument()
    ));
  });
});
