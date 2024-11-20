/**
 * Compiles the sidebar data for the course authoring sidebar.
 *
 * @param {Object} messages - The localized messages.
 * @param {Object} intl - The intl object for formatting messages.
 * @param {boolean} shouldShowExperimentGroups - Flag to include experiment group configuration data.
 * @param {boolean} shouldShowContentGroup - Flag to include content group data.
 * @param {boolean} shouldShowEnrollmentTrackGroup - Flag to include enrollment track group data.
 * @returns {Object[]} The array of sidebar data groups.
 */
const getSidebarData = ({
  messages, intl, shouldShowExperimentGroups, shouldShowContentGroup, shouldShowEnrollmentTrackGroup,
}) => {
  const groups = [];

  if (shouldShowEnrollmentTrackGroup) {
    groups.push({
      urlKey: 'enrollmentTracks',
      title: intl.formatMessage(messages.about_3_title),
      paragraphs: [
        intl.formatMessage(messages.about_3_description_1),
        intl.formatMessage(messages.about_3_description_2),
        intl.formatMessage(messages.about_3_description_3),
      ],
    });
  }
  if (shouldShowContentGroup) {
    groups.push({
      urlKey: 'contentGroups',
      title: intl.formatMessage(messages.aboutTitle),
      paragraphs: [
        intl.formatMessage(messages.aboutDescription_1),
        intl.formatMessage(messages.aboutDescription_2),
        intl.formatMessage(messages.aboutDescription_3, {
          strongText: <strong>{intl.formatMessage(messages.aboutDescription_3_strong)}</strong>,
          strongText2: <strong>{intl.formatMessage(messages.aboutDescription_strong_edit)}</strong>,
        }),
      ],
    });
  }
  if (shouldShowExperimentGroups) {
    groups.push({
      urlKey: 'groupConfigurations',
      title: intl.formatMessage(messages.about_2_title),
      paragraphs: [
        intl.formatMessage(messages.about_2_description_1),
        intl.formatMessage(messages.about_2_description_2, {
          strongText: <strong>{intl.formatMessage(messages.about_2_description_2_strong)}</strong>,
          strongText2: <strong>{intl.formatMessage(messages.aboutDescription_strong_edit)}</strong>,
        }),
      ],
    });
  }
  return groups;
};

export { getSidebarData };
