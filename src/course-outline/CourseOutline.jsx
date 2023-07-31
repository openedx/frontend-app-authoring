import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Container, Layout } from '@edx/paragon';

import SubHeader from '../generic/sub-header/SubHeader';
import HeaderNavigations from './header-navigations/HeaderNavigations';
import messages from './messages';
import { useCourseOutline } from './hooks';
import OutlineSideBar from './outline-sidebar/OutlineSidebar';

const CourseOutline = ({ courseId }) => {
  const intl = useIntl();

  const {
    isReIndexShow,
    isSectionsExpanded,
    headerNavigationsActions,
  } = useCourseOutline({ courseId });

  return (
    <Container size="xl" className="m-4">
      <section className="course-outline-container mb-4 mt-5">
        <SubHeader
          className="mt-5"
          title={intl.formatMessage(messages.headingTitle)}
          subtitle={intl.formatMessage(messages.headingSubtitle)}
          withSubHeaderContent={false}
          headerActions={(
            <HeaderNavigations
              isReIndexShow={isReIndexShow}
              isSectionsExpanded={isSectionsExpanded}
              headerNavigationsActions={headerNavigationsActions}
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
                  {/* TODO add status bar */}
                  <h3>Status bar</h3>
                  {/* TODO add list of outlines */}
                  <h3>Outlines list</h3>
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
