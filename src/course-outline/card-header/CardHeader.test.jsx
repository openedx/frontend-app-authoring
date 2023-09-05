import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { SECTION_BADGE_STATUTES } from '../constants';
import CardHeader from './CardHeader';
import messages from './messages';

const onExpandMock = jest.fn();
const onClickMenuButtonMock = jest.fn();
const onClickPublishMock = jest.fn();
const onClickEditMock = jest.fn();

const cardHeaderProps = {
  title: 'Some title',
  sectionStatus: SECTION_BADGE_STATUTES.live,
  isExpanded: true,
  onExpand: onExpandMock,
  onClickMenuButton: onClickMenuButtonMock,
  onClickPublish: onClickPublishMock,
  onClickEdit: onClickEditMock,
  isFormOpen: false,
  onEditSubmit: jest.fn(),
  closeForm: jest.fn(),
  isDisabledEditField: false,
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
    const { getByText, getByTestId, queryByTestId } = renderComponent();

    expect(getByText(cardHeaderProps.title)).toBeInTheDocument();
    expect(getByTestId('section-card-header__expanded-btn')).toBeInTheDocument();
    expect(getByTestId('section-card-header__badge-status')).toBeInTheDocument();
    expect(getByTestId('section-card-header__menu')).toBeInTheDocument();
    expect(queryByTestId('edit field')).not.toBeInTheDocument();
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

  it('check publish menu item is disabled when section status is live or published not live', async () => {
    const { getByText, getByTestId } = renderComponent({
      ...cardHeaderProps,
      sectionStatus: SECTION_BADGE_STATUTES.publishedNotLive,
    });

    const menuButton = getByTestId('section-card-header__menu-button');
    fireEvent.click(menuButton);
    expect(getByText(messages.menuPublish.defaultMessage)).toHaveAttribute('aria-disabled', 'true');
  });

  it('calls handleExpanded when button is clicked', () => {
    const { getByTestId } = renderComponent();

    const expandButton = getByTestId('section-card-header__expanded-btn');
    fireEvent.click(expandButton);
    expect(onExpandMock).toHaveBeenCalled();
  });

  it('calls onClickMenuButton when menu is clicked', () => {
    const { getByTestId } = renderComponent();

    const menuButton = getByTestId('section-card-header__menu-button');
    fireEvent.click(menuButton);
    expect(onClickMenuButtonMock).toHaveBeenCalled();
  });

  it('calls onClickPublish when item is clicked', () => {
    const { getByText, getByTestId } = renderComponent({
      ...cardHeaderProps,
      sectionStatus: SECTION_BADGE_STATUTES.draft,
    });

    const menuButton = getByTestId('section-card-header__menu-button');
    fireEvent.click(menuButton);

    const publishMenuItem = getByText(messages.menuPublish.defaultMessage);
    fireEvent.click(publishMenuItem);
    expect(onClickPublishMock).toHaveBeenCalled();
  });

  it('calls onClickEdit when the button is clicked', () => {
    const { getByTestId } = renderComponent();

    const editButton = getByTestId('edit-button');
    fireEvent.click(editButton);
    expect(onClickEditMock).toHaveBeenCalled();
  });

  it('calls onClickEdit when the button is clicked', () => {
    const { getByTestId } = renderComponent();

    const editButton = getByTestId('edit-button');
    fireEvent.click(editButton);
    expect(onClickEditMock).toHaveBeenCalled();
  });

  it('check is field visible when isFormOpen is true', () => {
    const { getByTestId, queryByTestId } = renderComponent({
      ...cardHeaderProps,
      isFormOpen: true,
    });

    expect(getByTestId('edit field')).toBeInTheDocument();
    expect(queryByTestId('section-card-header__expanded-btn')).not.toBeInTheDocument();
  });

  it('check is field disabled when isDisabledEditField is true', () => {
    const { getByTestId } = renderComponent({
      ...cardHeaderProps,
      isFormOpen: true,
      isDisabledEditField: true,
    });

    expect(getByTestId('edit field')).toBeDisabled();
  });
});
