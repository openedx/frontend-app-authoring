import { Button } from '@openedx/paragon';
import {
  fireEvent, initializeMocks, render, screen,
} from '@src/testUtils';

import EmptyPlaceholder from './EmptyPlaceholder';
import messages from './messages';

const onCreateNewSectionMock = jest.fn();

const renderComponent = () => render(
  <EmptyPlaceholder>
    <Button onClick={onCreateNewSectionMock}>Create New Section</Button>
  </EmptyPlaceholder>,
);

describe('<EmptyPlaceholder />', () => {
  it('renders EmptyPlaceholder component correctly', async () => {
    initializeMocks();
    renderComponent();

    expect(await screen.findByText(messages.title.defaultMessage)).toBeInTheDocument();
    const addButton = await screen.findByRole('button', { name: 'Create New Section' });
    expect(addButton).toBeInTheDocument();
    fireEvent.click(addButton);
    expect(onCreateNewSectionMock).toHaveBeenCalledTimes(1);
  });
});
