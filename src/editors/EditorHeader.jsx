import {
  ActionRow, IconButton, Icon, ModalDialog,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Close } from '@edx/paragon/icons';
import EditorPageContext from './EditorPageContext';
import { ActionStates, mapBlockTypeToName } from './data/constants';

const EditorHeader = ({ title }) => {
  const { unitUrl, unitUrlLoading, studioEndpointUrl } = useContext(EditorPageContext);

  const onCancelClicked = () => {
    if (unitUrlLoading === ActionStates.FINISHED) {
      const destination = `${studioEndpointUrl}/container/${unitUrl.data.ancestors[0].id}`;
      window.location.assign(destination);
    }
  };
  return (
    <div className="editor-header">
      <ModalDialog.Header>
        <ActionRow>
          <ModalDialog.Title>
            {mapBlockTypeToName(title)}
          </ModalDialog.Title>
          <ActionRow.Spacer />
          <IconButton
            aria-label="Cancel Changes and Return to Learning Context"
            src={Close}
            iconAs={Icon}
            alt="Close"
            onClick={onCancelClicked}
            variant="light"
            className="mr-2"
          />
        </ActionRow>
      </ModalDialog.Header>
    </div>
  );
};
EditorHeader.propTypes = {
  title: PropTypes.string.isRequired,
};
export default EditorHeader;
