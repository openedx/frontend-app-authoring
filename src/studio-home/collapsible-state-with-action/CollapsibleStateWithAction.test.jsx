import React from 'react';
import { useSelector } from 'react-redux';
import {
  render, fireEvent, waitFor, act,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { COURSE_CREATOR_STATES } from '../../constants';
import initializeStore from '../../store';
import { executeThunk } from '../../utils';
import { requestCourseCreatorQuery } from '../data/thunks';
import { getRequestCourseCreatorUrl } from '../data/api';
import { studioHomeMock } from '../__mocks__';
import messages from './messages';
import CollapsibleStateWithAction from '.';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

let store; let
  axiosMock;

const {
  studioName,
  studioShortName,
} = studioHomeMock;

const RootWrapper = (props) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <CollapsibleStateWithAction {...props} />
    </IntlProvider>
  </AppProvider>
);

const props = {
  state: COURSE_CREATOR_STATES.unrequested,
};

describe('<CollapsibleStateWithAction />', () => {
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
    axiosMock.onPost(getRequestCourseCreatorUrl()).reply(200, studioHomeMock);
    await executeThunk(requestCourseCreatorQuery(), store.dispatch);
  });

  it('renders collapsible unrequested state successfully closed', () => {
    useSelector.mockReturnValue(studioHomeMock);

    const { getByText, queryByText } = render(<RootWrapper {...props} />);
    expect(getByText(`Becoming a course creator in ${studioShortName}`)).toBeInTheDocument();
    expect(queryByText(`${studioName} is a hosted solution for our xConsortium partners and selected guests.`)).not.toBeInTheDocument();
  });

  it('renders collapsible pending state successfully closed', () => {
    useSelector.mockReturnValue(studioHomeMock);

    const initialState = { ...props, state: COURSE_CREATOR_STATES.pending };
    const { getByText } = render(<RootWrapper {...initialState} />);
    expect(getByText(messages.pendingCollapsibleTitle.defaultMessage)).toBeInTheDocument();
  });

  it('renders collapsible denied state successfully closed', () => {
    useSelector.mockReturnValue(studioHomeMock);

    const initialState = { ...props, state: COURSE_CREATOR_STATES.denied };
    const { getByText } = render(<RootWrapper {...initialState} />);
    expect(getByText(messages.deniedCollapsibleTitle.defaultMessage)).toBeInTheDocument();
  });

  it('renders collapsible denied state successfully opened', () => {
    useSelector.mockReturnValue(studioHomeMock);

    const initialState = { ...props, state: COURSE_CREATOR_STATES.denied };
    const { getByText } = render(<RootWrapper {...initialState} />);
    const container = getByText(messages.deniedCollapsibleTitle.defaultMessage);

    fireEvent.click(container);
    act(async () => {
      await waitFor(() => {
        expect(getByText(messages.deniedCollapsibleState.defaultMessage)).toBeInTheDocument();
        expect(getByText(messages.deniedCollapsibleActionTitle.defaultMessage)).toBeInTheDocument();
      });
    });
  });
});
