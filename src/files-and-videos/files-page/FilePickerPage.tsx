import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { type FilePickerOptions } from '@src/files-and-videos/generic/FilesPageProvider';
import { useLocation, useParams } from 'react-router-dom';
import FilesPage from './FilesPage';

export const FilePickerPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const fileTypes = params.get('fileTypes')?.split(',').map(_type => {
    const type = _type.trim();
    if (['video', 'audio', 'document', 'image', 'code', 'other'].includes(type)) {
      return type;
    }
    return 'other';
  }) || [];
  const filePickerOptions: FilePickerOptions = {
    usageKey: params.get('usage_key')!,
    multiSelect: params.get('multiSelect') === 'true',
    fileTypes,
  };

  return (
    <CourseAuthoringProvider courseId={courseId!}>
      <FilesPage filePickerMode filePickerOptions={filePickerOptions} />
    </CourseAuthoringProvider>
  );
};
