import { userEvent } from '@testing-library/user-event';
import {
  fireEvent, initializeMocks, render, screen,
} from '@src/testUtils';

import messages from './messages';
import HeaderActions, { HeaderActionsProps } from './HeaderActions';
import { OutlineSidebarProvider } from '../outline-sidebar/OutlineSidebarContext';

const headerNavigationsActions = {
  lmsLink: '',
};

const courseActions = {
  draggable: true,
  childAddable: true,
  deletable: true,
  duplicable: true,
};

const setCurrentPageKeyMock = jest.fn();

jest.mock('../outline-sidebar/OutlineSidebarContext', () => ({
  ...jest.requireActual('../outline-sidebar/OutlineSidebarContext'),
  useOutlineSidebarContext: () => ({
    ...jest.requireActual('../outline-sidebar/OutlineSidebarContext').useOutlineSidebarContext(),
    setCurrentPageKey: setCurrentPageKeyMock,
  }),
}));

const renderComponent = (props?: Partial<HeaderActionsProps>) => render(
  <HeaderActions
    actions={headerNavigationsActions}
    courseActions={courseActions}
    {...props}
  />,
  { extraWrapper: OutlineSidebarProvider },
);

describe('<HeaderActions />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('render HeaderActions component correctly', async () => {
    renderComponent();

    expect(await screen.findByRole('button', { name: messages.addButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.viewLiveButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls the correct handlers when clicking buttons', async () => {
    renderComponent();

    const addButton = await screen.findByRole('button', { name: messages.addButton.defaultMessage });
    fireEvent.click(addButton);
    expect(setCurrentPageKeyMock).toHaveBeenCalledWith('add');
  });

  it('disables new section button if course outline fetch fails', async () => {
    renderComponent({
      errors: { outlineIndexApi: { data: 'some error', type: 'serverError' } },
    });

    expect(await screen.findByRole('button', { name: messages.addButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.addButton.defaultMessage })).toBeDisabled();
  });

  it('should change pages using the dropdown button', async () => {
    renderComponent();

    // Click on the dropdown button
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }));

    // Select the Help option
    const helpButton = screen.getByRole('button', { name: 'Help' });
    await userEvent.click(helpButton);

    // Check if the current page change is called
    expect(setCurrentPageKeyMock).toHaveBeenCalledWith('help');
  });
});
