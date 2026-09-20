import { initializeMocks, render, screen } from '@src/testUtils';

import GroupConfigurationSidebar from '.';
import messages from './messages';

const courseId = 'course-123';
const enrollmentTrackTitle = messages.about_3_title.defaultMessage;
const contentGroupTitle = messages.aboutTitle.defaultMessage;
const experimentGroupTitle = messages.about_2_title.defaultMessage;
// The paragraphs explaining how to add, edit and delete groups are the only ones naming these
// buttons, so they stand in for the instructions that read-only users should not see.
const contentGroupInstructions = messages.aboutDescription_3_strong.defaultMessage;
const experimentGroupInstructions = messages.about_2_description_2_strong.defaultMessage;

const renderComponent = (props = {}) =>
  render(
    <GroupConfigurationSidebar
      courseId={courseId}
      shouldShowExperimentGroups={false}
      shouldShowContentGroup={false}
      shouldShowEnrollmentTrackGroup={false}
      {...props}
    />,
  );

describe('<GroupConfigurationSidebar />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders all groups when all props are true', async () => {
    renderComponent({
      shouldShowExperimentGroups: true,
      shouldShowContentGroup: true,
      shouldShowEnrollmentTrackGroup: true,
    });
    const titles = await screen.findAllByRole('heading', { level: 4 });

    expect(titles[0]).toHaveTextContent(enrollmentTrackTitle);
    expect(titles[1]).toHaveTextContent(contentGroupTitle);
    expect(titles[2]).toHaveTextContent(experimentGroupTitle);
  });

  it('renders no groups when all props are false', () => {
    renderComponent();

    expect(screen.queryByText(enrollmentTrackTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(contentGroupTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(experimentGroupTitle)).not.toBeInTheDocument();
  });

  it('renders only content group when shouldShowContentGroup is true', () => {
    renderComponent({ shouldShowContentGroup: true });

    expect(screen.queryByText(enrollmentTrackTitle)).not.toBeInTheDocument();
    expect(screen.getByText(contentGroupTitle)).toBeInTheDocument();
    expect(screen.queryByText(experimentGroupTitle)).not.toBeInTheDocument();
  });

  it('renders only experiment group when shouldShowExperimentGroups is true', () => {
    renderComponent({ shouldShowExperimentGroups: true });

    expect(screen.queryByText(enrollmentTrackTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(contentGroupTitle)).not.toBeInTheDocument();
    expect(screen.getByText(experimentGroupTitle)).toBeInTheDocument();
  });

  it('renders only enrollment track group when shouldShowEnrollmentTrackGroup is true', () => {
    renderComponent({ shouldShowEnrollmentTrackGroup: true });

    expect(screen.getByText(enrollmentTrackTitle)).toBeInTheDocument();
    expect(screen.queryByText(contentGroupTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(experimentGroupTitle)).not.toBeInTheDocument();
  });

  it('renders the instructions to add, edit and delete groups by default', () => {
    renderComponent({
      shouldShowExperimentGroups: true,
      shouldShowContentGroup: true,
      shouldShowEnrollmentTrackGroup: true,
    });

    expect(screen.getByText(contentGroupInstructions)).toBeInTheDocument();
    expect(screen.getByText(experimentGroupInstructions)).toBeInTheDocument();
  });

  it('hides the instructions to add, edit and delete groups when readOnly', () => {
    renderComponent({
      shouldShowExperimentGroups: true,
      shouldShowContentGroup: true,
      shouldShowEnrollmentTrackGroup: true,
      readOnly: true,
    });

    expect(screen.queryByText(contentGroupInstructions)).not.toBeInTheDocument();
    expect(screen.queryByText(experimentGroupInstructions)).not.toBeInTheDocument();
    // The rest of the help text is still shown.
    expect(screen.getByText(messages.aboutDescription_1.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.about_2_description_1.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.about_3_description_3.defaultMessage)).toBeInTheDocument();
  });
});
