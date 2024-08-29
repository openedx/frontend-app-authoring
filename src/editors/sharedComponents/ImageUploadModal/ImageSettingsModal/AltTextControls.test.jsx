import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { formatMessage } from '../../../testUtils';
import { AltTextControlsInternal as AltTextControls } from './AltTextControls';

jest.mock('./hooks', () => ({
  onInputChange: (handler) => ({ 'hooks.onInputChange': handler }),
  onCheckboxChange: (handler) => ({ 'hooks.onCheckboxChange': handler }),
}));

describe('AltTextControls', () => {
  const props = {
    isDecorative: true,
    value: 'props.value',
    // inject
    intl: { formatMessage },
  };
  beforeEach(() => {
    props.setValue = jest.fn().mockName('props.setValue');
    props.setIsDecorative = jest.fn().mockName('props.setIsDecorative');
    props.validation = { show: true };
  });
  describe('render', () => {
    test('snapshot: isDecorative=true errorProps.showAltTextSubmissionError=true', () => {
      expect(shallow(<AltTextControls {...props} />).snapshot).toMatchSnapshot();
    });
    test('snapshot: isDecorative=true errorProps.showAltTextSubmissionError=false', () => {
      props.validation.show = false;
      expect(shallow(<AltTextControls {...props} />).snapshot).toMatchSnapshot();
    });
  });
});
