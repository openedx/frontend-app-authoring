import React, { useContext, useEffect } from 'react';
import {
  Spinner, ActionRow, Button, ModalDialog, Toast,
} from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import EditorPageContext from './EditorPageContext';
import { ActionStates } from './data/constants';

const navigateAway = (destination) => {
  window.location.assign(destination);
};

export default function EditorFooter() {
  const {
    blockLoading,
    setBlockContent,
    unitUrlLoading,
    unitUrl,
    setSaveUnderway,
    saveUnderway,
    saveResponse,
    studioEndpointUrl,
    editorRef,
  } = useContext(EditorPageContext);

  const onSaveClicked = () => {
    if (blockLoading === ActionStates.FINISHED && unitUrlLoading === ActionStates.FINISHED && editorRef) {
      const content = editorRef.current.getContent();
      setBlockContent(content);
      setSaveUnderway(ActionStates.IN_PROGRESS);
    }
  };
  const onCancelClicked = () => {
    if (unitUrlLoading === ActionStates.FINISHED) {
      const destination = `${studioEndpointUrl}/container/${unitUrl.data.ancestors[0].id}`;
      navigateAway(destination);
    }
  };
  useEffect(() => {
    if (saveUnderway === ActionStates.FINISHED
      && blockLoading === ActionStates.FINISHED
      && unitUrlLoading === ActionStates.FINISHED) {
      const destination = `${studioEndpointUrl}/container/${unitUrl.data.ancestors[0].id}`;
      navigateAway(destination);
    }
  }, [saveUnderway]);
  return (
    <div className="editor-footer mt-auto">
      { saveUnderway === 'complete' && saveResponse.error != null
      && (
      <Toast><FormattedMessage
        id="authoring.editorfooter.save.error"
        defaultMessage="Error: Content save failed. Try again later."
        description="Error message displayed when content fails to save."
      />
      </Toast>
      )}
      <ModalDialog.Footer>
        <ActionRow>
          <ActionRow.Spacer />
          <Button aria-label="Discard Changes and Return to Learning Context" variant="tertiary" onClick={onCancelClicked}>Cancel</Button>
          <Button aria-label="Save Changes and Return to Learning Context" onClick={onSaveClicked}>
            {unitUrlLoading !== ActionStates.FINISHED
              ? <Spinner animation="border" className="mr-3" />
              : (
                <FormattedMessage
                  id="authoring.editorfooter.savebutton.label"
                  defaultMessage="Add To Course"
                  description="Label for Save button"
                />
              )}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </div>
  );
}
