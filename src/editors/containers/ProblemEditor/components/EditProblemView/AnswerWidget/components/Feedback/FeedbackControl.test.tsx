import React from 'react';
import {
  render, screen, fireEvent, initializeMocks,
} from '../../../../../../../../testUtils';
import FeedbackControl from './FeedbackControl';

jest.mock('../../../../../../../sharedComponents/ExpandableTextArea', () => jest.fn(({
  id, value, setContent, placeholder,
}) => (
  <textarea id={id} value={value} placeholder={placeholder} onChange={e => setContent(e.target.value)} />
)));

const defaultProps = {
  feedback: 'Initial feedback',
  onChange: jest.fn(),
  labelMessage: { id: 'label.id', defaultMessage: 'Feedback for answer {answerId} {boldunderline}' },
  labelMessageBoldUnderline: { id: 'bold.id', defaultMessage: 'Important' },
  answer: { id: 'a1', text: 'Answer 1' },
  type: 'correct',
  images: {},
  isLibrary: false,
  learningContextId: 'lc1',
};

describe('FeedbackControl', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders Form.Label with FormattedMessage and ExpandableTextArea', () => {
    render(<FeedbackControl {...defaultProps} />);
    expect(screen.getByText(/Feedback for answer/)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument();
  });

  it('passes correct props to ExpandableTextArea', () => {
    render(<FeedbackControl {...defaultProps} />);
    const textarea = screen.getByRole('textbox', { name: '' });
    expect(textarea).toHaveAttribute('id', 'correctFeedback-a1');
    expect(textarea).toHaveValue('Initial feedback');
    expect(textarea).toHaveAttribute('placeholder', 'Feedback message');
  });

  it('calls onChange when textarea value changes', () => {
    const onChange = jest.fn();
    render(<FeedbackControl {...defaultProps} onChange={onChange} />);
    const textarea = screen.getByRole('textbox', { name: '' });
    fireEvent.change(textarea, { target: { value: 'Updated feedback' } });
    expect(onChange).toHaveBeenCalledWith('Updated feedback');
  });

  it('renders with different isLibrary, images, and learningContextId', () => {
    render(<FeedbackControl
      {...defaultProps}
      isLibrary
      images={{ img1: 'url' }}
      learningContextId="lc2"
    />);
    expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument();
  });

  it('renders boldunderline content inside FormattedMessage', () => {
    render(<FeedbackControl {...defaultProps} />);
    expect(screen.getByText('Important')).toBeInTheDocument();
  });
});
