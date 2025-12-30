import {
  fireEvent, initializeMocks, render, screen,
} from '@src/testUtils';
import messages from './messages';
import HeaderActions, { HeaderActionsProps } from './HeaderActions';

const handleNewSectionMock = jest.fn();

const headerNavigationsActions = {
  handleNewSection: handleNewSectionMock,
  lmsLink: '',
};

const courseActions = {
  draggable: true,
  childAddable: true,
  deletable: true,
  duplicable: true,
};

const renderComponent = (props?: Partial<HeaderActionsProps>) => render(
  <HeaderActions
    actions={headerNavigationsActions}
    courseActions={courseActions}
    {...props}
  />,
);

describe('<HeaderActions />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('render HeaderActions component correctly', async () => {
    renderComponent();

    expect(await screen.findByRole('button', { name: messages.addButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.viewLiveButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.moreActionsButtonAriaLabel.defaultMessage })).toBeInTheDocument();
  });

  it('calls the correct handlers when clicking buttons', async () => {
    renderComponent();

    const addButton = await screen.findByRole('button', { name: messages.addButton.defaultMessage });
    fireEvent.click(addButton);
    expect(handleNewSectionMock).toHaveBeenCalledTimes(1);
  });

  it('disables new section button if course outline fetch fails', async () => {
    renderComponent({
      errors: { outlineIndexApi: { data: 'some error', type: 'serverError' } },
    });

    expect(await screen.findByRole('button', { name: messages.addButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.addButton.defaultMessage })).toBeDisabled();
  });
});
