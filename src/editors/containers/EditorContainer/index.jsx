import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { Icon, ModalDialog, IconButton } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';

import EditorFooter from './components/EditorFooter';
import TitleHeader from './components/TitleHeader';
import * as hooks from './hooks';
import './index.scss';

export const EditorContainer = ({
  children,
  getContent,
  onClose,
}) => {
  const dispatch = useDispatch();
  const isInitialized = hooks.isInitialized();
  const handleCancelClicked = hooks.handleCancelClicked({ onClose });
  return (
    <div>
      <ModalDialog.Header>
        <ModalDialog.Title>
          <TitleHeader isInitialized={isInitialized} />
          <div className="pgn__modal-close-container">
            <IconButton
              src={Close}
              iconAs={Icon}
              onClick={onClose}
            />
          </div>
        </ModalDialog.Title>
      </ModalDialog.Header>
      {isInitialized && children}
      <EditorFooter
        onCancel={handleCancelClicked}
        onSave={hooks.handleSaveClicked({ getContent, dispatch })}
        disableSave={!isInitialized}
        saveFailed={hooks.saveFailed()}
      />
    </div>
  );
};
EditorContainer.defaultProps = {
  onClose: null,
};
EditorContainer.propTypes = {
  getContent: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
};

export default EditorContainer;
