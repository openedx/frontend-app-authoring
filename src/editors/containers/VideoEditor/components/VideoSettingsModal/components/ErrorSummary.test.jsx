import React from 'react';
import { shallow } from 'enzyme';

import { ErrorSummary } from './ErrorSummary';

describe('ErrorSummary', () => {
  const props = {
    error: 'eRrOr',
  };
  describe('render', () => {
    test('snapshots: renders as expected', () => {
      expect(
        shallow(<ErrorSummary {...props} />),
      ).toMatchSnapshot();
    });
  });
});
