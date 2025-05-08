import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import {
  initializeMockApp,
} from '@edx/frontend-platform';
import { createStore } from '../../../../data/store';
import VideoSettingsModal from '.';

const defaultProps = {
  onReturn: jest.fn(),
  isLibrary: false,
  onClose: jest.fn(),
  useNewVideoUploadsPage: true,
};

let store;

const RootWrapper = ({ ...props }) => (
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <VideoSettingsModal {...defaultProps} {...props} />
    </IntlProvider>
  </AppProvider>
);

describe('<VideoSettingsModal />', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    window.scrollTo = jest.fn();
    global.localStorage.clear();
    store = createStore();
  });

  it('renders back button when useNewVideoUploadsPage is true and isLibrary is false', () => {
    render(<RootWrapper />);
    expect(screen.getByRole('button', { name: /replace video/i })).toBeInTheDocument();
  });

  it('does not render back button when isLibrary is true', () => {
    render(<RootWrapper isLibrary />);
    expect(screen.queryByRole('button', { name: /replace video/i })).not.toBeInTheDocument();
  });

  it('calls onReturn when back button is clicked', () => {
    render(<RootWrapper />);
    fireEvent.click(screen.getByRole('button', { name: /replace video/i }));
    expect(defaultProps.onReturn).toHaveBeenCalled();
  });

  it('calls onClose if onReturn is not provided', () => {
    render(<RootWrapper onReturn={null} />);
    fireEvent.click(screen.getByRole('button', { name: /replace video/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
