import { initializeMocks, render } from '@src/testUtils';

import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { courseSettingsMock, courseDetailsMock } from '../__mocks__';
import messages from './messages';
import IntroducingSection from '.';

// Mock the tinymce lib
jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: () => 'foo bar',
  };
});

// Mock the TinyMceWidget
jest.mock('../../editors/sharedComponents/TinyMceWidget', () => ({
  __esModule: true, // Required to mock a default export
  default: () => <div>Widget</div>,
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
}));

const onChangeMock = jest.fn();
const RootWrapper = (props) => (
  <CourseAuthoringProvider courseId="1">
    <IntroducingSection {...props} />
  </CourseAuthoringProvider>
);

const {
  overview,
  introVideo,
  aboutSidebarHtml,
  shortDescription,
  courseImageAssetPath,
} = courseDetailsMock;

const {
  aboutPageEditable, sidebarHtmlEnabled, shortDescriptionEditable, lmsLinkForAboutPage,
} = courseSettingsMock;

const props = {
  intl: {},
  courseId: 'foo-course-id',
  overview,
  introVideo,
  aboutSidebarHtml,
  shortDescription,
  aboutPageEditable,
  sidebarHtmlEnabled,
  lmsLinkForAboutPage,
  courseImageAssetPath,
  shortDescriptionEditable,
  onChange: onChangeMock,
};

describe('<IntroducingSection />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders successfully', () => {
    const { getByText, getByLabelText } = render(<RootWrapper {...props} />);
    expect(getByText(messages.introducingTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.introducingDescription.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.courseShortDescriptionLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.courseShortDescriptionHelpText.defaultMessage)).toBeInTheDocument();
    expect(getByLabelText(messages.courseShortDescriptionLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.courseOverviewLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.courseAboutSidebarLabel.defaultMessage)).toBeInTheDocument();
  });

  it('should hide components if aboutPageEditable is false', () => {
    const initialProps = { ...props, aboutPageEditable: false };
    const { queryAllByText } = render(<RootWrapper {...initialProps} />);
    expect(queryAllByText(messages.introducingTitle.defaultMessage).length).toBe(0);
    expect(queryAllByText(messages.introducingDescription.defaultMessage).length).toBe(0);
    expect(queryAllByText(messages.courseOverviewLabel.defaultMessage).length).toBe(0);
    expect(queryAllByText(messages.courseAboutSidebarLabel.defaultMessage).length).toBe(0);
  });
});
