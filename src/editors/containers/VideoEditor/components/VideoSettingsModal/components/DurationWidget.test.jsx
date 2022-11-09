import React from 'react';
import { shallow } from 'enzyme';

import { formatMessage } from '../../../../../../testUtils';
import { DurationWidget } from './DurationWidget';

describe('DurationWidget', () => {
  const props = {
    isError: false,
    subtitle: 'SuBTItle',
    title: 'tiTLE',
    // inject
    intl: { formatMessage },
  };
  describe('render', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<DurationWidget {...props} />),
      ).toMatchSnapshot();
    });
  });
});
