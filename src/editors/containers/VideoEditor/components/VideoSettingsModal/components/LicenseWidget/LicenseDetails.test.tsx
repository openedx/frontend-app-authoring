import React from 'react';
import {
  render, screen, initializeMocks,
} from '@src/testUtils';

import { actions } from '../../../../../../data/redux';
import { LicenseDetailsInternal as LicenseDetails, mapStateToProps, mapDispatchToProps } from './LicenseDetails';

jest.mock('../../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: jest.fn().mockName('actions.video.updateField'),
    },
  },
}));

describe('LicenseDetails', () => {
  const props = {
    license: '',
    details: {
      attribution: false,
      noncommercial: false,
      noDerivatives: false,
      shareAlike: false,
    },
    level: 'course',
    updateField: jest.fn().mockName('args.updateField'),
  };

  beforeEach(() => {
    initializeMocks();
  });

  describe('renders', () => {
    test('renders as expected with default props', () => {
      const { container } = render(<LicenseDetails {...props} />);
      const reduxWrapper = (container.firstChild as HTMLElement);
      expect(reduxWrapper?.innerHTML).toBe('');
      expect(screen.queryByText('License Details')).not.toBeInTheDocument();
    });

    test('renders as expected with level set to library', () => {
      render(<LicenseDetails {...props} level="library" />);
      expect(screen.queryByText('License Details')).toBeInTheDocument();
    });

    test('renders as expected with level set to block and license set to select', () => {
      const { container } = render(<LicenseDetails {...props} level="block" license="select" />);
      const reduxWrapper = (container.firstChild as HTMLElement);
      expect(reduxWrapper?.innerHTML).toBe('');
      expect(screen.queryByText('License Details')).not.toBeInTheDocument();
    });

    test('renders as expected with level set to block and license set to all rights reserved', () => {
      render(<LicenseDetails {...props} level="block" license="all-rights-reserved" />);
      expect(screen.queryByText('License Details')).toBeInTheDocument();
      expect(screen.queryByText('You reserve all rights for your work.')).toBeInTheDocument();
    });

    test('renders as expected with level set to block and license set to Creative Commons', () => {
      render(<LicenseDetails {...props} level="block" license="creative-commons" />);
      expect(screen.queryByText('License Details')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Attribution' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Noncommercial' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Share Alike' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'No Derivatives' })).toBeInTheDocument();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('mapStateToProps equals an empty object', () => {
      // @ts-ignore-next-line
      expect(mapStateToProps(testState)).toEqual({});
    });
  });
  describe('mapDispatchToProps', () => {
    const dispatch = jest.fn();
    test('updateField from actions.video.updateField', () => {
      // @ts-ignore-next-line
      expect(mapDispatchToProps.updateField).toEqual(dispatch(actions.video.updateField));
    });
  });
});
