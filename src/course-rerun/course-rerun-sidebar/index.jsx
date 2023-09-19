import React from 'react';
import { v4 as uuid } from 'uuid';
import { Hyperlink } from '@edx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useHelpUrls } from '../../help-urls/hooks';
import { HelpSidebar } from '../../generic/help-sidebar';
import messages from './messages';

const CourseRerunSideBar = () => {
  const intl = useIntl();
  const { default: learnMoreUrl } = useHelpUrls(['default']);

  const sidebarMessages = [
    {
      title: intl.formatMessage(messages.sectionTitle1),
      description: intl.formatMessage(messages.sectionDescription1),
    },
    {
      title: intl.formatMessage(messages.sectionTitle2),
      description: intl.formatMessage(messages.sectionDescription2),
    },
    {
      title: intl.formatMessage(messages.sectionTitle3),
      description: intl.formatMessage(messages.sectionDescription3),
    },
    {
      link: {
        text: intl.formatMessage(messages.sectionLink4),
        href: learnMoreUrl,
      },
    },
  ];

  return (
    <HelpSidebar
      intl={intl}
      showOtherSettings={false}
      className="mt-3"
    >
      {sidebarMessages.map(({ title, description, link }, index) => {
        const isLastSection = index === sidebarMessages.length - 1;

        return (
          <div key={uuid()}>
            <h4 className="help-sidebar-about-title">{title}</h4>
            <p className="help-sidebar-about-descriptions">{description}</p>
            {!!link && (
              <Hyperlink
                className="small"
                destination={link.href || ''}
                target="_blank"
                showLaunchIcon={false}
              >
                {link.text}
              </Hyperlink>
            )}
            {!isLastSection && <hr className="my-3.5" />}
          </div>
        );
      })}
    </HelpSidebar>
  );
};

export default CourseRerunSideBar;
