import { type IntlShape } from '@edx/frontend-platform/i18n';
import { type ReactNode } from 'react';
import type { MessageDescriptor } from 'react-intl';

import messages from './messages';

interface SidebarParagraph {
  id: string;
  content: ReactNode;
}

interface SidebarGroup {
  urlKey: string;
  title: string;
  paragraphs: SidebarParagraph[];
}

interface GetSidebarDataArgs {
  intl: IntlShape;
  shouldShowExperimentGroups: boolean;
  shouldShowContentGroup: boolean;
  shouldShowEnrollmentTrackGroup: boolean;
  readOnly?: boolean;
}

/** Formats a message into a paragraph keyed by its message id. */
const paragraph = (
  intl: IntlShape,
  message: MessageDescriptor,
  values?: Record<string, ReactNode>,
): SidebarParagraph => ({
  id: String(message.id),
  content: intl.formatMessage(message, values),
});

/**
 * Compiles the sidebar data for the course authoring sidebar.
 *
 * Read-only users cannot add, edit or delete anything on this page, so the paragraphs
 * explaining how to do so are left out for them.
 */
const getSidebarData = ({
  intl,
  shouldShowExperimentGroups,
  shouldShowContentGroup,
  shouldShowEnrollmentTrackGroup,
  readOnly = false,
}: GetSidebarDataArgs): SidebarGroup[] => {
  const groups: SidebarGroup[] = [];

  if (shouldShowEnrollmentTrackGroup) {
    groups.push({
      urlKey: 'enrollmentTracks',
      title: intl.formatMessage(messages.about_3_title),
      paragraphs: [
        paragraph(intl, messages.about_3_description_1),
        paragraph(intl, messages.about_3_description_2),
        paragraph(intl, messages.about_3_description_3),
      ],
    });
  }
  if (shouldShowContentGroup) {
    groups.push({
      urlKey: 'contentGroups',
      title: intl.formatMessage(messages.aboutTitle),
      paragraphs: [
        paragraph(intl, messages.aboutDescription_1),
        paragraph(intl, messages.aboutDescription_2),
        ...(readOnly ? [] : [
          paragraph(intl, messages.aboutDescription_3, {
            strongText: <strong>{intl.formatMessage(messages.aboutDescription_3_strong)}</strong>,
            strongText2: <strong>{intl.formatMessage(messages.aboutDescription_strong_edit)}</strong>,
          }),
        ]),
      ],
    });
  }
  if (shouldShowExperimentGroups) {
    groups.push({
      urlKey: 'groupConfigurations',
      title: intl.formatMessage(messages.about_2_title),
      paragraphs: [
        paragraph(intl, messages.about_2_description_1),
        ...(readOnly ? [] : [
          paragraph(intl, messages.about_2_description_2, {
            strongText: <strong>{intl.formatMessage(messages.about_2_description_2_strong)}</strong>,
            strongText2: <strong>{intl.formatMessage(messages.aboutDescription_strong_edit)}</strong>,
          }),
        ]),
      ],
    });
  }
  return groups;
};

export { getSidebarData };
