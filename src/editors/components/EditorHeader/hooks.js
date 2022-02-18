import React from 'react';

/* eslint-disable import/prefer-default-export */
export const localTitleHooks = ({
  editorRef,
  setBlockTitle,
  typeHeader,
}) => {
  console.log('localTitleHooks');
  const [isEditing, setIsEditing] = React.useState(false);
  const startEditing = () => setIsEditing(true);
  const stopEditing = () => setIsEditing(false);
  const [localTitle, setLocalTitle] = React.useState(typeHeader);
  const inputRef = React.createRef();
  const updateTitle = () => {
    setBlockTitle(localTitle);
    stopEditing();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      stopEditing();
    }
    if (e.key === 'Tab' && editorRef) {
      e.preventDefault();
      editorRef.current.focus();
    }
  };

  const handleChange = (e) => setLocalTitle(e.target.value);

  return {
    isEditing,
    handleChange,
    startEditing,
    stopEditing,
    localTitle,
    inputRef,
    handleKeyDown,
    updateTitle,
  };
};
