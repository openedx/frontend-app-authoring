import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { SECTION_BADGE_STATUTES } from '../constants';
import CardHeader from './CardHeader';
import messages from './messages';

const handleExpandMock = jest.fn();

const cardHeaderProps = {
  title: 'Some title',
  sectionStatus: SECTION_BADGE_STATUTES.live,
  isExpanded: true,
  handleExpand: handleExpandMock,
};

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <CardHeader
      {...cardHeaderProps}
      {...props}
    />
  </IntlProvider>,
);

describe('<CardHeader />', () => {
  it('render CardHeader component correctly', () => {
    const { getByText, getByTestId } = renderComponent();

    expect(getByText(cardHeaderProps.title)).toBeInTheDocument();
    expect(getByTestId('section-card-header__expanded-btn')).toBeInTheDocument();
    expect(getByTestId('section-card-header__badge-status')).toBeInTheDocument();
    expect(getByTestId('section-card-header__menu')).toBeInTheDocument();
  });

  it('render status badge as live', () => {
    const { getByText } = renderComponent();
    expect(getByText(messages.statusBadgeLive.defaultMessage)).toBeInTheDocument();
  });

  it('render status badge as published_not_live', () => {
    const { getByText } = renderComponent({
      ...cardHeaderProps,
      sectionStatus: SECTION_BADGE_STATUTES.publishedNotLive,
    });

    expect(getByText(messages.statusBadgePublishedNotLive.defaultMessage)).toBeInTheDocument();
  });

  it('render status badge as staff_only', () => {
    const { getByText } = renderComponent({
      ...cardHeaderProps,
      sectionStatus: SECTION_BADGE_STATUTES.staffOnly,
    });

    expect(getByText(messages.statusBadgeStuffOnly.defaultMessage)).toBeInTheDocument();
  });

  it('render status badge as draft', () => {
    const { getByText } = renderComponent({
      ...cardHeaderProps,
      sectionStatus: SECTION_BADGE_STATUTES.draft,
    });

    expect(getByText(messages.statusBadgeDraft.defaultMessage)).toBeInTheDocument();
  });

  it('calls handleExpanded when button is clicked', () => {
    const { getByTestId } = renderComponent();

    const expandButton = getByTestId('section-card-header__expanded-btn');
    fireEvent.click(expandButton);
    expect(handleExpandMock).toHaveBeenCalled();
  });
});
