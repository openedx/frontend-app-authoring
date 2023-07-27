import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Container, Layout } from '@edx/paragon';

import SubHeader from '../generic/sub-header/SubHeader';
import HeaderActions from './header-actions/HeaderActions';
import messages from './messages';
import { useCourseOutline } from './hooks';
import OutlineSideBar from './outline-sidebar/OutlineSidebar';

const CourseOutline = ({ courseId }) => {
  const intl = useIntl();

  const {
    handleReindex,
    handleViewLive,
    handleExpandAll,
    handleNewSection,
  } = useCourseOutline();

  return (
    <Container size="xl" className="m-4">
      <section className="course-outline-container mb-4">
        <SubHeader
          className="mt-5"
          title={intl.formatMessage(messages.headingTitle)}
          subtitle={intl.formatMessage(messages.headingSubtitle)}
          withSubHeaderContent={false}
          headerActions={(
            <HeaderActions
              onNewSections={handleNewSection}
              onReindex={handleReindex}
              onExpandAll={handleExpandAll}
              onViewLive={handleViewLive}
            />
          )}
        />
        <Layout
          lg={[{ span: 9 }, { span: 3 }]}
          md={[{ span: 9 }, { span: 3 }]}
          sm={[{ span: 9 }, { span: 3 }]}
          xs={[{ span: 9 }, { span: 3 }]}
          xl={[{ span: 9 }, { span: 3 }]}
        >
          <Layout.Element>
            <article>
              <div>
                <section className="course-outline-section">
                  <h3>Section</h3>
                </section>
              </div>
            </article>
          </Layout.Element>
          <Layout.Element>
            <OutlineSideBar courseId={courseId} />
          </Layout.Element>
        </Layout>
      </section>
    </Container>
  );
};

CourseOutline.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseOutline;
