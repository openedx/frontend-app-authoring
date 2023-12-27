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
import { getCurrentItem } from '../data/selectors';
import messages from './messages';
import BasicTab from './BasicTab';
import VisibilityTab from './VisibilityTab';
import AdvancedTab from './AdvancedTab';
import { COURSE_BLOCK_NAMES } from '../constants';

const ConfigureModal = ({
  isOpen,
  onClose,
  onConfigureSubmit,
}) => {
  const intl = useIntl();
  const {
    displayName,
    start: sectionStartDate,
    visibilityState,
    due,
    isTimeLimited,
    defaultTimeLimitMinutes,
    hideAfterDue,
    showCorrectness,
    courseGraders,
    category,
    format,
  } = useSelector(getCurrentItem);
  const [releaseDate, setReleaseDate] = useState(sectionStartDate);
  const [isVisibleToStaffOnly, setIsVisibleToStaffOnly] = useState(visibilityState === VisibilityTypes.STAFF_ONLY);
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(true);
  const [graderType, setGraderType] = useState(format == null ? 'Not Graded' : format);
  const [dueDateState, setDueDateState] = useState('');
  const [isTimeLimitedState, setIsTimeLimitedState] = useState(false);
  const [defaultTimeLimitMin, setDefaultTimeLimitMin] = useState(defaultTimeLimitMinutes);
  const [hideAfterDueState, setHideAfterDueState] = useState(false);
  const [showCorrectnessState, setShowCorrectnessState] = useState(false);
  const isSubsection = category === COURSE_BLOCK_NAMES.sequential.id;

  /* TODO: The use of these useEffects needs to be updated to use Formik, please see,
  * https://github.com/open-craft/frontend-app-course-authoring/pull/22#discussion_r1435957797 as reference. */
  useEffect(() => {
    setReleaseDate(sectionStartDate);
  }, [sectionStartDate]);

  useEffect(() => {
    setGraderType(format == null ? 'Not Graded' : format);
  }, [format]);

  useEffect(() => {
    setDueDateState(due);
  }, [due]);

  useEffect(() => {
    setIsTimeLimitedState(isTimeLimited);
  }, [isTimeLimited]);

  useEffect(() => {
    setDefaultTimeLimitMin(defaultTimeLimitMinutes);
  }, [defaultTimeLimitMinutes]);

  useEffect(() => {
    setHideAfterDueState(hideAfterDue);
  }, [hideAfterDue]);

  useEffect(() => {
    setShowCorrectnessState(showCorrectness);
  }, [showCorrectness]);

  useEffect(() => {
    setIsVisibleToStaffOnly(visibilityState === VisibilityTypes.STAFF_ONLY);
  }, [visibilityState]);

  useEffect(() => {
    const visibilityUnchanged = isVisibleToStaffOnly === (visibilityState === VisibilityTypes.STAFF_ONLY);
    setSaveButtonDisabled(
      visibilityUnchanged
      && releaseDate === sectionStartDate
      && dueDateState === due
      && isTimeLimitedState === isTimeLimited
      && defaultTimeLimitMin === defaultTimeLimitMinutes
      && hideAfterDueState === hideAfterDue
      && showCorrectnessState === showCorrectness
      && graderType === format,
    );
  }, [
    releaseDate,
    isVisibleToStaffOnly,
    dueDateState,
    isTimeLimitedState,
    defaultTimeLimitMin,
    hideAfterDueState,
    showCorrectnessState,
    graderType,
  ]);

  const handleSave = () => {
    if (isSubsection) {
      onConfigureSubmit(
        isVisibleToStaffOnly,
        releaseDate,
        graderType === 'Not Graded' ? 'notgraded' : graderType,
        dueDateState,
        isTimeLimitedState,
        defaultTimeLimitMin,
        hideAfterDueState,
        showCorrectnessState,
      );
    } else {
      onConfigureSubmit(isVisibleToStaffOnly, releaseDate);
    }
  };

  const handleClose = () => {
    setReleaseDate(sectionStartDate);
    setDueDateState(due);
    setIsTimeLimitedState(isTimeLimited);
    setDefaultTimeLimitMin(defaultTimeLimitMinutes);
    setHideAfterDueState(hideAfterDue);
    setShowCorrectnessState(showCorrectness);
    setIsVisibleToStaffOnly(visibilityState === VisibilityTypes.STAFF_ONLY);
    setGraderType(format);
    onClose();
  };

  return (
    <ModalDialog
      className="configure-modal"
      isOpen={isOpen}
      onClose={handleClose}
      hasCloseButton
      isFullscreenOnMobile
    >
      <ModalDialog.Header className="configure-modal__header">
        <ModalDialog.Title>
          {intl.formatMessage(messages.title, { title: displayName })}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body className={!isSubsection ? 'configure-modal__body' : ''}>
        <Tabs>
          <Tab eventKey="basic" title={intl.formatMessage(messages.basicTabTitle)}>
            <BasicTab
              releaseDate={releaseDate}
              setReleaseDate={setReleaseDate}
              isSubsection={isSubsection}
              graderType={graderType}
              courseGraders={courseGraders === 'undefined' ? [] : courseGraders}
              setGraderType={setGraderType}
              dueDate={dueDateState}
              setDueDate={setDueDateState}
            />
          </Tab>
          <Tab eventKey="visibility" title={intl.formatMessage(messages.visibilityTabTitle)}>
            <VisibilityTab
              category={category}
              isSubsection={isSubsection}
              isVisibleToStaffOnly={isVisibleToStaffOnly}
              setIsVisibleToStaffOnly={setIsVisibleToStaffOnly}
              showWarning={visibilityState === VisibilityTypes.STAFF_ONLY}
              hideAfterDue={hideAfterDueState}
              setHideAfterDue={setHideAfterDueState}
              showCorrectness={showCorrectnessState}
              setShowCorrectness={setShowCorrectnessState}
            />
          </Tab>
          {
            isSubsection && (
              <Tab eventKey="advanced" title={intl.formatMessage(messages.advancedTabTitle)}>
                <AdvancedTab
                  isTimeLimited={isTimeLimitedState}
                  setIsTimeLimited={setIsTimeLimitedState}
                  defaultTimeLimit={defaultTimeLimitMin}
                  setDefaultTimeLimit={setDefaultTimeLimitMin}
                />
              </Tab>
            )
          }
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
