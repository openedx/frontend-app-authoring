import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  ModalDialog,
} from '@openedx/paragon';
import messages from './messages';
import * as hooks from '../hooks';

import { actions, selectors } from '../../../../../data/redux';

const SelectTypeFooter = ({
  onCancel,
  selected,
}) => {
  const intl = useIntl();
  const defaultSettings = useSelector(selectors.problem.defaultSettings);
  const dispatch = useDispatch();
  const updateField = React.useCallback((data) => dispatch(actions.problem.updateField(data)), [dispatch]);
  const setBlockTitle = React.useCallback((title) => dispatch(actions.app.setBlockTitle(title)), [dispatch]);
  return (
    <div className="editor-footer fixed-bottom">
      <ModalDialog.Footer className="border-top-0">
        <ActionRow>
          <ActionRow.Spacer />
          <Button
            aria-label={intl.formatMessage(messages.cancelButtonAriaLabel)}
            variant="tertiary"
            onClick={onCancel}
          >
            <FormattedMessage {...messages.cancelButtonLabel} />
          </Button>
          <Button
            aria-label={intl.formatMessage(messages.selectButtonAriaLabel)}
            onClick={hooks.onSelect({
              selected,
              updateField,
              setBlockTitle,
              defaultSettings,
            })}
            disabled={!selected}
          >
            <FormattedMessage {...messages.selectButtonLabel} />
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </div>
  );
};

SelectTypeFooter.defaultProps = {
  selected: null,
};

SelectTypeFooter.propTypes = {
  onCancel: PropTypes.func.isRequired,
  selected: PropTypes.string,
};

export default SelectTypeFooter;
