import React, {
  useState, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { fetchBlockById, fetchUnitById, saveBlock } from './data/api';
import EditorPageContext from './EditorPageContext';
import { ActionStates } from './data/constants';

/* This Component serves as a container for state for V2 editors,
to avoid prop drilling for: saving, loading, and navigating away from content. */

const EditorPageProvider = ({
  blockType, courseId, blockId, studioEndpointUrl, children,
}) => {
  const editorRef = React.useRef(null);
  const [blockValue, setBlockValue] = useState(null); // this is the intial block, as called in from the api.
  const [blockError, setBlockError] = useState(null);
  const [blockLoading, setBlockLoading] = useState(ActionStates.NOT_BEGUN);
  const [unitUrl, setUnitUrlValue] = useState(null);
  const [unitUrlError, setUnitUrlError] = useState(null);
  const [unitUrlLoading, setUnitUrlLoading] = useState(ActionStates.NOT_BEGUN);
  const [blockContent, setBlockContent] = useState(null); // This is the updated content to be saved via api call
  const [saveResponse, setSaveResponse] = useState(null);
  const [saveUnderway, setSaveUnderway] = useState(ActionStates.NOT_BEGUN);

  /* We memoize the context value, so it it is only updated
  (and therefore only causes a re-render of the consumers of this provider)
  when blockLoading, unitUrlLoading, or saveUnderway change */
  const value = useMemo(() => ({
    editorRef,
    blockValue,
    blockError,
    blockLoading,
    unitUrl,
    unitUrlError,
    unitUrlLoading,
    setBlockContent,
    saveResponse,
    setSaveUnderway,
    saveUnderway,
    studioEndpointUrl,
    blockId,
    courseId,
    blockType,
  }), [blockLoading, unitUrlLoading, saveUnderway]);

  useEffect(() => {
    // On init, begin fetching data
    if (unitUrlLoading === ActionStates.NOT_BEGUN) {
      fetchUnitById({
        setValue: setUnitUrlValue,
        setError: setUnitUrlError,
        setLoading: setUnitUrlLoading,
      }, blockId, studioEndpointUrl);
    }
    if (blockLoading === ActionStates.NOT_BEGUN) {
      fetchBlockById(
        {
          setValue: setBlockValue,
          setError: setBlockError,
          setLoading: setBlockLoading,
        }, blockId, studioEndpointUrl,
      );
    }
    if (saveUnderway === ActionStates.IN_PROGRESS) {
      saveBlock(
        blockId,
        blockType,
        courseId,
        studioEndpointUrl,
        blockContent,
        { setInProgress: setSaveUnderway, setResponse: setSaveResponse },
      );
    }
  }, [saveUnderway]);

  return (
    <EditorPageContext.Provider
      value={value}
    >
      {children}
    </EditorPageContext.Provider>
  );
};
EditorPageProvider.propTypes = {
  blockType: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
  blockId: PropTypes.string.isRequired,
  studioEndpointUrl: PropTypes.string,
  children: PropTypes.node.isRequired,
};
EditorPageProvider.defaultProps = {

  studioEndpointUrl: null,
};

export default EditorPageProvider;
