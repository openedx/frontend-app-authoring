import userEvent from '@testing-library/user-event';

import {
  fireEvent, initializeMocks, render, screen, waitFor,
} from '@src/testUtils';
import HeaderNavigations, { HeaderNavigationsProps } from './HeaderNavigations';
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

const courseActions = {
  draggable: true,
  childAddable: true,
  deletable: true,
  duplicable: true,
};

const renderComponent = (props?: Partial<HeaderNavigationsProps>) => render(
  <HeaderNavigations
    headerNavigationsActions={headerNavigationsActions}
    isSectionsExpanded={false}
    isDisabledReindexButton={false}
    isReIndexShow
    hasSections
    courseActions={courseActions}
    {...props}
  />,
);

describe('<HeaderNavigations />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('render HeaderNavigations component correctly', async () => {
    renderComponent();

    expect(await screen.findByRole('button', { name: messages.newSectionButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.reindexButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.expandAllButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.viewLiveButton.defaultMessage })).toBeInTheDocument();
  });

  it('render HeaderNavigations component with isReIndexShow is false correctly', async () => {
    renderComponent({ isReIndexShow: false });

    expect(await screen.findByRole('button', { name: messages.newSectionButton.defaultMessage })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages.reindexButton.defaultMessage })).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.expandAllButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.viewLiveButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls the correct handlers when clicking buttons', async () => {
    renderComponent();

    const newSectionButton = await screen.findByRole('button', { name: messages.newSectionButton.defaultMessage });
    fireEvent.click(newSectionButton);
    expect(handleNewSectionMock).toHaveBeenCalledTimes(1);

    const reIndexButton = await screen.findByRole('button', { name: messages.reindexButton.defaultMessage });
    fireEvent.click(reIndexButton);
    expect(handleReIndexMock).toHaveBeenCalledTimes(1);

    const expandAllButton = await screen.findByRole('button', { name: messages.expandAllButton.defaultMessage });
    fireEvent.click(expandAllButton);
    expect(handleExpandAllMock).toHaveBeenCalledTimes(1);
  });

  it('render collapse button correctly', async () => {
    renderComponent({
      isSectionsExpanded: true,
    });

    expect(await screen.findByRole('button', { name: messages.collapseAllButton.defaultMessage })).toBeInTheDocument();
  });

  it('render expand button correctly', async () => {
    renderComponent({
      isSectionsExpanded: false,
    });

    expect(await screen.findByRole('button', { name: messages.expandAllButton.defaultMessage })).toBeInTheDocument();
  });

  it('render collapse button correctly', async () => {
    renderComponent({
      isSectionsExpanded: true,
    });

    expect(await screen.findByRole('button', { name: messages.collapseAllButton.defaultMessage })).toBeInTheDocument();
  });

  it('render expand button correctly', async () => {
    renderComponent({
      isSectionsExpanded: false,
    });

    expect(await screen.findByRole('button', { name: messages.expandAllButton.defaultMessage })).toBeInTheDocument();
  });

  it('render reindex button tooltip correctly', async () => {
    const user = userEvent.setup();
    renderComponent({
      isDisabledReindexButton: false,
    });
    await user.hover(await screen.findByRole('button', { name: messages.reindexButton.defaultMessage }));
    await waitFor(async () => {
      expect(await screen.findByText(messages.reindexButtonTooltip.defaultMessage)).toBeInTheDocument();
    });
  });

  it('not render reindex button tooltip when button is disabled correctly', async () => {
    const user = userEvent.setup();
    renderComponent({
      isDisabledReindexButton: true,
    });
    await user.pointer({
      target: (await screen.findByRole('button', { name: messages.reindexButton.defaultMessage })),
    });
    await waitFor(() => {
      expect(screen.queryByText(messages.reindexButtonTooltip.defaultMessage)).not.toBeInTheDocument();
    });
  });

  it('disables new section button if course outline fetch fails', async () => {
    renderComponent({
      errors: { outlineIndexApi: { data: 'some error', type: 'serverError' } },
    });

    expect(await screen.findByRole('button', { name: messages.newSectionButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.newSectionButton.defaultMessage })).toBeDisabled();
  });
});
