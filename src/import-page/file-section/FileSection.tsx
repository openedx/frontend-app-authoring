import { useIntl } from '@edx/frontend-platform/i18n';
import { Card, Dropzone } from '@openedx/paragon';

import { IMPORT_STAGES } from '../data/constants';
import messages from './messages';
import { useCourseImportContext } from '../CourseImportContext';

const FileSection = () => {
  const intl = useIntl();

  const {
    importTriggered,
    currentStage,
    fileName,
    anyRequestFailed,
    handleOnProcessUpload,
  } = useCourseImportContext();

  const isShowedDropzone = !importTriggered || currentStage === IMPORT_STAGES.SUCCESS || anyRequestFailed;

  return (
    <Card>
      <Card.Header
        className="h3 px-3 text-black"
        title={intl.formatMessage(messages.headingTitle)}
        subtitle={fileName && intl.formatMessage(messages.fileChosen, { fileName })}
      />
      <Card.Section className="px-3 pt-2 pb-4">
        {isShowedDropzone
          && (
            <Dropzone
              onProcessUpload={handleOnProcessUpload}
              accept={{ 'application/x-tar.gz': ['.tar.gz'] }}
              data-testid="dropzone"
              style={{ height: '200px' }}
            />
          )}
      </Card.Section>
    </Card>
  );
};

export default FileSection;
