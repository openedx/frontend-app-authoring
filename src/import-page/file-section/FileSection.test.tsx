import {
  fireEvent,
  render,
  initializeMocks,
  screen,
  waitFor,
} from '@src/testUtils';

import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import messages from './messages';
import FileSection from './FileSection';
import { CourseImportProvider } from '../CourseImportContext';
import { getImportStatusApiUrl, postImportCourseApiUrl } from '../data/api';

const courseId = '123';

let axiosMock;

const renderComponent = () => render(
  <CourseAuthoringProvider courseId={courseId}>
    <CourseImportProvider>
      <FileSection />
    </CourseImportProvider>
  </CourseAuthoringProvider>,
);

describe('<FileSection />', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('should render without errors', async () => {
    renderComponent();
    expect(await screen.findByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
  });

  it('should displays Dropzone when import is not triggered or in success stage or has an error', async () => {
    renderComponent();
    expect(await screen.findByTestId('dropzone')).toBeInTheDocument();
  });

  it('should work Dropzone', async () => {
    axiosMock.onPost(postImportCourseApiUrl(courseId)).reply(200, { importStatus: 1 });
    axiosMock.onGet(getImportStatusApiUrl(courseId, 'example.tar.gz')).reply(200, { importStatus: 1, message: '' });
    renderComponent();

    const dropzoneElement = screen.getByTestId('dropzone');

    const file = new File(['file contents'], 'example.tar.gz', { type: 'application/gzip' });
    fireEvent.drop(dropzoneElement, { dataTransfer: { files: [file], types: ['Files'] } });

    expect(await screen.findByText('File chosen: example.tar.gz')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('dropzone')).not.toBeInTheDocument();
    });
  });
});
