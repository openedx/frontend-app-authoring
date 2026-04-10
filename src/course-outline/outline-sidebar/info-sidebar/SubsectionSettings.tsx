import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, ButtonGroup, Form, Stack,
} from '@openedx/paragon';
import { useConfigureSubsection, useCourseDetails, useCourseItemData } from '@src/course-outline/data/apiHooks';
import { getProctoredExamsFlag, getTimedExamsFlag } from '@src/course-outline/data/selectors';
import { ConfigureSubsectionData } from '@src/course-outline/data/types';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import AdvancedTab from '@src/generic/configure-modal/AdvancedTab';
import { DatepickerControl, DATEPICKER_TYPES } from '@src/generic/datepicker-control';
import { SidebarContent, SidebarSection } from '@src/generic/sidebar';
import { useStateWithCallback } from '@src/hooks';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ReleaseSection } from './sharedSettings/ReleaseSection';
import messages from './messages';
import { VisibilitySection } from './sharedSettings/VisibilitySection';

interface Props {
  subsectionId: string;
}

const defaultPrereqScore = (val: string | number | null | undefined) => {
  if (val === null || val === undefined) {
    return 100;
  }
  const parsed = parseFloat(val.toString());
  return Number.isNaN(parsed) ? 100 : parsed;
};

interface SubProps extends Props {
  onChange: (variables: Partial<ConfigureSubsectionData>) => void;
}

const GradingSection = ({ subsectionId, onChange }: SubProps) => {
  const intl = useIntl();
  const { data: itemData } = useCourseItemData(subsectionId);
  const [graded, setGraded] = useState(itemData?.graded);
  const { courseId } = useCourseAuthoringContext();
  const { data: courseDetails } = useCourseDetails(courseId);
  const [localState, setLocalState] = useStateWithCallback<Partial<ConfigureSubsectionData>>(
    {
      graderType: itemData?.format,
      dueDate: itemData?.due || '',
    },
    (val) => onChange(val || {}),
  );

  const setUngraded = () => {
    setGraded(false);
    onChange({ graderType: 'notgraded' });
  };

  const createOptions = () => itemData?.courseGraders?.map((option) => (
    <option key={option} value={option}> {option} </option>
  ));

  return (
    <SidebarSection
      title={intl.formatMessage(messages.subsectionGradingTitle)}
    >
      <ButtonGroup toggle>
        <Button
          variant={graded ? 'outline-primary' : 'primary'}
          onClick={setUngraded}
        >
          <FormattedMessage {...messages.subsectionGradingUngradedBtn} />
        </Button>
        <Button
          variant={graded ? 'primary' : 'outline-primary'}
          onClick={() => setGraded(true)}
        >
          <FormattedMessage {...messages.subsectionGradingGradedBtn} />
        </Button>
      </ButtonGroup>
      {graded
        && (
        <Form.Group className="mt-2">
          <Form.Label className="x-small">
            <FormattedMessage {...messages.subsectionGradingDropdownLabel} />
          </Form.Label>
          <Form.Control
            as="select"
            defaultValue={itemData?.format}
            onChange={(e) => setLocalState((prev) => ({ ...prev, graderType: e.target.value }))}
            data-testid="grader-type-select"
          >
            <option key="notgraded" value="notgraded">
              {intl.formatMessage(messages.subsectionGradingDropdownPlaceholder)}
            </option>
            {createOptions()}
          </Form.Control>
        </Form.Group>
        )}
      {!courseDetails?.selfPaced && graded
        && (
        <Stack direction="horizontal" gap={3}>
          <DatepickerControl
            type={DATEPICKER_TYPES.date}
            value={localState?.dueDate}
            label={intl.formatMessage(messages.subsectionGradingDueDateLabel)}
            controlName="state-date"
            onChange={(val) => setLocalState((prev) => ({ ...prev, dueDate: val }))}
            data-testid="due-date-picker"
          />
          <DatepickerControl
            type={DATEPICKER_TYPES.time}
            value={localState?.dueDate}
            label={intl.formatMessage(messages.subsectionGradingDueTimeLabel)}
            controlName="start-time"
            onChange={(val) => setLocalState((prev) => ({ ...prev, dueDate: val }))}
          />
        </Stack>
        )}
    </SidebarSection>
  );
};

