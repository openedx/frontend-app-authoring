import { useSelector } from 'react-redux';

import { initializeMocks, render } from '@src/testUtils';
import { COURSE_CREATOR_STATES } from '@src/constants';
import studioHomeMock from '@src/studio-home/__mocks__/studioHomeMock';
import HomeSidebar from '.';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

const {
  studioName,
  studioShortName,
} = studioHomeMock;

describe('<HomeSidebar />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders about and other sidebar titles correctly', () => {
    useSelector.mockReturnValue(studioHomeMock);

    const { getByText } = render(<HomeSidebar />);
    expect(getByText(`New to ${studioName}?`)).toBeInTheDocument();
    expect(getByText(`Click "Looking for help with Studio" at the bottom of the page to access our continually updated documentation and other ${studioShortName} resources.`)).toBeInTheDocument();
  });

  it('shows mail to get instruction', () => {
    const studioHomeInitial = {
      ...studioHomeMock,
      courseCreatorStatus: COURSE_CREATOR_STATES.disallowedForThisSite,
      studioRequestEmail: 'mock@example.com',
    };
    useSelector.mockReturnValue(studioHomeInitial);

    const { getByText } = render(<HomeSidebar />);
    expect(getByText(`Can I create courses in ${studioName}?`)).toBeInTheDocument();
    expect(getByText(`In order to create courses in ${studioName}, you must`)).toBeInTheDocument();
  });

  it('shows unrequested instructions', () => {
    const studioHomeInitial = {
      ...studioHomeMock,
      courseCreatorStatus: COURSE_CREATOR_STATES.unrequested,
    };
    useSelector.mockReturnValue(studioHomeInitial);

    const { getByText } = render(<HomeSidebar />);
    expect(getByText(`Can I create courses in ${studioName}?`)).toBeInTheDocument();
    expect(getByText(`In order to create courses in ${studioName}, you must have course creator privileges to create your own course.`)).toBeInTheDocument();
  });

  it('shows denied instructions', () => {
    const studioHomeInitial = {
      ...studioHomeMock,
      courseCreatorStatus: COURSE_CREATOR_STATES.denied,
    };
    useSelector.mockReturnValue(studioHomeInitial);

    const { getByText } = render(<HomeSidebar />);
    expect(getByText(`Can I create courses in ${studioName}?`)).toBeInTheDocument();
    expect(getByText(`Your request to author courses in ${studioName} has been denied.`, { exact: false })).toBeInTheDocument();
  });
});
