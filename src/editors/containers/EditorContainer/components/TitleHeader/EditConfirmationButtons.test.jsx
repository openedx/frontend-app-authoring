import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { formatMessage } from '../../../../testUtils';

import EditConfirmationButtons from './EditConfirmationButtons';

describe('EditConfirmationButtons', () => {
  const props = {
    intl: { formatMessage },
    updateTitle: jest.fn().mockName('args.updateTitle'),
    cancelEdit: jest.fn().mockName('args.cancelEdit'),
  };
  describe('snapshot', () => {
    test('snapshot', () => {
      expect(shallow(<EditConfirmationButtons {...props} />).snapshot).toMatchSnapshot();
    });
  });
});
