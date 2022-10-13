import React from 'react';
import { useSelector } from 'react-redux';

import { actions, selectors } from '../../../../data/redux';
import * as textEditorHooks from '../../hooks';
import * as module from './hooks';

export const { navigateCallback } = textEditorHooks;

export const state = {
  localTitle: (args) => React.useState(args),
};

export const hooks = {
  isEditing: () => {
    const [isEditing, setIsEditing] = React.useState(false);
    return {
      isEditing,
      startEditing: () => setIsEditing(true),
      stopEditing: () => setIsEditing(false),
    };
  },

  localTitle: ({ dispatch, stopEditing }) => {
    const title = useSelector(selectors.app.displayTitle);
    const [localTitle, setLocalTitle] = module.state.localTitle(title);
    return {
      updateTitle: () => {
        dispatch(actions.app.setBlockTitle(localTitle));
        stopEditing();
      },
      handleChange: (e) => setLocalTitle(e.target.value),
      cancelEdit: () => {
        setLocalTitle(title);
        stopEditing();
      },
      localTitle,
    };
  },
};

export const localTitleHooks = ({ dispatch }) => {
  const { isEditing, startEditing, stopEditing } = module.hooks.isEditing();
  const {
    localTitle,
    handleChange,
    updateTitle,
    cancelEdit,
  } = module.hooks.localTitle({
    dispatch,
    stopEditing,
  });
  return {
    isEditing,
    startEditing,
    stopEditing,
    cancelEdit,
    localTitle,
    updateTitle,
    handleChange,

    inputRef: React.createRef(),
  };
};
