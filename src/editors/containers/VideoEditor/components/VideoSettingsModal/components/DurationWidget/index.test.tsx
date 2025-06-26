import React from 'react';
import { render, screen, initializeMocks } from '@src/testUtils';
import { actions, selectors } from '../../../../../../data/redux';
import { formatMessage } from '../../../../../../testUtils';
import { DurationWidgetInternal as DurationWidget, mapStateToProps, mapDispatchToProps } from '.';

describe('DurationWidget', () => {
  describe('render', () => {
    beforeEach(() => initializeMocks());
    test('renders as expected with default props', () => {
      const props = {
        duration: {
          startTime: 0,
          stopTime: 10,
        },
        updateField: jest.fn().mockName('updateField'),
        // inject
        intl: { formatMessage },
      };
      render(<DurationWidget {...props} />);
      expect(screen.getByText('Set a specific section of the video to play.')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
    });
  });

  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    beforeAll(() => {
      selectors.video = {
        // @ts-expect-error: test override for selector
        duration: jest.fn().mockReturnValue({ startTime: 0, stopTime: 10 }),
      };
    });
    test('duration from video.duration', () => {
      expect(
        mapStateToProps(testState).duration,
        // @ts-expect-error: test override for selector
      ).toEqual(selectors.video.duration(testState));
    });
  });

  describe('mapDispatchToProps', () => {
    test('updateField from actions.video.updateField', () => {
      expect(mapDispatchToProps.updateField).toEqual(actions.video.updateField);
    });
  });
});
