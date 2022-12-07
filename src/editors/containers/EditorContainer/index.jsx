import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { Icon, ModalDialog, IconButton } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';

import EditorFooter from './components/EditorFooter';
import TitleHeader from './components/TitleHeader';
import * as hooks from './hooks';

export const EditorContainer = ({
  children,
  getContent,
  onClose,
  validateEntry,
}) => {
  const dispatch = useDispatch();
  const isInitialized = hooks.isInitialized();
  const handleCancelClicked = hooks.handleCancelClicked({ onClose });
  return (
    <div>
      <ModalDialog.Header>
        <ModalDialog.Title>
          <div
            style={{ height: '44px', margin: 'auto' }}
          >
            <TitleHeader isInitialized={isInitialized} />
          </div>
          <div className="pgn__modal-close-container">
            <IconButton
              src={Close}
              iconAs={Icon}
              onClick={handleCancelClicked}
            />
          </div>
        </ModalDialog.Title>
      </ModalDialog.Header>
      {isInitialized && children}
      <EditorFooter
        onCancel={handleCancelClicked}
        onSave={hooks.handleSaveClicked({ dispatch, getContent, validateEntry })}
        disableSave={!isInitialized}
        saveFailed={hooks.saveFailed()}
      />
    </div>
  );
};
EditorContainer.defaultProps = {
  onClose: null,
  validateEntry: null,
};
EditorContainer.propTypes = {
  children: PropTypes.node.isRequired,
  getContent: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  validateEntry: PropTypes.func,
};

export default EditorContainer;
