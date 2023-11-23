import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Button,
  AlertModal,
} from '@edx/paragon';
import { useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';

import { COURSE_BLOCK_NAMES } from '../constants';
import { getCurrentItem } from '../data/selectors';
import messages from './messages';

const DeleteModal = ({ isOpen, close, onDeleteSubmit }) => {
  const intl = useIntl();
  let { category } = useSelector(getCurrentItem);
  category = COURSE_BLOCK_NAMES[category]?.name.toLowerCase();

  return (
    <AlertModal
      title={intl.formatMessage(messages.title, { category })}
      isOpen={isOpen}
      onClose={close}
      footerNode={(
        <ActionRow>
          <Button variant="tertiary" onClick={close}>
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onDeleteSubmit();
            }}
          >
            {intl.formatMessage(messages.deleteButton, { category })}
          </Button>
        </ActionRow>
      )}
    >
      <p>{intl.formatMessage(messages.description, { category })}</p>
    </AlertModal>
  );
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  onDeleteSubmit: PropTypes.func.isRequired,
};

export default DeleteModal;
