import { shallow } from '@edx/react-unit-test-utils';
import FeedbackControl from './FeedbackControl';

const answerWithFeedback = {
  id: 'A',
  title: 'Answer 1',
  correct: true,
  selectedFeedback: 'some feedback',
  unselectedFeedback: 'unselectedFeedback',
};

const props = {
  answer: answerWithFeedback,
  intl: { formatMessage: jest.fn() },
  setAnswer: jest.fn(),
  feedback: 'feedback',
  onChange: jest.fn(),
  labelMessage: 'msg',
  labelMessageBoldUnderline: 'msg',
};

describe('FeedbackControl component', () => {
  test('renders', () => {
    expect(shallow(<FeedbackControl {...props} />).snapshot).toMatchSnapshot();
  });
});
