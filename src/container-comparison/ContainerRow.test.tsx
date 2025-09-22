import userEvent from '@testing-library/user-event';
import {
  fireEvent, initializeMocks, render, screen,
} from '../testUtils';
import ContainerRow from './ContainerRow';
import messages from './messages';

describe('<ContainerRow />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  test('renders with default props', async () => {
    render(<ContainerRow title="Test title" containerType="subsection" side="Before" />);
    expect(await screen.findByText('Test title')).toBeInTheDocument();
  });

  test('renders with modified state', async () => {
    render(<ContainerRow title="Test title" containerType="subsection" side="Before" state="modified" />);
    expect(await screen.findByText(
      messages.modifiedDiffBeforeMessage.defaultMessage.replace('{blockType}', 'subsection'),
    )).toBeInTheDocument();
  });

  test('renders with removed state', async () => {
    render(<ContainerRow title="Test title" containerType="subsection" side="After" state="removed" />);
    expect(await screen.findByText(
      messages.removedDiffAfterMessage.defaultMessage.replace('{blockType}', 'subsection'),
    )).toBeInTheDocument();
  });

  test('is not clickable when state !== modified', async () => {
    const onClick = jest.fn();
    render(<ContainerRow
      title="Test title"
      containerType="subsection"
      side="Before"
      state="removed"
      onClick={onClick}
    />);
    const titleDiv = await screen.findByText('Test title');
    const card = titleDiv.closest('.clickable');
    expect(card).toBe(null);
  });

  test('calls onClick when clicked', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    render(<ContainerRow
      title="Test title"
      containerType="subsection"
      side="Before"
      state="modified"
      onClick={onClick}
    />);
    const titleDiv = await screen.findByText('Test title');
    const card = titleDiv.closest('.clickable');
    expect(card).not.toBe(null);
    await user.click(card!);
    expect(onClick).toHaveBeenCalled();
  });

  test('calls onClick when pressed enter or space', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    render(<ContainerRow
      title="Test title"
      containerType="subsection"
      side="Before"
      state="modified"
      onClick={onClick}
    />);
    const titleDiv = await screen.findByText('Test title');
    const card = titleDiv.closest('.clickable');
    expect(card).not.toBe(null);
    fireEvent.select(card!);
    await user.keyboard('{enter}');
    expect(onClick).toHaveBeenCalled();
  });

  test('renders with originalName', async () => {
    render(<ContainerRow title="Test title" containerType="subsection" side="Before" state="locallyRenamed" originalName="Modified name" />);
    expect(await screen.findByText(messages.renamedDiffBeforeMessage.defaultMessage.replace('{name}', 'Modified name'))).toBeInTheDocument();
  });

  test('renders with moved state', async () => {
    render(<ContainerRow title="Test title" containerType="subsection" side="After" state="moved" />);
    expect(await screen.findByText(
      messages.movedDiffAfterMessage.defaultMessage.replace('{blockType}', 'subsection'),
    )).toBeInTheDocument();
  });

  test('renders with added state', async () => {
    render(<ContainerRow title="Test title" containerType="subsection" side="After" state="added" />);
    expect(await screen.findByText(
      messages.addedDiffAfterMessage.defaultMessage.replace('{blockType}', 'subsection'),
    )).toBeInTheDocument();
  });
});
