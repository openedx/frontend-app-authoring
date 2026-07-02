import { initializeMocks, render, screen } from '@src/testUtils';

import messages from '../messages';
import WithoutModes from './CertificateWithoutModes';

const courseId = 'course-123';

const renderComponent = (props) =>
  render(
    <WithoutModes courseId={courseId} {...props} />,
  );

describe('CertificateWithoutModes', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders correctly', async () => {
    renderComponent({});
    expect(await screen.findByText(messages.withoutModesText.defaultMessage)).toBeInTheDocument();

    expect(screen.queryByText(messages.headingActionsPreview.defaultMessage)).not.toBeInTheDocument();
    expect(screen.queryByText(messages.headingActionsDeactivate.defaultMessage)).not.toBeInTheDocument();
  });
});
