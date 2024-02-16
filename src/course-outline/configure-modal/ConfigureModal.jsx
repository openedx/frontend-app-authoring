/* eslint-disable import/named */
import React from 'react';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ModalDialog,
  Button,
  ActionRow,
  Form,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { useSelector } from 'react-redux';
import { Formik } from 'formik';

import { VisibilityTypes } from '../../data/constants';
import { COURSE_BLOCK_NAMES } from '../constants';
import { getCurrentItem, getProctoredExamsFlag } from '../data/selectors';
import messages from './messages';
import BasicTab from './BasicTab';
import VisibilityTab from './VisibilityTab';
import AdvancedTab from './AdvancedTab';
import UnitTab from './UnitTab';

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
    userPartitionInfo,
    ancestorHasStaffLock,
    isPrereq,
    prereqs,
    prereq,
    prereqMinScore,
    prereqMinCompletion,
    releasedToStudents,
    wasExamEverLinkedWithExternal,
    isProctoredExam,
    isOnboardingExam,
    isPracticeExam,
    examReviewRules,
    supportsOnboarding,
    showReviewRules,
    onlineProctoringRules,
  } = useSelector(getCurrentItem);
  const enableProctoredExams = useSelector(getProctoredExamsFlag);

  const getSelectedGroups = () => {
    if (userPartitionInfo?.selectedPartitionIndex >= 0) {
      return userPartitionInfo?.selectablePartitions[userPartitionInfo?.selectedPartitionIndex]
        ?.groups
        .filter(({ selected }) => selected)
        .map(({ id }) => `${id}`)
        || [];
    }
    return [];
  };

  const defaultPrereqScore = (val) => {
    if (val === null || val === undefined) {
      return 100;
    }
    return parseFloat(val);
  };

  const initialValues = {
    releaseDate: sectionStartDate,
    isVisibleToStaffOnly: visibilityState === VisibilityTypes.STAFF_ONLY,
    saveButtonDisabled: true,
    graderType: format == null ? 'notgraded' : format,
    dueDate: due == null ? '' : due,
    isTimeLimited,
    isProctoredExam,
    isOnboardingExam,
    isPracticeExam,
    examReviewRules,
    defaultTimeLimitMinutes,
    hideAfterDue: hideAfterDue === undefined ? false : hideAfterDue,
    showCorrectness,
    isPrereq,
    prereqUsageKey: prereq,
    prereqMinScore: defaultPrereqScore(prereqMinScore),
    prereqMinCompletion: defaultPrereqScore(prereqMinCompletion),
    // by default it is -1 i.e. accessible to all learners & staff
    selectedPartitionIndex: userPartitionInfo?.selectedPartitionIndex,
    selectedGroups: getSelectedGroups(),
  };

  const validationSchema = Yup.object().shape({
    isTimeLimited: Yup.boolean(),
    isProctoredExam: Yup.boolean(),
    isPracticeExam: Yup.boolean(),
    isOnboardingExam: Yup.boolean(),
    examReviewRules: Yup.string(),
    defaultTimeLimitMinutes: Yup.number().nullable(true),
    hideAfterDueState: Yup.boolean(),
    showCorrectness: Yup.string().required(),
    isPrereq: Yup.boolean(),
    prereqUsageKey: Yup.string().nullable(true),
    prereqMinScore: Yup.number().min(
      0,
      intl.formatMessage(messages.minScoreError),
    ).max(
      100,
      intl.formatMessage(messages.minScoreError),
    ).nullable(true),
    prereqMinCompletion: Yup.number().min(
      0,
      intl.formatMessage(messages.minScoreError),
    ).max(
      100,
      intl.formatMessage(messages.minScoreError),
    ).nullable(true),
    selectedPartitionIndex: Yup.number().integer(),
    selectedGroups: Yup.array().of(Yup.string()),
  });

  const isSubsection = category === COURSE_BLOCK_NAMES.sequential.id;

  const handleSave = (data) => {
    const groupAccess = {};
    switch (category) {
    case COURSE_BLOCK_NAMES.chapter.id:
      onConfigureSubmit(data.isVisibleToStaffOnly, data.releaseDate);
      break;
    case COURSE_BLOCK_NAMES.sequential.id:
      onConfigureSubmit(
        data.isVisibleToStaffOnly,
        data.releaseDate,
        data.graderType,
        data.dueDate,
        data.isTimeLimited,
        data.isProctoredExam,
        data.isOnboardingExam,
        data.isPracticeExam,
        data.examReviewRules,
        data.isTimeLimited ? data.defaultTimeLimitMinutes : 0,
        data.hideAfterDue,
        data.showCorrectness,
        data.isPrereq,
        data.prereqUsageKey,
        data.prereqMinScore,
        data.prereqMinCompletion,
      );
      break;
    case COURSE_BLOCK_NAMES.vertical.id:
      // groupAccess should be {partitionId: [group1, group2]} or {} if selectedPartitionIndex === -1
      if (data.selectedPartitionIndex >= 0) {
        const partitionId = userPartitionInfo.selectablePartitions[data.selectedPartitionIndex].id;
        groupAccess[partitionId] = data.selectedGroups.map(g => parseInt(g, 10));
      }
      onConfigureSubmit(data.isVisibleToStaffOnly, groupAccess);
      break;
    default:
      break;
    }
  };

  const renderModalBody = (values, setFieldValue) => {
    switch (category) {
    case COURSE_BLOCK_NAMES.chapter.id:
      return (
        <Tabs>
          <Tab eventKey="basic" title={intl.formatMessage(messages.basicTabTitle)}>
            <BasicTab
              values={values}
              setFieldValue={setFieldValue}
              isSubsection={isSubsection}
              courseGraders={courseGraders === 'undefined' ? [] : courseGraders}
            />
          </Tab>
          <Tab eventKey="visibility" title={intl.formatMessage(messages.visibilityTabTitle)}>
            <VisibilityTab
              values={values}
              setFieldValue={setFieldValue}
              category={category}
              isSubsection={isSubsection}
              showWarning={visibilityState === VisibilityTypes.STAFF_ONLY}
            />
          </Tab>
        </Tabs>
      );
    case COURSE_BLOCK_NAMES.sequential.id:
      return (
        <Tabs>
          <Tab eventKey="basic" title={intl.formatMessage(messages.basicTabTitle)}>
            <BasicTab
              values={values}
              setFieldValue={setFieldValue}
              isSubsection={isSubsection}
              courseGraders={courseGraders === 'undefined' ? [] : courseGraders}
            />
          </Tab>
          <Tab eventKey="visibility" title={intl.formatMessage(messages.visibilityTabTitle)}>
            <VisibilityTab
              values={values}
              setFieldValue={setFieldValue}
              category={category}
              isSubsection={isSubsection}
              showWarning={visibilityState === VisibilityTypes.STAFF_ONLY}
            />
          </Tab>
          <Tab eventKey="advanced" title={intl.formatMessage(messages.advancedTabTitle)}>
            <AdvancedTab
              values={values}
              setFieldValue={setFieldValue}
              prereqs={prereqs}
              releasedToStudents={releasedToStudents}
              wasExamEverLinkedWithExternal={wasExamEverLinkedWithExternal}
              enableProctoredExams={enableProctoredExams}
              supportsOnboarding={supportsOnboarding}
              showReviewRules={showReviewRules}
              wasProctoredExam={isProctoredExam}
              onlineProctoringRules={onlineProctoringRules}
            />
          </Tab>
        </Tabs>
      );
    case COURSE_BLOCK_NAMES.vertical.id:
      return (
        <UnitTab
          values={values}
          setFieldValue={setFieldValue}
          showWarning={visibilityState === VisibilityTypes.STAFF_ONLY && !ancestorHasStaffLock}
          userPartitionInfo={userPartitionInfo}
        />
      );
    default:
      return null;
    }
  };

  return (
    <ModalDialog
      className="configure-modal"
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
      isFullscreenOnMobile
    >
      <div data-testid="configure-modal">
        <ModalDialog.Header className="configure-modal__header">
          <ModalDialog.Title>
            {intl.formatMessage(messages.title, { title: displayName })}
          </ModalDialog.Title>
        </ModalDialog.Header>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSave}
          validationSchema={validationSchema}
          validateOnBlur
          validateOnChange
        >
          {({
            values, handleSubmit, dirty, isValid, setFieldValue,
          }) => (
            <>
              <ModalDialog.Body className="configure-modal__body">
                <Form.Group size="sm" className="form-field">
                  {renderModalBody(values, setFieldValue)}
                </Form.Group>
              </ModalDialog.Body>
              <ModalDialog.Footer className="pt-1">
                <ActionRow>
                  <ModalDialog.CloseButton variant="tertiary">
                    {intl.formatMessage(messages.cancelButton)}
                  </ModalDialog.CloseButton>
                  <Button data-testid="configure-save-button" onClick={handleSubmit} disabled={!(dirty && isValid)}>
                    {intl.formatMessage(messages.saveButton)}
                  </Button>
                </ActionRow>
              </ModalDialog.Footer>
            </>
          )}
        </Formik>
      </div>
    </ModalDialog>
  );
};

ConfigureModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfigureSubmit: PropTypes.func.isRequired,
};

export default ConfigureModal;
