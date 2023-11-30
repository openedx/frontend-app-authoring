/* eslint-disable import/named */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ModalDialog,
  Button,
  ActionRow,
  Tab,
  Tabs,
} from '@edx/paragon';
import { useSelector } from 'react-redux';

import { VisibilityTypes } from '../../data/constants';
import { getCurrentSection } from '../data/selectors';
import messages from './messages';
import BasicTab from './BasicTab';
import VisibilityTab from './VisibilityTab';

const ConfigureModal = ({
  isOpen,
  onClose,
  onConfigureSubmit,
}) => {
  const intl = useIntl();
  const { displayName, start: sectionStartDate, visibilityState } = useSelector(getCurrentSection);
  const [releaseDate, setReleaseDate] = useState(sectionStartDate);
  const [isVisibleToStaffOnly, setIsVisibleToStaffOnly] = useState(visibilityState === VisibilityTypes.STAFF_ONLY);
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(true);

  useEffect(() => {
    setReleaseDate(sectionStartDate);
  }, [sectionStartDate]);

  useEffect(() => {
    setIsVisibleToStaffOnly(visibilityState === VisibilityTypes.STAFF_ONLY);
  }, [visibilityState]);

  useEffect(() => {
    const visibilityUnchanged = isVisibleToStaffOnly === (visibilityState === VisibilityTypes.STAFF_ONLY);
    setSaveButtonDisabled(visibilityUnchanged && releaseDate === sectionStartDate);
  }, [releaseDate, isVisibleToStaffOnly]);

  const handleSave = () => {
    onConfigureSubmit(isVisibleToStaffOnly, releaseDate);
  };

  return (
    <ModalDialog
      className="configure-modal"
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
      isFullscreenOnMobile
    >
      <ModalDialog.Header className="configure-modal__header">
        <ModalDialog.Title>
          {intl.formatMessage(messages.title, { title: displayName })}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body className="configure-modal__body">
        <Tabs>
          <Tab eventKey="basic" title={intl.formatMessage(messages.basicTabTitle)}>
            <BasicTab releaseDate={releaseDate} setReleaseDate={setReleaseDate} />
          </Tab>
          <Tab eventKey="visibility" title={intl.formatMessage(messages.visibilityTabTitle)}>
            <VisibilityTab
              isVisibleToStaffOnly={isVisibleToStaffOnly}
              setIsVisibleToStaffOnly={setIsVisibleToStaffOnly}
              showWarning={visibilityState === VisibilityTypes.STAFF_ONLY}
            />
          </Tab>
        </Tabs>
      </ModalDialog.Body>
      <ModalDialog.Footer className="pt-1">
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage(messages.cancelButton)}
          </ModalDialog.CloseButton>
          <Button onClick={handleSave} disabled={saveButtonDisabled}>
            {intl.formatMessage(messages.saveButton)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

ConfigureModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfigureSubmit: PropTypes.func.isRequired,
};

export default ConfigureModal;
