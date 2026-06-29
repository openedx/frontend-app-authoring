import { ReactElement } from 'react';
import { Container, Layout } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { SavingErrorAlert } from '@src/generic/saving-error-alert';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import SubHeader from '@src/generic/sub-header/SubHeader';
import messages from '../messages';
import CertificatesSidebar from './certificates-sidebar/CertificatesSidebar';
import HeaderButtons from './header-buttons/HeaderButtons';
import useLayout from './hooks/useLayout';

interface MainLayoutProps {
  showHeaderButtons: boolean;
  children?: ReactElement;
}

const MainLayout = ({ showHeaderButtons = false, children }: MainLayoutProps) => {
  const { courseId } = useCourseAuthoringContext();

  const intl = useIntl();

  const {
    savingErrorMessage,
  } = useLayout();

  return (
    <>
      <Container size="xl" className="certificates px-4">
        <div className="mt-5" />
        <SubHeader
          hideBorder
          title={intl.formatMessage(messages.headingTitle)}
          subtitle={intl.formatMessage(messages.headingSubtitle)}
          headerActions={showHeaderButtons ?
            <HeaderButtons /> :
            null}
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
              <CertificatesSidebar />
            </Layout.Element>
          </Layout>
        </section>
      </Container>
      <div className="certificates alert-toast">
        <SavingErrorAlert
          isQueryFailed={savingErrorMessage !== undefined}
          errorMessage={savingErrorMessage}
        />
      </div>
    </>
  );
};

export default MainLayout;
