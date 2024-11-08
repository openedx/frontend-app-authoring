import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Hyperlink } from '@openedx/paragon';

const HelpSidebarLink = ({
  as, pathToPage, title, isNewPage,
}) => {
  const TagElement = as;
  if (isNewPage) {
    return (
      <TagElement className="sidebar-link">
        <Link to={pathToPage}>
          {title}
        </Link>
      </TagElement>
    );
  }

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
  isNewPage: PropTypes.bool,
  pathToPage: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  as: PropTypes.string,
};

HelpSidebarLink.defaultProps = {
  as: 'li',
  isNewPage: true,
};

export default HelpSidebarLink;
