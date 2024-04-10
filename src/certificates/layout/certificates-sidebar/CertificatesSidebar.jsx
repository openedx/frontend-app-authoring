import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Hyperlink } from '@openedx/paragon';

import { HelpSidebar } from '../../../generic/help-sidebar';
import { useHelpUrls } from '../../../help-urls/hooks';
import { getSidebarData } from './utils';
import SidebarBlock from './sidebar-block/SidebarBlock';
import messages from './messages';

const CertificatesSidebar = ({ courseId }) => {
  const intl = useIntl();
  const { certificates: learnMoreCertificates } = useHelpUrls(['certificates']);
  return (
    <HelpSidebar
      courseId={courseId}
      showOtherSettings
    >
      {getSidebarData({ messages, intl }).map(({ title, paragraphs }, id) => (
        <SidebarBlock
          key={title}
          title={title}
          paragraphs={paragraphs}
          isLast={id === getSidebarData({ messages, intl }).length - 1}
        />
      ))}
      <Button
        as={Hyperlink}
        target="_blank"
        showLaunchIcon={false}
        size="sm"
        href={learnMoreCertificates}
        variant="outline-primary"
      >
        {intl.formatMessage(messages.learnMoreBtn)}
      </Button>
    </HelpSidebar>
  );
};

CertificatesSidebar.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CertificatesSidebar;
