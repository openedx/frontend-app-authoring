import { shallow } from '@edx/react-unit-test-utils';
import { FeedbackBox } from './FeedbackBox';

const answerWithFeedback = {
  id: 'A',
  title: 'Answer 1',
  correct: true,
  selectedFeedback: 'some feedback',
  unselectedFeedback: 'unselectedFeedback',
  problemType: 'sOMepRObleM',
  images: {},
  isLibrary: false,
  learningContextId: 'course+org+run',
};

const props = {
  answer: answerWithFeedback,
  intl: {},
};

describe('FeedbackBox component', () => {
  test('renders as expected with default props', () => {
    expect(shallow(<FeedbackBox {...props} />).snapshot).toMatchSnapshot();
  });
  test('renders as expected with a numeric input problem', () => {
    expect(shallow(<FeedbackBox {...props} problemType="numericalresponse" />).snapshot).toMatchSnapshot();
  });
  test('renders as expected with a multi select problem', () => {
    expect(shallow(<FeedbackBox {...props} problemType="choiceresponse" />).snapshot).toMatchSnapshot();
  });
});
