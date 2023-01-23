export const messages = {
  advanceProblemButtonLabel: {
    id: 'authoring.problemEditor.problemSelect.advanceButton.label',
    defaultMessage: 'Advance problem types',
    description: 'Button label for advance problem types option',
  },
  advanceMenuTitle: {
    id: 'authoring.problemEditor.advanceProblem.menu.title',
    defaultMessage: 'Advanced problems',
    description: 'Title for advanced problem menu',
  },
  advanceProblemTypeLabel: {
    id: 'authoring.problemEditor.advanceProblem.problemType.label',
    defaultMessage: '{problemType}',
    description: 'Label for advance problem type radio select',
  },
  problemSupportStatus: {
    id: 'authoring.problemEditor.advanceProblem.supportStatus',
    defaultMessage: '{supportStatus}',
    description: 'Text for advance problem type\'s support status',
  },
  supportStatusTooltipMessage: {
    id: 'authoring.problemEditor.advanceProblem.supportStatus.tooltipMessage',
    defaultMessage: `{supportStatus,  select,
      Provisional {Provisionally supported tools might lack the robustness of functionality
        that your courses require. edX does not have control over the quality of the software,
        or of the content that can be provided using these tools.
        \n \n
        Test these tools thoroughly before using them in your course, especially in graded
        sections. Complete documentstion might not be available for provisionally supported
        tools, or documentation might be available from sources other than edX.}
      Not_supported {Tools with no support are not maintained by edX, and might be deprecated
        in the future. They are not recommened for use in courses due to non-compliance with one
        or more of the base requirements, such as testing, accessibility, internationalization,
        and documentation.}
      other { } 
    }`,
    description: 'Message for support status tooltip',
  },
  previewTitle: {
    id: 'authoring.problemEditor.preview.title',
    defaultMessage: '{previewTitle}',
    description: 'Title for the problem preview column',
  },
  previewAltText: {
    id: 'authoring.problemEditor.preview.altText',
    defaultMessage: `A preview illustration of a {problemType, select,
      multiplechoiceresponse {single select}
      stringreponse {text input}
      numericalresponse {numerical input}
      optionresponse {dropdown}
      choiceresponse {multiple select}
      other {null}
    } problem`,
    description: 'Alt text for the illustration of the problem preview',
  },
  previewDescription: {
    id: 'authoring.problemEditor.preview.description',
    defaultMessage: '{previewDescription}',
    description: 'Description of the selected problem type',
  },
  learnMoreButtonLabel: {
    id: 'authoring.problemEditor.learnMoreButtonLabel.label',
    defaultMessage: 'Learn More',
    description: 'Label for Learn More button',
  },
};

export default messages;
