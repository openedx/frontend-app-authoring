import React from 'react';
import {
  render, screen, initializeMocks, fireEvent,
} from '@src/testUtils';
import { useDispatch } from 'react-redux';
import { actions } from '../../../../../../data/redux';
import LicenseDetails from './LicenseDetails';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('../../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: jest.fn().mockImplementation((payload) => ({
        type: 'video/updateField',
        payload,
      })),
    },
  },
}));

describe('LicenseDetails', () => {
  const mockDispatch = jest.fn();
  const mockUpdateField = actions.video.updateField as unknown as jest.Mock;

  const props = {
    license: '',
    details: {
      attribution: false,
      noncommercial: false,
      noDerivatives: false,
      shareAlike: false,
    },
    level: 'course',
  };

  beforeEach(() => {
    initializeMocks();
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  describe('renders', () => {
    test('renders as expected with default props', () => {
      const { container } = render(<LicenseDetails {...props} />);
      const reduxWrapper = container.firstChild as HTMLElement;
      expect(reduxWrapper?.innerHTML).toBe('');
      expect(screen.queryByText('License Details')).not.toBeInTheDocument();
    });

    test('renders as expected with level set to library', () => {
      render(<LicenseDetails {...props} level="library" />);
      expect(screen.queryByText('License Details')).toBeInTheDocument();
    });

    test('renders as expected with level set to block and license set to select', () => {
      const { container } = render(<LicenseDetails {...props} level="block" license="select" />);
      const reduxWrapper = container.firstChild as HTMLElement;
      expect(reduxWrapper?.innerHTML).toBe('');
      expect(screen.queryByText('License Details')).not.toBeInTheDocument();
    });

    test('clicking checkbox dispatches updateField', () => {
      render(<LicenseDetails {...props} level="block" license="creative-commons" />);

      const checkbox = screen.getByRole('checkbox', { name: 'Noncommercial' });
      fireEvent.click(checkbox);

      const expectedPayload = {
        licenseDetails: {
          ...props.details,
          noncommercial: true,
        },
      };

      expect(mockUpdateField).toHaveBeenCalledWith(expectedPayload);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'video/updateField',
        payload: expectedPayload,
      });
    });

    test('clicking ShareAlike disables NoDerivatives', () => {
      render(<LicenseDetails
        {...props}
        level="block"
        license="creative-commons"
        details={{ ...props.details, noDerivatives: true }}
      />);

      const shareAlikeCheckbox = screen.getByRole('checkbox', { name: 'Share Alike' });
      fireEvent.click(shareAlikeCheckbox);

      const expectedPayload = {
        licenseDetails: {
          attribution: false,
          noncommercial: false,
          shareAlike: true,
          noDerivatives: false,
        },
      };

      expect(mockUpdateField).toHaveBeenCalledWith(expectedPayload);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'video/updateField',
        payload: expectedPayload,
      });
    });
  });
});
