import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { FullscreenModal } from '@edx/paragon';

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
    <FullscreenModal
      isOpen
      onClose={handleCancelClicked}
      variant="primary"
      footerNode={(
        <EditorFooter
          onCancel={handleCancelClicked}
          onSave={hooks.handleSaveClicked({ getContent, dispatch })}
          disableSave={!isInitialized}
          saveFailed={hooks.saveFailed()}
        />
      )}
      title={(
        <TitleHeader isInitialized={isInitialized} />
      )}
    >
      {children}
    </FullscreenModal>
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
