import * as reactRedux from 'react-redux';
import { getConfig } from '@edx/frontend-platform';

import { studioHomeMock } from '../__mocks__';
import messages from '../messages';
import { trimSlashes } from './utils';
import {
  fireEvent,
  initializeMocks,
  render,
  screen,
} from '../../testUtils';
import CardItem from '.';

jest.spyOn(reactRedux, 'useSelector').mockImplementation(() => studioHomeMock);

describe('<CardItem />', () => {
  beforeEach(() => {
    initializeMocks();
  });
  it('should render course details for non-library course', () => {
    const props = studioHomeMock.archivedCourses[0];
    render(<CardItem {...props} />);
    expect(screen.getByText(`${props.org} / ${props.number} / ${props.run}`)).toBeInTheDocument();
  });

  it('should render correct links for non-library course', () => {
    const props = studioHomeMock.archivedCourses[0];
    render(<CardItem {...props} />);
    const courseTitleLink = screen.getByText(props.displayName);
    expect(courseTitleLink).toHaveAttribute('href', `${getConfig().STUDIO_BASE_URL}${props.url}`);
    const btnReRunCourse = screen.getByText(messages.btnReRunText.defaultMessage);
    expect(btnReRunCourse).toHaveAttribute('href', trimSlashes(props.rerunLink));
    const viewLiveLink = screen.getByText(messages.viewLiveBtnText.defaultMessage);
    expect(viewLiveLink).toHaveAttribute('href', props.lmsLink);
  });

  it('should render correct links for non-library course pagination', () => {
    const props = studioHomeMock.archivedCourses[0];
    render(<CardItem {...props} isPaginated />);
    const courseTitleLink = screen.getByText(props.displayName);
    expect(courseTitleLink).toHaveAttribute('href', `${getConfig().STUDIO_BASE_URL}${props.url}`);
    const dropDownMenu = screen.getByTestId('toggle-dropdown');
    fireEvent.click(dropDownMenu);
    const btnReRunCourse = screen.getByText(messages.btnReRunText.defaultMessage);
    expect(btnReRunCourse).toHaveAttribute('href', `/${trimSlashes(props.rerunLink)}`);
    const viewLiveLink = screen.getByText(messages.viewLiveBtnText.defaultMessage);
    expect(viewLiveLink).toHaveAttribute('href', props.lmsLink);
  });
  it('should render course details for library course', () => {
    const props = { ...studioHomeMock.archivedCourses[0], isLibraries: true };
    render(<CardItem {...props} />);
    const courseTitleLink = screen.getByText(props.displayName);
    expect(courseTitleLink).toHaveAttribute('href', `${getConfig().STUDIO_BASE_URL}${props.url}`);
    expect(screen.getByText(`${props.org} / ${props.number}`)).toBeInTheDocument();
  });
  it('should hide rerun button if disallowed', () => {
    const props = studioHomeMock.archivedCourses[0];
    // Update our mocked redux data:
    jest.spyOn(reactRedux, 'useSelector').mockImplementation(() => (
      { ...studioHomeMock, allowCourseReruns: false }
    ));
    const { queryByText } = render(<CardItem {...props} />);
    expect(queryByText(messages.btnReRunText.defaultMessage)).not.toBeInTheDocument();
  });
  it('should be read only course if old mongo course', () => {
    const props = studioHomeMock.courses[1];
    render(<CardItem {...props} />);
    expect(screen.queryByText(props.displayName)).not.toHaveAttribute('href');
    expect(screen.queryByText(messages.btnReRunText.defaultMessage)).not.toBeInTheDocument();
    expect(screen.queryByText(messages.viewLiveBtnText.defaultMessage)).not.toBeInTheDocument();
  });

  it('should render course key if displayname is empty', () => {
    const props = studioHomeMock.courses[1];
    const courseKeyTest = 'course-key';
    render(
      <CardItem
        {...props}
        displayName=""
        courseKey={courseKeyTest}
        lmsLink="lmsLink"
        rerunLink="returnLink"
        url="url"
      />,
    );
    expect(screen.getByText(courseKeyTest)).toBeInTheDocument();
  });
});
