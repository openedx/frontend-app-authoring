import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Icon, IconButton } from '@edx/paragon';
import { Edit } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { actions, selectors } from '../../data/redux';
import { localTitleHooks } from './hooks';
import messages from './messages';
import EditableHeader from './EditableHeader';

export const HeaderTitle = ({
  editorRef,
  intl,
  isInitialized,
  setBlockTitle,
  typeHeader,
}) => {
  if (!isInitialized) { return intl.formatMessage(messages.loading); }
  const {
    inputRef,
    isEditing,
    handleChange,
    handleKeyDown,
    localTitle,
    startEditing,
    updateTitle,
  } = localTitleHooks({
    editorRef,
    setBlockTitle,
    typeHeader,
  });

  if (isEditing) {
    return (
      <EditableHeader
        {...{
          inputRef,
          handleChange,
          handleKeyDown,
          localTitle,
          updateTitle,
        }}
      />
    );
  }
  return (
    <div className="d-flex">
      <div style={{ lineHeight: '1.5', paddingRight: '.25em' }}>
        {localTitle}
      </div>
      <IconButton
        alt={intl.formatMessage(messages.editTitleLabel)}
        className="mr-2"
        iconAs={Icon}
        onClick={startEditing}
        size="sm"
        src={Edit}
      />
    </div>
  );
};
HeaderTitle.defaultProps = {
  editorRef: null,
};
HeaderTitle.propTypes = {
  editorRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  // injected
  intl: intlShape.isRequired,
  // redux
  isInitialized: PropTypes.bool.isRequired,
  setBlockTitle: PropTypes.func.isRequired,
  typeHeader: PropTypes.string.isRequired,
};

export const mapStateToProps = (state) => ({
  typeHeader: selectors.app.typeHeader(state),
  isInitialized: selectors.app.isInitialized(state),
});

export const mapDispatchToProps = {
  setBlockTitle: actions.app.setBlockTitle,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(HeaderTitle));
