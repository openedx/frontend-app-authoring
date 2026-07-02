import { render, initializeMocks, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import EmptyPlaceholder from './EmptyPlaceholder';
import messages from './messages';

const onCreateNewTextbookMock = jest.fn();

const renderComponent = () =>
  render(
    <EmptyPlaceholder onCreateNewTextbook={onCreateNewTextbookMock} />,
  );

describe('<EmptyPlaceholder />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders EmptyPlaceholder component correctly', () => {
    renderComponent();

    expect(screen.getByText(messages.title.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.button.defaultMessage })).toBeInTheDocument();
  });

  it('calls the onCreateNewTextbook function when the button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const addButton = screen.getByRole('button', { name: messages.button.defaultMessage });
    await user.click(addButton);
    expect(onCreateNewTextbookMock).toHaveBeenCalledTimes(1);
  });
});
