import React from 'react';
import PropTypes from 'prop-types';
import { Hyperlink } from '@edx/paragon';

const HelpSidebarLink = ({ as, pathToPage, title }) => {
  const TagElement = as;
  return (
    <TagElement className="sidebar-link">
      <Hyperlink
        destination={pathToPage}
        target="_blank"
        showLaunchIcon={false}
      >
        {title}
      </Hyperlink>
    </TagElement>
  );
};

HelpSidebarLink.propTypes = {
  pathToPage: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  as: PropTypes.string,
};

HelpSidebarLink.defaultProps = {
  as: 'li',
};

export default HelpSidebarLink;
