import React from 'react';

import { Link } from 'react-router-dom';
import { Hyperlink } from '@openedx/paragon';

interface HelpSidebarLinkProps {
  as?: React.ElementType;
  isNewPage?: boolean;
  pathToPage: string;
  title: string;
}

const HelpSidebarLink = ({ as = 'li', isNewPage = true, pathToPage, title }: HelpSidebarLinkProps) => {
  const TagElement = as;
  if (isNewPage) {
    return (
      <TagElement className="sidebar-link">
        <Link to={pathToPage}>{title}</Link>
      </TagElement>
    );
  }

  return (
    <TagElement className="sidebar-link">
      <Hyperlink destination={pathToPage} target="_blank" showLaunchIcon={false}>
        {title}
      </Hyperlink>
    </TagElement>
  );
};

export default HelpSidebarLink;
