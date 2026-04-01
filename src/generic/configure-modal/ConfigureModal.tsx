import * as Yup from 'yup';
import { useIntl } from '@edx/frontend-platform/i18n';
import { ModalDialog, Button, ActionRow, Form, Tab, Tabs } from '@openedx/paragon';
import { Formik } from 'formik';

import { VisibilityTypes } from '@src/data/constants';
import { COURSE_BLOCK_NAMES } from '@src/constants';
import { AccessManagedXBlockDataTypes } from '@src/data/types';
import messages from './messages';
import BasicTab from './BasicTab';
import VisibilityTab from './VisibilityTab';
import AdvancedTab from './AdvancedTab';
import { UnitTab } from './UnitTab';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfigureSubmit: (args: object) => void;
  enableProctoredExams?: boolean;
  enableTimedExams?: boolean;
  currentItemData?: AccessManagedXBlockDataTypes;
  isXBlockComponent?: boolean;
  isSelfPaced?: boolean;
  isOverflowVisible?: boolean;
}

const ConfigureModal = ({
  isOpen,
  onClose,
  onConfigureSubmit,
  currentItemData,
  enableProctoredExams = false,
  enableTimedExams = false,
  isXBlockComponent = false,
  isSelfPaced,
  isOverflowVisible = false,
}: Props) => {
  const intl = useIntl();

  if (!currentItemData) {
    return null;
  }

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
    discussionEnabled,
  } = currentItemData;

  const getSelectedGroups = () => {
    if ((userPartitionInfo?.selectedPartitionIndex || 0) >= 0) {
      return (
        userPartitionInfo?.selectablePartitions[userPartitionInfo?.selectedPartitionIndex]?.groups
          .filter(({ selected }) => selected)
          .map(({ id }) => `${id}`) || []
      );
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
    discussionEnabled,
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
    prereqMinScore: Yup.number()
      .min(0, intl.formatMessage(messages.minScoreError))
      .max(100, intl.formatMessage(messages.minScoreError))
      .nullable(true),
    prereqMinCompletion: Yup.number()
      .min(0, intl.formatMessage(messages.minScoreError))
      .max(100, intl.formatMessage(messages.minScoreError))
      .nullable(true),
    selectedPartitionIndex: Yup.number().integer(),
    selectedGroups: Yup.array().of(Yup.string()),
    discussionEnabled: Yup.boolean(),
  });

  const isSubsection = category === COURSE_BLOCK_NAMES.sequential.id;

  const dialogTitle = isXBlockComponent
    ? intl.formatMessage(messages.componentTitle, { title: displayName })
    : intl.formatMessage(messages.title, { title: displayName });

  const handleSave = (data) => {
    let { releaseDate } = data;
    // to prevent passing an empty string to the backend
    releaseDate = releaseDate || null;
    const groupAccess = {};
    switch (category) {
      case COURSE_BLOCK_NAMES.chapter.id:
        onConfigureSubmit({
          isVisibleToStaffOnly: data.isVisibleToStaffOnly,
          startDatetime: releaseDate,
        });
        break;
      case COURSE_BLOCK_NAMES.sequential.id:
        onConfigureSubmit({
          isVisibleToStaffOnly: data.isVisibleToStaffOnly,
          releaseDate,
          graderType: data.graderType,
          dueDate: data.dueDate,
          isTimeLimited: data.isTimeLimited,
          isProctoredExam: data.isProctoredExam,
          isOnboardingExam: data.isOnboardingExam,
          isPracticeExam: data.isPracticeExam,
          examReviewRules: data.examReviewRules,
          defaultTimeLimitMin: data.isTimeLimited ? data.defaultTimeLimitMinutes : 0,
          hideAfterDue: data.hideAfterDue,
          showCorrectness: data.showCorrectness,
          isPrereq: data.isPrereq,
          prereqUsageKey: data.prereqUsageKey,
          prereqMinScore: data.prereqMinScore,
          prereqMinCompletion: data.prereqMinCompletion,
        });
        break;
      case COURSE_BLOCK_NAMES.vertical.id:
      case COURSE_BLOCK_NAMES.libraryContent.id:
      case COURSE_BLOCK_NAMES.splitTest.id:
      case COURSE_BLOCK_NAMES.component.id:
        // groupAccess should be {partitionId: [group1, group2]} or {} if selectedPartitionIndex === -1
        if (data.selectedPartitionIndex >= 0) {
          const partitionId = userPartitionInfo!.selectablePartitions[data.selectedPartitionIndex].id;
          groupAccess[partitionId] = data.selectedGroups.map((g) => parseInt(g, 10));
        }
        onConfigureSubmit({
          isVisibleToStaffOnly: data.isVisibleToStaffOnly,
          groupAccess,
          discussionEnabled: data.discussionEnabled,
        });
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
                courseGraders={courseGraders || []}
                isSelfPaced={!!isSelfPaced}
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
                courseGraders={courseGraders || []}
                isSelfPaced={!!isSelfPaced}
              />
            </Tab>
            <Tab eventKey="visibility" title={intl.formatMessage(messages.visibilityTabTitle)}>
              <VisibilityTab
                values={values}
                setFieldValue={setFieldValue}
                category={category}
                isSubsection={isSubsection}
                showWarning={visibilityState === VisibilityTypes.STAFF_ONLY}
                isSelfPaced={isSelfPaced}
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
                enableTimedExams={enableTimedExams}
                supportsOnboarding={supportsOnboarding}
                showReviewRules={showReviewRules}
                wasProctoredExam={isProctoredExam}
                onlineProctoringRules={onlineProctoringRules}
              />
            </Tab>
          </Tabs>
        );
      case COURSE_BLOCK_NAMES.vertical.id:
      case COURSE_BLOCK_NAMES.libraryContent.id:
      case COURSE_BLOCK_NAMES.splitTest.id:
      case COURSE_BLOCK_NAMES.component.id:
        return (
          <UnitTab
            isXBlockComponent={isXBlockComponent}
            category={category}
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
      title={dialogTitle}
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
      isFullscreenOnMobile
      isOverflowVisible={isOverflowVisible}
    >
      <div data-testid="configure-modal">
        <ModalDialog.Header className="configure-modal__header">
          <ModalDialog.Title>{dialogTitle}</ModalDialog.Title>
        </ModalDialog.Header>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSave}
          validationSchema={validationSchema}
          validateOnBlur
          validateOnChange
        >
          {({ values, handleSubmit, setFieldValue }) => (
            <Form onSubmit={handleSubmit}>
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
                  <Button data-testid="configure-save-button" type="submit">
                    {intl.formatMessage(messages.saveButton)}
                  </Button>
                </ActionRow>
              </ModalDialog.Footer>
            </Form>
          )}
        </Formik>
      </div>
    </ModalDialog>
  );
};

export default ConfigureModal;
