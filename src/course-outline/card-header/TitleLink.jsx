import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from '@edx/paragon';

const TitleLink = ({
  titleLink,
  namePrefix,
  children,
}) => (
  <Button
    as={Link}
    variant="tertiary"
    data-testid={`${namePrefix}-card-header__title-link`}
    className="item-card-header__title-btn"
    to={titleLink}
  >
    {children}
  </Button>
);

TitleLink.defaultProps = {
  children: null,
};

TitleLink.propTypes = {
  titleLink: PropTypes.string.isRequired,
  namePrefix: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default TitleLink;
