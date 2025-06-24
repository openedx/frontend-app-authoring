import { render, screen, initializeMocks } from '@src/testUtils';
import { FeedbackBox } from './FeedbackBox';

jest.mock('../../../../../../../sharedComponents/ExpandableTextArea', () => jest.fn(({
  id, value, setContent, placeholder,
}) => (
  <textarea id={id} value={value} placeholder={placeholder} onChange={e => setContent(e.target.value)} />
)));

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
  problemType: '',
  setAnswer: jest.fn(),
  setSelectedFeedback: jest.fn(),
  setUnselectedFeedback: jest.fn(),
  images: {},
  learningContextId: 'id',
  isLibrary: false,
};

describe('FeedbackBox', () => {
  beforeEach(() => initializeMocks());

  test('renders as expected with default props', () => {
    render(<FeedbackBox {...props} />);
    expect(screen.getByText(/Show following feedback when A/)).toBeInTheDocument();
  });
  test('renders as expected with a numeric input problem', () => {
    render(<FeedbackBox {...props} problemType="numericalresponse" />);
    expect(screen.getByText(/Show following feedback when A/)).toBeInTheDocument();
    expect(screen.getAllByText(/Show following feedback when A/)).toHaveLength(1);
  });
  test('renders as expected with a multi select problem', () => {
    render(<FeedbackBox {...props} problemType="choiceresponse" />);
    expect(screen.getAllByText(/Show following feedback when A/)).toHaveLength(2);
  });
});
