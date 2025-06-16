// @ts-check
import { initializeMocks, render } from '../../testUtils';
import GroupConfigurationSidebar from '.';
import messages from './messages';

const courseId = 'course-123';
const enrollmentTrackTitle = messages.about_3_title.defaultMessage;
const contentGroupTitle = messages.aboutTitle.defaultMessage;
const experimentGroupTitle = messages.about_2_title.defaultMessage;

const renderComponent = (props) => render(<GroupConfigurationSidebar courseId={courseId} {...props} />);

describe('GroupConfigurationSidebar', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders all groups when all props are true', async () => {
    const { findAllByRole } = renderComponent({
      shouldShowExperimentGroups: true,
      shouldShowContentGroup: true,
      shouldShowEnrollmentTrackGroup: true,
    });
    const titles = await findAllByRole('heading', { level: 4 });

    expect(titles[0]).toHaveTextContent(enrollmentTrackTitle);
    expect(titles[1]).toHaveTextContent(contentGroupTitle);
    expect(titles[2]).toHaveTextContent(experimentGroupTitle);
  });

  it('renders no groups when all props are false', async () => {
    const { queryByText } = renderComponent({
      shouldShowExperimentGroups: false,
      shouldShowContentGroup: false,
      shouldShowEnrollmentTrackGroup: false,
    });

    expect(queryByText(enrollmentTrackTitle)).not.toBeInTheDocument();
    expect(queryByText(contentGroupTitle)).not.toBeInTheDocument();
    expect(queryByText(experimentGroupTitle)).not.toBeInTheDocument();
  });

  it('renders only content group when shouldShowContentGroup is true', async () => {
    const { queryByText, getByText } = renderComponent({
      shouldShowExperimentGroups: false,
      shouldShowContentGroup: true,
      shouldShowEnrollmentTrackGroup: false,
    });

    expect(queryByText(enrollmentTrackTitle)).not.toBeInTheDocument();
    expect(getByText(contentGroupTitle)).toBeInTheDocument();
    expect(queryByText(experimentGroupTitle)).not.toBeInTheDocument();
  });

  it('renders only experiment group when shouldShowExperimentGroups is true', async () => {
    const { queryByText, getByText } = renderComponent({
      shouldShowExperimentGroups: true,
      shouldShowContentGroup: false,
      shouldShowEnrollmentTrackGroup: false,
    });

    expect(queryByText(enrollmentTrackTitle)).not.toBeInTheDocument();
    expect(queryByText(contentGroupTitle)).not.toBeInTheDocument();
    expect(getByText(experimentGroupTitle)).toBeInTheDocument();
  });

  it('renders only enrollment track group when shouldShowEnrollmentTrackGroup is true', async () => {
    const { queryByText, getByText } = renderComponent({
      shouldShowExperimentGroups: false,
      shouldShowContentGroup: false,
      shouldShowEnrollmentTrackGroup: true,
    });

    expect(getByText(enrollmentTrackTitle)).toBeInTheDocument();
    expect(queryByText(contentGroupTitle)).not.toBeInTheDocument();
    expect(queryByText(experimentGroupTitle)).not.toBeInTheDocument();
  });
});
