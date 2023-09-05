import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import initializeStore from '../../store';
import SectionCard from './SectionCard';
import messages from './messages';

// eslint-disable-next-line no-unused-vars
let axiosMock;
let store;

const section = {
  id: '123',
  displayName: 'Section Name',
  published: true,
  releasedToStudents: true,
  visibleToStaffOnly: false,
  visibilityState: 'visible',
  staffOnlyMessage: false,
  highlights: ['highlight 1', 'highlight 2'],
};

const onClickNewSubsectionMock = jest.fn();

const renderComponent = (props) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <SectionCard
        section={section}
        onOpenPublishModal={jest.fn()}
        onOpenHighlightsModal={jest.fn()}
        onClickNewSubsection={onClickNewSubsectionMock}
        onEditClick={jest.fn()}
        savingStatus=""
        onEditSectionSubmit={jest.fn()}
        {...props}
      >
        <span>children</span>
      </SectionCard>
    </IntlProvider>,
  </AppProvider>,
);

describe('<SectionCard />', () => {
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
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  it('render SectionCard component correctly', () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId('section-card-header')).toBeInTheDocument();
    expect(getByTestId('section-card__content')).toBeInTheDocument();
  });

  it('expands/collapses the card when the expand button is clicked', () => {
    const { queryByTestId, getByTestId } = renderComponent();

    const expandButton = getByTestId('section-card-header__expanded-btn');
    fireEvent.click(expandButton);
    expect(queryByTestId('section-card__subsections')).not.toBeInTheDocument();
    expect(queryByTestId('new-subsection-button')).not.toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(queryByTestId('section-card__subsections')).toBeInTheDocument();
    expect(queryByTestId('new-subsection-button')).toBeInTheDocument();
  });

  it('calls the onClickNewSubsection function when the button is clicked', () => {
    const { getByRole } = renderComponent();

    const newSubsectionButton = getByRole('button', { name: messages.newSubsectionButton.defaultMessage });
    fireEvent.click(newSubsectionButton);
    expect(onClickNewSubsectionMock).toHaveBeenCalled();
  });

  it('calls the onNewSubsectionClick function when the button is clicked', () => {
    const { getByRole } = renderComponent();

    const newSubsectionButton = getByRole('button', { name: messages.newSubsectionButton.defaultMessage });
    fireEvent.click(newSubsectionButton);
    expect(onClickNewSubsectionMock).toHaveBeenCalled();
  });
});
