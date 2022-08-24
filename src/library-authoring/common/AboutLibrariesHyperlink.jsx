import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';

import commonMessages from './messages';

const AboutLibrariesHyperlink = ({ intl }) => (
  <Hyperlink
    className="container-fluid"
    destination="https://edx.readthedocs.io/projects/edx-partner-course-staff/en/latest/course_components/libraries.html"
    target="_blank"
  >
    {intl.formatMessage(commonMessages['library.common.footer.hyperlink.about'])}
  </Hyperlink>
);

AboutLibrariesHyperlink.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(AboutLibrariesHyperlink);