const AssessmentResultVisibilitySection = ({ subsectionId, onChange }: SubProps) => {
  const intl = useIntl();
  const { data: itemData } = useCourseItemData(subsectionId);
  const [localState, setLocalState] = useStateWithCallback<Partial<ConfigureSubsectionData>>(
    {
      showCorrectness: itemData?.showCorrectness,
    },
    (val) => onChange(val || {}),
  );

  return (
    <SidebarSection
      title={intl.formatMessage(messages.subsectionAssessmentResultsTitle)}
    >
      <ButtonGroup toggle>
        <Button
          variant={localState?.showCorrectness === 'always' ? 'primary' : 'outline-primary'}
          onClick={() => setLocalState({ showCorrectness: 'always' })}
        >
          <FormattedMessage {...messages.subsectionAssessmentResultsShowBtn} />
        </Button>
        <Button
          variant={['never', 'past_due'].includes(localState?.showCorrectness || '') ? 'primary' : 'outline-primary'}
          onClick={() => {
            if (localState?.showCorrectness === 'always') {
              setLocalState({ showCorrectness: 'never' });
            }
          }}
        >
          <FormattedMessage {...messages.subsectionAssessmentResultsHideBtn} />
        </Button>
      </ButtonGroup>
      <Form.Checkbox
        checked={localState?.showCorrectness === 'past_due'}
        className="mt-2"
        onChange={() => setLocalState({ showCorrectness: 'past_due' })}
      >
        <FormattedMessage {...messages.subsectionAssessmentResultsCheckbox} />
      </Form.Checkbox>
    </SidebarSection>
  );
};

const SpecialExamSection = ({ subsectionId, onChange }: SubProps) => {
  const intl = useIntl();
  const { data: itemData } = useCourseItemData(subsectionId);
  const enableTimedExams = useSelector(getTimedExamsFlag);
  const enableProctoredExams = useSelector(getProctoredExamsFlag);
  const getLatestLocalState = useCallback(() => {
    return {
      isProctoredExam: itemData?.isProctoredExam,
      isTimeLimited: itemData?.isTimeLimited,
      isOnboardingExam: itemData?.isOnboardingExam,
      isPracticeExam: itemData?.isPracticeExam,
      defaultTimeLimitMinutes: itemData?.defaultTimeLimitMinutes,
      examReviewRules: itemData?.examReviewRules,
      isPrereq: itemData?.isPrereq,
      prereqMinScore: defaultPrereqScore(itemData?.prereqMinScore),
      prereqMinCompletion: defaultPrereqScore(itemData?.prereqMinCompletion),
      prereqUsageKey: itemData?.prereq,
    };
  }, [itemData]);

  const [localState, setLocalState] = useStateWithCallback<Partial<ConfigureSubsectionData>>(
    getLatestLocalState(),
    (val) => onChange(val || {})
  );

  useEffect(() => {
    if (!itemData) return;
    setLocalState({ value: getLatestLocalState(), skipCallback: true });
  }, [itemData]);

  const setFieldValue = (key: keyof ConfigureSubsectionData, value: any) => {
    setLocalState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <SidebarSection
      title={intl.formatMessage(messages.subsectionSpecialExamTitle)}
    >
      <AdvancedTab
        values={localState || {}}
        setFieldValue={setFieldValue}
        prereqs={itemData?.prereqs}
        releasedToStudents={itemData?.releasedToStudents}
        wasExamEverLinkedWithExternal={itemData?.wasExamEverLinkedWithExternal}
        enableProctoredExams={enableProctoredExams}
        enableTimedExams={enableTimedExams}
        supportsOnboarding={itemData?.supportsOnboarding}
        showReviewRules={itemData?.showReviewRules}
        wasProctoredExam={itemData?.isProctoredExam}
        onlineProctoringRules={itemData?.onlineProctoringRules}
        hideTitle
        useBtnGroup
      />
    </SidebarSection>
  );
};

export const SubsectionSettings = ({ subsectionId }: Props) => {
  const { courseId } = useCourseAuthoringContext();
  const { data: courseDetails } = useCourseDetails(courseId);
  const { data: itemData, isPending } = useCourseItemData(subsectionId);
  const { mutate } = useConfigureSubsection();
  const { selectedContainerState } = useOutlineSidebarContext();

  const onChange = (variables: Partial<ConfigureSubsectionData>) => {
    if (isPending || !itemData) {
      return;
    }

    mutate({
      itemId: subsectionId,
      sectionId: selectedContainerState?.sectionId,
      ...variables,
    });
  };

  return (
    <SidebarContent>
      { !courseDetails?.selfPaced && (
      <ReleaseSection
        itemId={subsectionId}
        onChange={(val: string) => onChange({ releaseDate: val })}
      />
      ) }
      <GradingSection
        subsectionId={subsectionId}
        onChange={onChange}
      />
      <VisibilitySection
        itemId={subsectionId}
        isSubsection
        onChange={onChange}
      />
      <AssessmentResultVisibilitySection
        subsectionId={subsectionId}
        onChange={onChange}
      />
      <SpecialExamSection
        subsectionId={subsectionId}
        onChange={onChange}
      />
    </SidebarContent>
  );
};
