import React from 'react';
import messages from './messages';

/**
 * Get formatted sidebar messages for render
 * @param {object} docsLinks - Docs links object from store
 * @returns {Array<{
 *   title: string,
 *   descriptions: Array<string>,
 *   link?: {
 *     text: string,
 *     href: string
 *   }
 * }>}
 */
const getFormattedSidebarMessages = (docsLinks, intl) => {
  const { outline, grading, visibility } = docsLinks;

  return [
    {
      title: intl.formatMessage(messages.section_1_title),
      descriptions: [
        intl.formatMessage(messages.section_1_descriptions_1),
        intl.formatMessage(messages.section_1_descriptions_2),
      ],
    },
    {
      title: intl.formatMessage(messages.section_2_title),
      descriptions: [
        intl.formatMessage(messages.section_2_descriptions_1),
      ],
      link: {
        text: intl.formatMessage(messages.section_2_link),
        href: outline,
      },
    },
    {
      title: intl.formatMessage(messages.section_3_title),
      descriptions: [
        intl.formatMessage(messages.section_3_descriptions_1),
      ],
      link: {
        text: intl.formatMessage(messages.section_3_link),
        href: grading,
      },
    },
    {
      title: intl.formatMessage(messages.section_4_title),
      descriptions: [
        intl.formatMessage(messages.section_4_descriptions_1),
        intl.formatMessage(
          messages.section_4_descriptions_2,
          { strong: <strong>{intl.formatMessage(messages.section_4_descriptions_2_hide)}</strong> },
        ),
        intl.formatMessage(
          messages.section_4_descriptions_3,
          { strong: <strong>{intl.formatMessage(messages.section_4_descriptions_3_hide)}</strong> },
        ),
      ],
      link: {
        text: intl.formatMessage(messages.section_4_link),
        href: visibility,
      },
    },
  ];
};

// eslint-disable-next-line import/prefer-default-export
export { getFormattedSidebarMessages };
