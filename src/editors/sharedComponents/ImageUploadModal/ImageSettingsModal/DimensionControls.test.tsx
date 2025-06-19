import React, { useEffect } from 'react';
import {
  fireEvent, render, screen, waitFor, initializeMocks,
} from '@src/testUtils';
import DimensionControls from './DimensionControls';
import * as hooks from './hooks';

const WrappedDimensionControls = () => {
  const dimensions = hooks.dimensionHooks('altText');

  useEffect(() => {
    dimensions.onImgLoad({ })({ target: { naturalWidth: 1517, naturalHeight: 803 } });
  }, []);

  return <DimensionControls {...dimensions} />;
};

const UnlockedDimensionControls = () => {
  const dimensions = hooks.dimensionHooks('altText');

  useEffect(() => {
    dimensions.onImgLoad({ })({ target: { naturalWidth: 1517, naturalHeight: 803 } });
    dimensions.unlock();
  }, []);

  return <DimensionControls {...dimensions} />;
};

describe('DimensionControls', () => {
  describe('render', () => {
    const props = {
      lockAspectRatio: { width: 4, height: 5 },
      locked: { 'props.locked': 'lockedValue' },
      isLocked: true,
      value: { width: '20', height: '40' },
      setWidth: jest.fn(),
      setHeight: jest.fn(),
      lock: jest.fn(),
      unlock: jest.fn(),
      updateDimensions: jest.fn(),
    };
    beforeEach(() => {
      jest.spyOn(hooks, 'onInputChange').mockImplementation((handler) => ({ 'hooks.onInputChange': handler }));
      initializeMocks();
    });
    afterEach(() => {
      jest.spyOn(hooks, 'onInputChange').mockRestore();
    });
    test('renders component', () => {
      render(<DimensionControls {...props} />);
      expect(screen.getByText('Image Dimensions')).toBeInTheDocument();
    });
    test('renders nothing with null value', () => {
      const reduxProviderWrapper = '<div data-testid="redux-provider"></div>';
      const { container } = render(<DimensionControls {...props} value={null} />);
      expect(screen.queryByText('Image Dimensions')).not.toBeInTheDocument();
      expect(container.innerHTML).toBe(reduxProviderWrapper);
      expect(container.firstChild?.textContent).toBe('');
    });

    test('renders locked and unlocked icon button according to isLocked prop', () => {
      const { rerender } = render(<DimensionControls {...props} isLocked={false} />);
      expect(screen.getByRole('button', { name: 'lock dimensions' })).toBeInTheDocument();
      rerender(<DimensionControls {...props} isLocked />);
      expect(screen.getByRole('button', { name: 'unlock dimensions' })).toBeInTheDocument();
    });
  });

  describe('component tests for dimensions', () => {
    beforeEach(() => {
      initializeMocks();
    });

    it('renders with initial dimensions', () => {
      const { container } = render(<WrappedDimensionControls />);
      const widthInput = container.querySelector('input.form-control');
      expect(widthInput).not.toBeNull();
      expect((widthInput as HTMLInputElement).value).toBe('1517');
    });

    it('resizes dimensions proportionally', async () => {
      const { container } = render(<WrappedDimensionControls />);
      const widthInput = container.querySelector('input.form-control') as HTMLInputElement;
      expect((widthInput as HTMLInputElement).value).toBe('1517');
      fireEvent.change(widthInput, { target: { value: 758 } });
      await waitFor(() => {
        expect((container.querySelectorAll('input.form-control')[0] as HTMLInputElement).value).toBe('758');
      });
      fireEvent.blur(widthInput);
      await waitFor(() => {
        expect((container.querySelectorAll('input.form-control')[0] as HTMLInputElement).value).toBe('758');
        expect((container.querySelectorAll('input.form-control')[1] as HTMLInputElement).value).toBe('401');
      });
    });

    it('resizes only changed dimension when unlocked', async () => {
      const { container } = render(<UnlockedDimensionControls />);
      const widthInput = container.querySelector('input.form-control') as HTMLInputElement;
      expect(widthInput.value).toBe('1517');
      fireEvent.change(widthInput, { target: { value: 758 } });
      await waitFor(() => {
        expect((container.querySelectorAll('input.form-control')[0] as HTMLInputElement).value).toBe('758');
      });
      fireEvent.blur(widthInput);
      await waitFor(() => {
        expect((container.querySelectorAll('input.form-control')[0] as HTMLInputElement).value).toBe('758');
        expect((container.querySelectorAll('input.form-control')[1] as HTMLInputElement).value).toBe('803');
      });
    });
  });
});
