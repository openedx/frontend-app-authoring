import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { useLocation, useParams } from 'react-router-dom';
import FilesPage from './FilesPage';

export const FilePickerPage = () => {
  const { courseId } = useParams<{ courseId: string; }>();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const filePickerOptions = {
    usageKey: params.get('usage_key')!,
    multiSelect: params.get('multiSelect') === 'true',
    mimeType: params.get('mimeType'),
  };

  return (
    <CourseAuthoringProvider courseId={courseId!}>
      <FilesPage filePickerMode filePickerOptions={filePickerOptions} />
    </CourseAuthoringProvider>
  );
};
