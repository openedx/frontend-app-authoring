import { useSelector } from 'react-redux';

import {
  initializeMocks,
  fireEvent,
  render,
  waitFor,
} from '@src/testUtils';
import studioHomeMock from '@src/studio-home/__mocks__/studioHomeMock';
import { getStudioHomeApiUrl } from '../studio-home/data/api';
import { RequestStatus } from '../data/constants';
import messages from './messages';
import CourseRerun from '.';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

describe('<CourseRerun />', () => {
  beforeEach(() => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    useSelector.mockReturnValue(studioHomeMock);
  });

  it('should render successfully', () => {
    const { getByText, getAllByRole } = render(<CourseRerun />);
    expect(getByText(messages.rerunTitle.defaultMessage));
    expect(getAllByRole('button', { name: messages.cancelButton.defaultMessage }).length).toBe(2);
  });

  it('should navigate to /home on cancel button click', () => {
    const { getAllByRole } = render(<CourseRerun />);
    const cancelButton = getAllByRole('button', { name: messages.cancelButton.defaultMessage })[0];

    fireEvent.click(cancelButton);
    waitFor(() => {
      expect(window.location.pathname).toBe('/home');
    });
  });

  it('shows the spinner before the query is complete', async () => {
    useSelector.mockReturnValue({ organizationLoadingStatus: RequestStatus.IN_PROGRESS });

    const { findByRole } = render(<CourseRerun />);
    const spinner = await findByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('should show footer', async () => {
    const { findByText } = render(<CourseRerun />);
    await findByText('Looking for help with Studio?');
    const lmsElement = await findByText('LMS');
    expect(lmsElement).toHaveAttribute('href', process.env.LMS_BASE_URL);
  });
});
