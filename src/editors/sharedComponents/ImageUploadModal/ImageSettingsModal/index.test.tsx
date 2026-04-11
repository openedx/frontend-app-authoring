import { initializeMocks, render, screen } from '@src/testUtils';
import { fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import ImageSettingsModal from '.';
import messages from './messages';

describe('ImageSettingsModal', () => {
  const props = {
    isOpen: true,
    selection: {
      altText: 'AlTTExt',
      externalUrl: 'ExtERNALurL',
      url: 'UrL',
    },
    close: jest.fn().mockName('props.close'),
    returnToSelection: jest.fn().mockName('props.returnToSelector'),
    saveToEditor: jest.fn().mockName('props.saveToEditor'),
  };
  const user = userEvent.setup();
  beforeEach(() => {
    initializeMocks();
  });
  test('Test null altText', () => {
    render(<ImageSettingsModal {...props} selection={{ ...props.selection, altText: null }} />);
    expect(screen.getByText('Image Settings')).toBeInTheDocument();
  });
  test('Test clicking replace image', async () => {
    render(<ImageSettingsModal {...props} />);
    await user.click(screen.getByRole('button', { name: /replace image/i }));
    expect(props.returnToSelection).toHaveBeenCalled();
  });
  test('Test clicking cancel', async () => {
    render(<ImageSettingsModal {...props} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(props.close).toHaveBeenCalled();
  });
  describe('Alt Text Editing', () => {
    test('Empty Alt Text raises error if image is nto decorative', async () => {
      render(<ImageSettingsModal {...props} />);
      await user.clear(screen.getByRole('textbox', { name: /alt text/i }));
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(screen.getByText(messages.altTextLocalFeedback.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.altTextError.defaultMessage)).toBeInTheDocument();
      expect(props.saveToEditor).not.toHaveBeenCalled();
    });
    test('Error can be dismissed', async () => {
      render(<ImageSettingsModal {...props} />);
      await user.clear(screen.getByRole('textbox', { name: /alt text/i }));
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(screen.getByText(messages.altTextError.defaultMessage)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(screen.queryByText(messages.altTextError.defaultMessage)).not.toBeInTheDocument();
    });
    test('Empty Alt Text doesn\'t raise error if image is decorative', async () => {
      render(<ImageSettingsModal {...props} />);
      await user.clear(screen.getByRole('textbox', { name: /alt text/i }));
      await user.click(screen.getByRole('checkbox', { name: /decorative/i }));
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(screen.queryByText(messages.altTextLocalFeedback.defaultMessage)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.altTextError.defaultMessage)).not.toBeInTheDocument();
      expect(props.saveToEditor).toHaveBeenCalled();
    });
    test('If alt text is entered it does not raise any error', async () => {
      render(<ImageSettingsModal {...props} />);
      await user.type(screen.getByRole('textbox', { name: /alt text/i }), 'some text');
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(screen.queryByText(messages.altTextLocalFeedback.defaultMessage)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.altTextError.defaultMessage)).not.toBeInTheDocument();
      expect(props.saveToEditor).toHaveBeenCalled();
    });
  });
  describe('Image Dimensions Editing', () => {
    function mockImageLoad(naturalWidth: number, naturalHeight: number) {
      const img = screen.getByRole('img');
      Object.defineProperty(img, 'naturalWidth', { value: naturalWidth });
      Object.defineProperty(img, 'naturalHeight', { value: naturalHeight });
      fireEvent.load(img);
    }

    test('Image dimensions are editable and saved correctly', async () => {
      render(<ImageSettingsModal {...props} />);
      mockImageLoad(1920, 1080);
      await user.type(await screen.findByRole('textbox', { name: /width/i }), '1280');
      await user.type(screen.getByRole('textbox', { name: /height/i }), '720');
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(screen.queryByText(messages.dimensionLocalFeedback.defaultMessage)).not.toBeInTheDocument();
      expect(props.saveToEditor).toHaveBeenCalled();
    });

    test('Image dimensions are editable and saved correctly with percentages', async () => {
      render(<ImageSettingsModal {...props} />);
      mockImageLoad(1920, 1080);
      await user.type(await screen.findByRole('textbox', { name: /width/i }), '75%');
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(screen.queryByText(messages.dimensionLocalFeedback.defaultMessage)).not.toBeInTheDocument();
      expect(props.saveToEditor).toHaveBeenCalled();
    });

    describe('Dimension Locking', () => {
      test('When dimensions are locked it maintains the original ratio', async () => {
        render(<ImageSettingsModal {...props} />);
        mockImageLoad(1920, 1080);
        const widthInput = await screen.findByRole('textbox', { name: /width/i });
        const heightInput = await screen.findByRole('textbox', { name: /height/i });
        await user.clear(widthInput);
        await user.type(widthInput, '1280');
        expect(heightInput).toHaveValue('720');
        await user.clear(heightInput);
        await user.type(heightInput, '900');
        expect(widthInput).toHaveValue('1600');
      });

      test('When dimensions are locked it maintains the original ratio with percentages', async () => {
        render(<ImageSettingsModal {...props} />);
        mockImageLoad(1920, 1080);
        const widthInput = await screen.findByRole('textbox', { name: /width/i });
        const heightInput = await screen.findByRole('textbox', { name: /height/i });
        await user.clear(widthInput);
        await user.type(widthInput, '75%');
        expect(heightInput).toHaveValue('75%');
        await user.clear(heightInput);
        await user.type(heightInput, '90%');
        expect(widthInput).toHaveValue('90%');
      });

      test('When dimensions are not locked it allows any ratio', async () => {
        render(<ImageSettingsModal {...props} />);
        mockImageLoad(1920, 1080);
        await user.click(await screen.findByRole('button', { name: /unlock dimensions/i }));
        const widthInput = await screen.findByRole('textbox', { name: /width/i });
        const heightInput = await screen.findByRole('textbox', { name: /height/i });
        await user.clear(widthInput);
        await user.type(widthInput, '1280');
        expect(heightInput).toHaveValue('1080');
        await user.clear(heightInput);
        await user.type(heightInput, '900');
        expect(widthInput).toHaveValue('1280');
      });
    });
  });
});
