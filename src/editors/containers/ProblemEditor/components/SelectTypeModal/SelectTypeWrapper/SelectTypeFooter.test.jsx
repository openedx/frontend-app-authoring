import 'CourseAuthoring/editors/setupEditorTest';
import { shallow } from '@edx/react-unit-test-utils';

import { Button } from '@openedx/paragon';
import { formatMessage } from '../../../../../testUtils';
import SelectTypeFooter from './SelectTypeFooter';
import * as hooks from '../hooks';

jest.mock('../hooks', () => ({
  onSelect: jest.fn().mockName('onSelect'),
}));

describe('SelectTypeFooter', () => {
  const props = {
    onCancel: jest.fn().mockName('onCancel'),
    selected: null,
    // redux
    defaultSettings: {},
    updateField: jest.fn().mockName('UpdateField'),
    // inject
    intl: { formatMessage },
  };

  test('snapshot', () => {
    expect(shallow(<SelectTypeFooter {...props} />).snapshot).toMatchSnapshot();
  });

  describe('behavior', () => {
    let el;
    beforeEach(() => {
      el = shallow(<SelectTypeFooter {...props} />);
    });
    test('close behavior is linked to modal onCancel', () => {
      const expected = props.onCancel;
      expect(el.instance.findByType(Button)[0].props.onClick)
        .toEqual(expected);
    });
    test('select behavior is linked to modal onSelect', () => {
      const expected = hooks.onSelect(props.selected, props.updateField);
      const button = el.instance.findByType(Button);
      expect(button[button.length - 1].props.onClick)
        .toEqual(expected);
    });
  });
});
