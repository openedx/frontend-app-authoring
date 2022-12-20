import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  ActionRow,
  Button,
  ModalDialog,
} from '@edx/paragon';
import { FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';

import { actions } from '../../../../../data/redux';

export const SelectTypeFooter = ({
  selected,
  onCancel,
  // Redux
  onSelect,
}) => (
  <div className="editor-footer" style={{ position: 'sticky', bottom: 0 }}>
    <ModalDialog.Footer className="border-top-0">
      <ActionRow>
        <ActionRow.Spacer />
        <Button
          aria-label="TODO: CANCEL"
          variant="tertiary"
          onClick={onCancel}
        >
          <FormattedMessage {...'TODO-CANCEL'} />
        </Button>
        <Button
          aria-label="TODO: SELECT"
          onClick={onSelect(selected)}
          disabled={!selected}
        >
          <FormattedMessage {...'TODO- SELECT'} />
        </Button>
      </ActionRow>
    </ModalDialog.Footer>
  </div>
);

SelectTypeFooter.defaultProps = {
  selected: null,
};

SelectTypeFooter.propTypes = {
  onCancel: PropTypes.func.isRequired,
  selected: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

export const mapStateToProps = () => ({
});

export const mapDispatchToProps = {
  initializeEditor: actions.problem.onSelect,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SelectTypeFooter));
