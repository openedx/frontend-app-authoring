import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { type FilePickerOptions } from '@src/files-and-videos/generic/FilesPageContext';
import { useLocation, useParams } from 'react-router-dom';
import FilesPage from './FilesPage';

export const FILE_TYPES = ['video', 'audio', 'document', 'image', 'code', 'other'] as const;

export const FilePickerPage = () => {
  const { courseId } = useParams<{ courseId: string; }>();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const fileTypes = params.get('fileTypes')?.split(',').map(_type => {
    const type = _type.trim() as typeof FILE_TYPES[number];
    if (FILE_TYPES.includes(type)) {
      return type;
    }
    return 'other';
  }) || [];
  const filePickerOptions: FilePickerOptions = {
    usageKey: params.get('usage_key')!,
    multiSelect: params.get('multiSelect') === 'true',
    embedded: params.get('embedded') === 'true',
    fileTypes,
  };

  return (
    <CourseAuthoringProvider courseId={courseId!}>
      <FilesPage filePickerMode filePickerOptions={filePickerOptions} />
    </CourseAuthoringProvider>
  );
};
