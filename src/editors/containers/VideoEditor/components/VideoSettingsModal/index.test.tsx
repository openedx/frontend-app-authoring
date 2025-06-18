import {
  screen, fireEvent, initializeMocks,
} from '@src/testUtils';
import editorRender from '@src/editors/editorTestRender';
import VideoSettingsModal from '.';

const defaultProps = {
  onReturn: jest.fn(),
  isLibrary: false,
  onClose: jest.fn(),
  useNewVideoUploadsPage: true,
};

const renderComponent = (overrideProps = {}) => {
  const customInitialState = {
    app: {
      videos: [],
      learningContextId: 'course-v1:test+test+test',
      blockId: 'some-block-id',
      courseDetails: {},
    },
  };

  initializeMocks();

  return {
    ...editorRender(
      <VideoSettingsModal {...defaultProps} {...overrideProps} />,
      { initialState: customInitialState },
    ),
  };
};

describe('<VideoSettingsModal />', () => {
  beforeEach(async () => {
    window.scrollTo = jest.fn();
  });

  it('renders back button when useNewVideoUploadsPage is true and isLibrary is false', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /replace video/i })).toBeInTheDocument();
  });

  it('does not render back button when isLibrary is true', () => {
    renderComponent({ isLibrary: true });
    expect(screen.queryByRole('button', { name: /replace video/i })).not.toBeInTheDocument();
  });

  it('calls onReturn when back button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /replace video/i }));
    expect(defaultProps.onReturn).toHaveBeenCalled();
  });

  it('calls onClose if onReturn is not provided', () => {
    renderComponent({ onReturn: null });
    fireEvent.click(screen.getByRole('button', { name: /replace video/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
