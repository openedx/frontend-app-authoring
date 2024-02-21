import React from 'react';
import PropTypes from 'prop-types';
import { Hyperlink } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { HelpSidebar } from '../../generic/help-sidebar';
import { useHelpUrls } from '../../help-urls/hooks';
import { getFormattedSidebarMessages } from './utils';

const OutlineSideBar = ({ courseId }) => {
  const intl = useIntl();
  const {
    visibility: learnMoreVisibilityUrl,
    grading: learnMoreGradingUrl,
    outline: learnMoreOutlineUrl,
  } = useHelpUrls(['visibility', 'grading', 'outline']);

  const sidebarMessages = getFormattedSidebarMessages(
    {
      learnMoreGradingUrl,
      learnMoreOutlineUrl,
      learnMoreVisibilityUrl,
    },
    intl,
  );

  return (
    <HelpSidebar
      intl={intl}
      courseId={courseId}
      showOtherSettings={false}
      className="outline-sidebar mt-4"
      data-testid="outline-sidebar"
    >
      {sidebarMessages.map(({ title, descriptions, link }, index) => {
        const isLastSection = index === sidebarMessages.length - 1;

        return (
          <div className="outline-sidebar-section" key={title}>
            <h4 className="help-sidebar-about-title">{title}</h4>
            {descriptions.map((description) => (
              <p className="help-sidebar-about-descriptions" key={description}>{description}</p>
            ))}
            {Boolean(link) && Boolean(link.href) && (
              <Hyperlink
                className="small"
                destination={link.href}
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

OutlineSideBar.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default OutlineSideBar;
