import React from 'react';
import PropTypes from 'prop-types';
import { Hyperlink } from '@edx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';

import HelpSidebar from '../../generic/help-sidebar';
import { getOutlineDocsLinks } from '../data/selectors';
import { getFormattedSidebarMessages } from './utils';

const OutlineSideBar = ({ courseId }) => {
  const intl = useIntl();
  const docksLinks = useSelector(getOutlineDocsLinks);
  const sidebarMessages = getFormattedSidebarMessages(docksLinks, intl);

  return (
    <HelpSidebar
      intl={intl}
      courseId={courseId}
      showOtherSettings={false}
      className="outline-sidebar mt-4"
      data-testid="outline-sidebar"
    >
      {sidebarMessages.map(({ title, descriptions, link }, index) => (
        <div className="outline-sidebar-section" key={title}>
          <h4 className="help-sidebar-about-title">{title}</h4>
          {descriptions.map((description) => (
            <p className="help-sidebar-about-descriptions" key={description}>{description}</p>
          ))}
          {Boolean(link) && (
            <Hyperlink
              className="help-sidebar-about-link"
              destination={link.href}
              target="_blank"
              showLaunchIcon={false}
            >
              {link.text}
            </Hyperlink>
          )}
          {index !== sidebarMessages.length - 1 && (
            <hr className="my-3.5" />
          )}
        </div>
      ))}
    </HelpSidebar>
  );
};

OutlineSideBar.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default OutlineSideBar;
