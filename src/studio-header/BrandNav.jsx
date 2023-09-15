import PropTypes from 'prop-types';

const BrandNav = ({
  studioBaseUrl,
  logo,
  logoAltText,
}) => (
  <a href={studioBaseUrl}>
    <img
      src={logo}
      alt={logoAltText}
      className="d-block logo"
    />
  </a>
);

BrandNav.propTypes = {
  studioBaseUrl: PropTypes.string.isRequired,
  logo: PropTypes.string.isRequired,
  logoAltText: PropTypes.string.isRequired,
};

export default BrandNav;
