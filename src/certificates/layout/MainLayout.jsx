import PropTypes from 'prop-types';
import { Container, Layout } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import ProcessingNotification from '../../generic/processing-notification';
import InternetConnectionAlert from '../../generic/internet-connection-alert';
import SubHeader from '../../generic/sub-header/SubHeader';
import messages from '../messages';
import CertificatesSidebar from './certificates-sidebar/CertificatesSidebar';
import HeaderButtons from './header-buttons/HeaderButtons';
import useLayout from './hooks/useLayout';

const MainLayout = ({ courseId, showHeaderButtons, children }) => {
  const intl = useIntl();

  const {
    isQueryPending,
    isQueryFailed,
    isShowProcessingNotification,
    processingNotificationTitle,
  } = useLayout();

  return (
    <>
      <Container size="xl" className="certificates px-4">
        <div className="mt-5" />
        <SubHeader
          hideBorder
          title={intl.formatMessage(messages.headingTitle)}
          subtitle={intl.formatMessage(messages.headingSubtitle)}
          headerActions={showHeaderButtons && <HeaderButtons />}
        />
        <section>
          <Layout
            lg={[{ span: 9 }, { span: 3 }]}
            md={[{ span: 9 }, { span: 3 }]}
            sm={[{ span: 9 }, { span: 3 }]}
            xs={[{ span: 9 }, { span: 3 }]}
            xl={[{ span: 9 }, { span: 3 }]}
          >
            <Layout.Element>
              <article role="main">
                {children}
              </article>
            </Layout.Element>
            <Layout.Element>
              <CertificatesSidebar courseId={courseId} />
            </Layout.Element>
          </Layout>
        </section>
      </Container>
      <div className="certificates alert-toast">
        <ProcessingNotification
          isShow={isShowProcessingNotification}
          title={processingNotificationTitle}
        />
        <InternetConnectionAlert
          isFailed={isQueryFailed}
          isQueryPending={isQueryPending}
        />
      </div>
    </>
  );
};

MainLayout.defaultProps = {
  showHeaderButtons: false,
  children: null,
};

MainLayout.propTypes = {
  courseId: PropTypes.string.isRequired,
  showHeaderButtons: PropTypes.bool,
  children: PropTypes.node,
};

export default MainLayout;
