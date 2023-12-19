import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import initializeStore from '../../store';
import SubsectionCard from './SubsectionCard';

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

const subsection = {
  id: '123',
  displayName: 'Subsection Name',
  published: true,
  releasedToStudents: true,
  visibleToStaffOnly: false,
  visibilityState: 'visible',
  staffOnlyMessage: false,
  hasChanges: false,
};

const onEditSubectionSubmit = jest.fn();

const renderComponent = (props) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <SubsectionCard
        section={section}
        subsection={subsection}
        onOpenPublishModal={jest.fn()}
        onOpenHighlightsModal={jest.fn()}
        onOpenDeleteModal={jest.fn()}
        onEditClick={jest.fn()}
        savingStatus=""
        onEditSubmit={onEditSubectionSubmit}
        onDuplicateSubmit={jest.fn()}
        namePrefix="subsection"
        setIsSubsectionConfigure={jest.fn()}
        {...props}
      >
        <span>children</span>
      </SubsectionCard>
    </IntlProvider>,
  </AppProvider>,
);

describe('<SubsectionCard />', () => {
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

  it('render SubsectionCard component correctly', () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId('subsection-card-header')).toBeInTheDocument();
  });

  it('expands/collapses the card when the subsection button is clicked', async () => {
    const { queryByTestId, findByTestId } = renderComponent();

    const expandButton = await findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandButton);
    expect(queryByTestId('subsection-card__units')).toBeInTheDocument();
    expect(queryByTestId('new-unit-button')).toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(queryByTestId('subsection-card__units')).not.toBeInTheDocument();
    expect(queryByTestId('new-unit-button')).not.toBeInTheDocument();
  });

  it('updates current section, subsection and item', async () => {
    const { findByTestId } = renderComponent();

    const menu = await findByTestId('subsection-card-header__menu');
    fireEvent.click(menu);
    const { currentSection, currentSubsection, currentItem } = store.getState().courseOutline;
    expect(currentSection).toEqual(section);
    expect(currentSubsection).toEqual(subsection);
    expect(currentItem).toEqual(subsection);
  });

  it('title only updates if changed', async () => {
    const { findByTestId } = renderComponent();

    let editButton = await findByTestId('subsection-edit-button');
    fireEvent.click(editButton);
    let editField = await findByTestId('subsection-edit-field');
    fireEvent.blur(editField);

    expect(onEditSubectionSubmit).not.toHaveBeenCalled();

    editButton = await findByTestId('subsection-edit-button');
    fireEvent.click(editButton);
    editField = await findByTestId('subsection-edit-field');
    fireEvent.change(editField, { target: { value: 'some random value' } });
    fireEvent.keyDown(editField, { key: 'Enter', keyCode: 13 });
    expect(onEditSubectionSubmit).toHaveBeenCalled();
  });
});
