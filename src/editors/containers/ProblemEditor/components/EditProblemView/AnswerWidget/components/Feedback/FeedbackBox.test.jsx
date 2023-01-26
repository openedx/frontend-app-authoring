import { shallow } from 'enzyme';
import { FeedbackBox } from './FeedbackBox';

const answerWithFeedback = {
  id: 'A',
  title: 'Answer 1',
  correct: true,
  selectedFeedback: 'some feedback',
  unselectedFeedback: 'unselectedFeedback',
};

const props = {
  answer: answerWithFeedback,
  intl: {},
};

describe('FeedbackBox component', () => {
  test('renders', () => {
    expect(shallow(<FeedbackBox {...props} />)).toMatchSnapshot();
  });
});
