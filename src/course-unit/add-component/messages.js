import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'course-authoring.course-unit.add.component.title',
    defaultMessage: 'Add a new component',
  },
  buttonText: {
    id: 'course-authoring.course-unit.add.component.button.text',
    defaultMessage: 'Add Component:',
  },
  modalBtnText: {
    id: 'course-authoring.course-unit.modal.button.text',
    defaultMessage: 'Select',
  },
  modalContainerTitle: {
    id: 'course-authoring.course-unit.modal.container.title',
    defaultMessage: 'Add {componentTitle} component',
  },
  modalContainerCancelBtnText: {
    id: 'course-authoring.course-unit.modal.container.cancel.button.text',
    defaultMessage: 'Cancel',
  },
  modalComponentSupportLabelFullySupported: {
    id: 'course-authoring.course-unit.modal.component.support.label.fully-supported',
    defaultMessage: 'Fully supported',
    description: 'Label for advance problem type\'s support status with full platform support',
  },
  modalComponentSupportLabelProvisionallySupported: {
    id: 'course-authoring.course-unit.modal.component.support.label.provisionally-support',
    defaultMessage: 'Provisionally supported',
    description: 'Label for advance problem type\'s support status with provisional platform support',
  },
  modalComponentSupportLabelNotSupported: {
    id: 'course-authoring.course-unit.modal.component.support.label.not-supported',
    defaultMessage: 'Not supported',
    description: 'Label for advance problem type\'s support status with no platform support',
  },
  modalComponentSupportTooltipFullySupported: {
    id: 'course-authoring.course-unit.modal.component.support.tooltip.fully-supported',
    defaultMessage: 'Fully supported tools and features are available on edX, are '
      + 'fully tested, have user interfaces where applicable, and are documented in the '
      + 'official edX guides that are available on docs.edx.org.',
    description: 'Message for support status tooltip for modules with full platform support',
  },
  modalComponentSupportTooltipNotSupported: {
    id: 'course-authoring.course-unit.modal.component.support.tooltip.not-supported',
    defaultMessage: 'Tools with no support are not maintained by edX, and might be '
      + 'deprecated in the future. They are not recommended for use in courses due to '
      + 'non-compliance with one or more of the base requirements, such as testing, '
      + 'accessibility, internationalization, and documentation.',
    description: 'Message for support status tooltip for modules which is not supported',
  },
  modalComponentSupportTooltipProvisionallySupported: {
    id: 'course-authoring.course-unit.modal.component.support.tooltip.provisionally-support',
    defaultMessage: 'Provisionally supported tools might lack the robustness of functionality '
      + 'that your courses require. edX does not have control over the quality of the software, '
      + 'or of the content that can be provided using these tools. Test these tools thoroughly '
      + 'before using them in your course, especially in graded sections. Complete documentation '
      + 'might not be available for provisionally supported tools, or documentation might be '
      + 'available from sources other than edX.',
    description: 'Message for support status tooltip for modules with provisional platform support',
  },
});

export default messages;
