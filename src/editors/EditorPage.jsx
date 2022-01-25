import React from 'react';
import PropTypes from 'prop-types';
import { ModalDialog } from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import TextEditor from './TextEditor/TextEditor';
import VideoEditor from './VideoEditor/VideoEditor';
import ProblemEditor from './ProblemEditor/ProblemEditor';
import EditorFooter from './EditorFooter';
import EditorHeader from './EditorHeader';
import EditorPageProvider from './EditorPageProvider';

export default function EditorPage({
  courseId,
  blockType,
  blockId,
  studioEndpointUrl,
}) {
  const selectEditor = (type) => {
    switch (type) {
      case 'html':
        return <TextEditor />;
      case 'video':
        return <VideoEditor />;
      case 'problem':
        return <ProblemEditor />;
      default:
        return (
          <FormattedMessage
            id="authoring.editorpage.selecteditor.error"
            defaultMessage="Error: Could Not find Editor"
            description="Error Message Dispayed When An unsopported Editor is desired in V2"
          />
        );
    }
  };

  return (
    <EditorPageProvider
      blockType={blockType}
      courseId={courseId}
      blockId={blockId}
      studioEndpointUrl={studioEndpointUrl}
    >
      <ModalDialog
        title={blockType}
        isOpen
        size="fullscreen"
        onClose={() => {}}
        hasCloseButton={false}
        variant="dark"
      >
        <div className="d-flex flex-column vh-100">
          <EditorHeader title={blockType} />
          {selectEditor(blockType)}
          <EditorFooter />
        </div>
      </ModalDialog>
    </EditorPageProvider>
  );
}
EditorPage.propTypes = {
  courseId: PropTypes.string,
  blockType: PropTypes.string.isRequired,
  blockId: PropTypes.string,
  studioEndpointUrl: PropTypes.string,
};
EditorPage.defaultProps = {
  courseId: null,
  blockId: null,
  studioEndpointUrl: null,
};
