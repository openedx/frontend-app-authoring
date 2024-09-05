import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { formatMessage } from '../../../../../../testUtils';
import { HintRowInternal as HintRow } from './HintRow';

describe('HintRow', () => {
  const props = {
    value: 'hint_1',
    handleChange: jest.fn(),
    handleDelete: jest.fn(),
    id: '0',
    intl: { formatMessage },
    images: {},
    isLibrary: false,
    learningContextId: 'course+org+run',
  };

  describe('snapshot', () => {
    test('snapshot: renders hints row', () => {
      expect(shallow(<HintRow {...props} />).snapshot).toMatchSnapshot();
    });
  });
});
