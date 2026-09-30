import userEvent from '@testing-library/user-event';
import { initializeMocks, render, screen } from '@src/testUtils';
import GameImageSettingsModal from './GameImageSettingsModal';

describe('GameImageSettingsModal', () => {
  beforeEach(() => {
    initializeMocks();
  });

  // The parent mounts it only while an image is being edited, and keys it per
  // image, so it is open whenever it exists and starts from that image.
  it('is open when mounted and starts as decorative for an image with no alt text', () => {
    render(
      <GameImageSettingsModal
        imageData={{ url: 'http://x/i.png', altText: '' }}
        close={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    expect(screen.getByRole('dialog', { name: 'Image Settings' })).toBeInTheDocument();
    expect(screen.getByLabelText('This image is decorative')).toBeChecked();
  });

  it('starts with the saved alt text for an image that has one', () => {
    render(
      <GameImageSettingsModal
        imageData={{ url: 'http://x/i.png', altText: 'A leaf' }}
        close={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    expect(screen.getByLabelText('This image is decorative')).not.toBeChecked();
    expect(screen.getByDisplayValue('A leaf')).toBeInTheDocument();
  });

  // Closing is the parent's job: it owns which image is being edited.
  it('hands the result to onSave and leaves closing to the parent', async () => {
    const user = userEvent.setup();
    const close = jest.fn();
    const onSave = jest.fn();
    render(
      <GameImageSettingsModal imageData={{ url: 'http://x/i.png', altText: 'A leaf' }} close={close} onSave={onSave} />,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith({ altText: 'A leaf', isDecorative: false });
    expect(close).not.toHaveBeenCalled();
  });

  it('saves typed alt text once the image is no longer marked decorative', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    render(
      <GameImageSettingsModal imageData={{ url: 'http://x/i.png', altText: '' }} close={jest.fn()} onSave={onSave} />,
    );
    await user.click(screen.getByLabelText('This image is decorative'));
    await user.type(screen.getByRole('textbox'), 'A leaf');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith({ altText: 'A leaf', isDecorative: false });
  });

  it('refuses to save an image with no alt text that is not decorative', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    render(
      <GameImageSettingsModal
        imageData={{ url: 'http://x/i.png', altText: 'A leaf' }}
        close={jest.fn()}
        onSave={onSave}
      />,
    );
    await user.clear(screen.getByDisplayValue('A leaf'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Alt text is required for non-decorative images.')).toBeInTheDocument();

    // Typing clears the error, and so does marking the image decorative.
    await user.type(screen.getByRole('textbox'), 'x');
    expect(screen.queryByText('Alt text is required for non-decorative images.')).not.toBeInTheDocument();
    await user.clear(screen.getByRole('textbox'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('Alt text is required for non-decorative images.')).toBeInTheDocument();
    await user.click(screen.getByLabelText('This image is decorative'));
    expect(screen.queryByText('Alt text is required for non-decorative images.')).not.toBeInTheDocument();
  });

  it('lets the author dismiss the missing-alt-text error', async () => {
    const user = userEvent.setup();
    render(
      <GameImageSettingsModal
        imageData={{ url: 'http://x/i.png', altText: 'A leaf' }}
        close={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    await user.clear(screen.getByDisplayValue('A leaf'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Alt text is required for non-decorative images.')).not.toBeInTheDocument();
  });
});
