import PropTypes from 'prop-types';
import { Stack } from '@openedx/paragon';

const CertificateSection = ({
  title, actions, children, ...rest
}) => (
  <section {...rest}>
    <Stack className="justify-content-between mb-2.5" direction="horizontal">
      <h2 className="lead section-title mb-0">{title}</h2>
      {actions && actions}
    </Stack>
    <hr className="mt-0 mb-4" />
    <div>
      {children}
    </div>
  </section>
);

CertificateSection.defaultProps = {
  children: null,
  actions: null,
};
CertificateSection.propTypes = {
  children: PropTypes.node,
  actions: PropTypes.node,
  title: PropTypes.string.isRequired,
};

export default CertificateSection;
