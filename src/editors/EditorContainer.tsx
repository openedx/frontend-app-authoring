import React from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Hyperlink } from '@openedx/paragon';
import { Warning as WarningIcon } from '@openedx/paragon/icons';

import EditorPage from './EditorPage';
import AlertMessage from '../generic/alert-message';
import messages from './messages';
import { getLibraryId } from '../generic/key-utils';
import { createCorrectInternalRoute } from '../utils';

interface Props {
  /** Course ID or Library ID */
  learningContextId: string;
  /** Event handler sometimes called when user cancels out of the editor page */
  onClose?: (prevPath?: string) => void;
  /**
   * Event handler called after when user saves their changes using an editor
   * and sometimes called when user cancels the editor, instead of onClose.
   * If changes are saved, newData will be present, and if it was cancellation,
   * newData will be undefined.
   * TODO: clean this up so there are separate onCancel and onSave callbacks,
   * and they are used consistently instead of this mess.
   */
  returnFunction?: (prevPath?: string) => (newData: Record<string, any> | undefined) => void;
}

const EditorContainer: React.FC<Props> = ({
  learningContextId,
  onClose,
  returnFunction,
}) => {
  const intl = useIntl();
  const { blockType, blockId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const upstreamLibRef = searchParams.get('upstreamLibRef');

  if (blockType === undefined || blockId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    return <div>Error: missing URL parameters</div>;
  }

  const getLibraryBlockUrl = () => {
    if (!upstreamLibRef) {
      return '';
    }
    const libId = getLibraryId(upstreamLibRef);
    return createCorrectInternalRoute(`/library/${libId}/components?usageKey=${upstreamLibRef}`);
  };

  return (
    <div className="editor-page">
      <AlertMessage
        className="m-3"
        show={upstreamLibRef}
        variant="warning"
        icon={WarningIcon}
        title={intl.formatMessage(messages.libraryBlockEditWarningTitle)}
        description={intl.formatMessage(messages.libraryBlockEditWarningDescription)}
        actions={[
          <Button
            destination={getLibraryBlockUrl()}
            target="_blank"
            rel="noopener noreferrer"
            showLaunchIcon
            as={Hyperlink}
          >
            {intl.formatMessage(messages.libraryBlockEditWarningLink)}
          </Button>,
        ]}
      />
      <EditorPage
        courseId={learningContextId}
        blockType={blockType}
        blockId={blockId}
        studioEndpointUrl={getConfig().STUDIO_BASE_URL}
        lmsEndpointUrl={getConfig().LMS_BASE_URL}
        onClose={onClose ? () => onClose(location.state?.from) : null}
        returnFunction={returnFunction ? () => returnFunction(location.state?.from) : null}
      />
    </div>
  );
};

export default EditorContainer;
