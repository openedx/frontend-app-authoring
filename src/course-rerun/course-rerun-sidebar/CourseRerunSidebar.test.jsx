// @ts-check
import { initializeMocks, render } from '../../testUtils';
import CourseRerunSideBar from '.';
import messages from './messages';

const courseId = '123';

const renderComponent = (props) => render(<CourseRerunSideBar courseId={courseId} {...props} />);

describe('<CourseRerunSideBar />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('render CourseRerunSideBar successfully', () => {
    const { getByText } = renderComponent();

    expect(getByText(messages.sectionTitle1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sectionDescription1.defaultMessage, { exact: false })).toBeInTheDocument();
    expect(getByText(messages.sectionTitle2.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sectionDescription2.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sectionTitle3.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sectionDescription3.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sectionLink4.defaultMessage)).toBeInTheDocument();
  });
});
