/* eslint-disable import/named */
import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ModalDialog,
  Button,
  ActionRow,
} from '@edx/paragon';
import { useSelector } from 'react-redux';

import { getCurrentSection } from '../data/selectors';
import messages from './messages';

const PublishModal = ({
  isOpen,
  onClose,
  onPublishSubmit,
}) => {
  const intl = useIntl();
  const { displayName, childInfo } = useSelector(getCurrentSection);
  const subSections = childInfo?.children || [];

  return (
    <ModalDialog
      className="publish-modal"
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
      isFullscreenOnMobile
    >
      <ModalDialog.Header className="publish-modal__header">
        <ModalDialog.Title>
          {intl.formatMessage(messages.title, { title: displayName })}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <p className="small">{intl.formatMessage(messages.description)}</p>
        {subSections.filter(subSection => subSection.hasChanges).map((subSection) => {
          const units = subSection.childInfo.children.filter(unit => unit.hasChanges);

          return units.length ? (
            <React.Fragment key={subSection.id}>
              <span className="small text-gray-400">{subSection.displayName}</span>
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className="small border border-light-400 p-2 publish-modal__subsection"
                >
                  {unit.displayName}
                </div>
              ))}
            </React.Fragment>
          ) : null;
        })}
      </ModalDialog.Body>
      <ModalDialog.Footer className="pt-1">
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage(messages.cancelButton)}
          </ModalDialog.CloseButton>
          <Button onClick={onPublishSubmit}>
            {intl.formatMessage(messages.publishButton)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

PublishModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPublishSubmit: PropTypes.func.isRequired,
};

export default PublishModal;
