import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  addNewSegmentButtonAltText: {
    id: 'course-authoring.grading-settings.add-new-segment.btn.text',
    defaultMessage: 'Add new grading segment',
  },
  removeSegmentButtonText: {
    id: 'course-authoring.grading-settings.remove-segment.btn.text',
    defaultMessage: 'Remove',
  },
  segmentFailGradingText: {
    id: 'course-authoring.grading-settings.fail-segment.text',
    defaultMessage: 'Fail',
  },
  defaultPassText: {
    id: 'course-authoring.grading-settings.default.pass.text',
    defaultMessage: 'Pass',
  },
  segmentBoundaryAriaLabel: {
    id: 'course-authoring.grading-settings.segment-boundary.aria-label',
    defaultMessage: 'Boundary between {higherGrade} and {lowerGrade}',
    description: 'Accessible (screen reader) name for a draggable handle on the grading scale. The handle moves the cutoff between two neighboring grades, e.g. "Boundary between A and B".',
  },
  segmentNameInputAriaLabel: {
    id: 'course-authoring.grading-settings.segment-name.input.aria-label',
    defaultMessage: 'Grade name',
    description: 'Accessible (screen reader) label for the editable text field that holds the name of a grade on the grading scale, e.g. "A" or "Pass".',
  },
});

export default messages;
