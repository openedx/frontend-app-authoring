import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import HeaderNavigations from './HeaderNavigations';
import messages from './messages';

const handleNewSectionMock = jest.fn();
const handleReIndexMock = jest.fn();
const handleExpandAllMock = jest.fn();

const headerNavigationsActions = {
  handleNewSection: handleNewSectionMock,
  handleReIndex: handleReIndexMock,
  handleExpandAll: handleExpandAllMock,
  lmsLink: '',
};

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <HeaderNavigations
      headerNavigationsActions={headerNavigationsActions}
      isSectionsExpanded={false}
      isDisabledReindexButton={false}
      isReIndexShow
      {...props}
    />
  </IntlProvider>,
);

describe('<HeaderNavigations />', () => {
  it('render HeaderNavigations component correctly', () => {
    const { getByRole } = renderComponent();

    expect(getByRole('button', { name: messages.newSectionButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.reindexButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.expandAllButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.viewLiveButton.defaultMessage })).toBeInTheDocument();
  });

  it('render HeaderNavigations component with isReIndexShow is false correctly', () => {
    const { getByRole, queryByRole } = renderComponent({ isReIndexShow: false });

    expect(getByRole('button', { name: messages.newSectionButton.defaultMessage })).toBeInTheDocument();
    expect(queryByRole('button', { name: messages.reindexButton.defaultMessage })).not.toBeInTheDocument();
    expect(getByRole('button', { name: messages.expandAllButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.viewLiveButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls the correct handlers when clicking buttons', () => {
    const { getByRole } = renderComponent();

    const newSectionButton = getByRole('button', { name: messages.newSectionButton.defaultMessage });
    fireEvent.click(newSectionButton);
    expect(handleNewSectionMock).toHaveBeenCalledTimes(1);

    const reIndexButton = getByRole('button', { name: messages.reindexButton.defaultMessage });
    fireEvent.click(reIndexButton);
    expect(handleReIndexMock).toHaveBeenCalledTimes(1);

    const expandAllButton = getByRole('button', { name: messages.expandAllButton.defaultMessage });
    fireEvent.click(expandAllButton);
    expect(handleExpandAllMock).toHaveBeenCalledTimes(1);
  });

  it('render collapse button correctly', () => {
    const { getByRole } = renderComponent({
      isSectionsExpanded: true,
    });

    expect(getByRole('button', { name: messages.collapseAllButton.defaultMessage })).toBeInTheDocument();
  });

  it('render expand button correctly', () => {
    const { getByRole } = renderComponent({
      isSectionsExpanded: false,
    });

    expect(getByRole('button', { name: messages.expandAllButton.defaultMessage })).toBeInTheDocument();
  });
});
