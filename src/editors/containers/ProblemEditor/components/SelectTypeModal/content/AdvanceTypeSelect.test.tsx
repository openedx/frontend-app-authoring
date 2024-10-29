import 'CourseAuthoring/editors/setupEditorTest';
import { shallow } from '@edx/react-unit-test-utils';

import AdvanceTypeSelect from './AdvanceTypeSelect';

describe('AdvanceTypeSelect', () => {
  const props = {
    selected: 'blankadvanced' as const,
    setSelected: jest.fn().mockName('setSelect'),
  };
  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<AdvanceTypeSelect {...props} />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is circuitschematic', () => {
      expect(
        shallow(<AdvanceTypeSelect {...props} selected="circuitschematic" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is customgrader', () => {
      expect(
        shallow(<AdvanceTypeSelect {...props} selected="customgrader" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is formularesponse', () => {
      expect(
        shallow(<AdvanceTypeSelect {...props} selected="formularesponse" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is imageresponse', () => {
      expect(
        shallow(<AdvanceTypeSelect {...props} selected="imageresponse" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is jsinputresponse', () => {
      expect(
        shallow(<AdvanceTypeSelect {...props} selected="jsinputresponse" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is problemwithhint', () => {
      expect(
        shallow(<AdvanceTypeSelect {...props} selected="problemwithhint" />).snapshot,
      ).toMatchSnapshot();
    });
  });
});
