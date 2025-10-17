import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

const ProblemEditorContext = createContext({
  editorRef: null,
});

export const ProblemEditorContextProvider = ({ editorRef, children }) => {
  const contextValue = useMemo(() => ({ editorRef }), [editorRef]);

  return (
    <ProblemEditorContext.Provider value={contextValue}>
      {children}
    </ProblemEditorContext.Provider>
  );
};

ProblemEditorContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  editorRef: PropTypes.object,
};

ProblemEditorContextProvider.defaultProps = {
  editorRef: null,
};

export const useProblemEditorContext = () => useContext(ProblemEditorContext);

export default ProblemEditorContext;
