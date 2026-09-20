import {
  initializeMocks,
  render,
  screen,
  userEvent,
} from '@src/testUtils';

import messages from '../messages';
import { PublishButon } from './PublishButon';

const mockCourseAuthoringContext = {
  canPublishCourseContent: true,
};

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => mockCourseAuthoringContext,
}));

const onClickMock = jest.fn();

// The button's accessible name is the publish label plus the draft status,
// e.g. "Publish Changes (Draft)".
const publishButtonName = new RegExp(messages.publishContainerButton.defaultMessage, 'i');

describe('<PublishButon />', () => {
  beforeEach(() => {
    initializeMocks();
    mockCourseAuthoringContext.canPublishCourseContent = true;
    onClickMock.mockClear();
  });

  it('renders the publish button when the user can publish course content', async () => {
    render(<PublishButon onClick={onClickMock} />);

    expect(
      await screen.findByRole('button', { name: publishButtonName }),
    ).toBeInTheDocument();
  });

  it('calls onClick when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<PublishButon onClick={onClickMock} />);

    await user.click(await screen.findByRole('button', { name: publishButtonName }));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('does not render the button when the user cannot publish course content', () => {
    mockCourseAuthoringContext.canPublishCourseContent = false;
    render(<PublishButon onClick={onClickMock} />);

    expect(
      screen.queryByRole('button', { name: publishButtonName }),
    ).not.toBeInTheDocument();
  });
});
