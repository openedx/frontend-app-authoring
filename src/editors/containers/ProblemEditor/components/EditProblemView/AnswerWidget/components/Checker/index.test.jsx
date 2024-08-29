import 'CourseAuthoring/editors/setupEditorTest';
import { shallow } from '@edx/react-unit-test-utils';
import Checker from '.';

const props = {
  hasSingleAnswer: true,
  answer: {
    id: 'A',
    title: 'Answer 1',
    correct: true,
    selectedFeedback: 'some feedback',
  },
  setAnswer: jest.fn(),
};
describe('Checker component', () => {
  test('with single answer', () => {
    expect(shallow(<Checker {...props} />).snapshot).toMatchSnapshot();
  });

  test('with multiple answers', () => {
    expect(shallow(<Checker {...props} hasSingleAnswer={false} />).snapshot).toMatchSnapshot();
  });

  test('with disabled', () => {
    expect(shallow(<Checker {...props} disabled />).snapshot).toMatchSnapshot();
  });
});
