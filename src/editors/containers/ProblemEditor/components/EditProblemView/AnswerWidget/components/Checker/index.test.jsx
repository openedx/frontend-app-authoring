import { shallow } from 'enzyme';
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
    expect(shallow(<Checker {...props} />)).toMatchSnapshot();
  });

  test('with multiple answers', () => {
    expect(shallow(<Checker {...props} hasSingleAnswer={false} />)).toMatchSnapshot();
  });

  test('with disabled', () => {
    expect(shallow(<Checker {...props} disabled />)).toMatchSnapshot();
  });
});
