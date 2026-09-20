import {
  fireEvent,
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';
import { TranscriptActionMenu } from './TranscriptMenu';
import messages from './messages';

describe('TranscriptActionMenu', () => {
  beforeEach(() => {
    initializeMocks();
  });

  const renderMenu = (props = {}) =>
    render(
      <TranscriptActionMenu
        language="ar"
        launchDeleteConfirmation={jest.fn()}
        handleTranscript={jest.fn()}
        input={{ click: jest.fn() }}
        {...props}
      />,
    );

  it('calls onEdit with the language and closes the menu', () => {
    const onEdit = jest.fn();
    renderMenu({ onEdit });
    fireEvent.click(screen.getByRole('button', { name: 'Actions dropdown' }));
    fireEvent.click(screen.getByText(messages.editTranscript.defaultMessage));
    expect(onEdit).toHaveBeenCalledWith('ar');
  });

  it('tolerates a missing onEdit handler', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Actions dropdown' }));
    expect(() => fireEvent.click(screen.getByText(messages.editTranscript.defaultMessage))).not.toThrow();
  });
});
