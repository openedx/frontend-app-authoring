import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import initializeStore from '../../store';
import SectionCard from './SectionCard';
import cardHeaderMessages from '../card-header/messages';

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
  hasChanges: false,
  highlights: ['highlight 1', 'highlight 2'],
};

const onEditSectionSubmit = jest.fn();

const renderComponent = (props) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <SectionCard
        section={section}
        onOpenPublishModal={jest.fn()}
        onOpenHighlightsModal={jest.fn()}
        onOpenDeleteModal={jest.fn()}
        savingStatus=""
        onEditSectionSubmit={onEditSectionSubmit}
        onDuplicateSubmit={jest.fn()}
        isSectionsExpanded
        onNewSubsectionSubmit={jest.fn()}
        setIsSubsectionConfigure={jest.fn()}
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

  it('title only updates if changed', async () => {
    const { findByTestId } = renderComponent();

    let editButton = await findByTestId('section-edit-button');
    fireEvent.click(editButton);
    let editField = await findByTestId('section-edit-field');
    fireEvent.blur(editField);

    expect(onEditSectionSubmit).not.toHaveBeenCalled();

    editButton = await findByTestId('section-edit-button');
    fireEvent.click(editButton);
    editField = await findByTestId('section-edit-field');
    fireEvent.change(editField, { target: { value: 'some random value' } });
    fireEvent.blur(editField);
    expect(onEditSectionSubmit).toHaveBeenCalled();
  });

  it('renders live status', async () => {
    const { findByText } = renderComponent();
    expect(await findByText(cardHeaderMessages.statusBadgeLive.defaultMessage)).toBeInTheDocument();
  });

  it('renders published but live status', async () => {
    const { findByText } = renderComponent({
      section: {
        ...section,
        published: true,
        releasedToStudents: false,
        visibleToStaffOnly: false,
        visibilityState: 'visible',
        staffOnlyMessage: false,
      },
    });
    expect(await findByText(cardHeaderMessages.statusBadgePublishedNotLive.defaultMessage)).toBeInTheDocument();
  });

  it('renders staff status', async () => {
    const { findByText } = renderComponent({
      section: {
        ...section,
        published: false,
        releasedToStudents: false,
        visibleToStaffOnly: true,
        visibilityState: 'staff_only',
        staffOnlyMessage: true,
      },
    });
    expect(await findByText(cardHeaderMessages.statusBadgeStaffOnly.defaultMessage)).toBeInTheDocument();
  });

  it('renders draft status', async () => {
    const { findByText } = renderComponent({
      section: {
        ...section,
        published: false,
        releasedToStudents: false,
        visibleToStaffOnly: false,
        visibilityState: 'staff_only',
        staffOnlyMessage: false,
      },
    });
    expect(await findByText(cardHeaderMessages.statusBadgeDraft.defaultMessage)).toBeInTheDocument();
  });
});
