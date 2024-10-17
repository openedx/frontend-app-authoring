// @ts-check
import React, { useMemo, useState } from 'react';
import { Sheet } from '@openedx/paragon';
import PropTypes from 'prop-types';
import ContentTagsDrawer from './ContentTagsDrawer';
import { ContentTagsDrawerSheetContext } from './common/context';

const ContentTagsDrawerSheet = ({ id, onClose, showSheet }) => {
  const [blockingSheet, setBlockingSheet] = useState(false);

  const context = useMemo(() => ({
    blockingSheet, setBlockingSheet,
  }), [blockingSheet, setBlockingSheet]);

  // ContentTagsDrawerSheet is only used when editing Courses/Course Units,
  // so we assume it's ok to edit the object tags too.
  const readOnly = false;

  return (
    <ContentTagsDrawerSheetContext.Provider value={context}>
      <Sheet
        position="right"
        show={showSheet}
        onClose={onClose}
        blocking={blockingSheet}
      >
        <ContentTagsDrawer
          id={id}
          onClose={onClose}
          readOnly={readOnly}
        />
      </Sheet>
    </ContentTagsDrawerSheetContext.Provider>
  );
};

ContentTagsDrawerSheet.propTypes = {
  id: PropTypes.string,
  onClose: PropTypes.func,
  showSheet: PropTypes.bool,
};

ContentTagsDrawerSheet.defaultProps = {
  id: undefined,
  onClose: undefined,
  showSheet: false,
};

export default ContentTagsDrawerSheet;
