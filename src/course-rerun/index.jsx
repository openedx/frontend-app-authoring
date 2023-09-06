import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Container,
  Layout,
  Stack,
  ActionRow,
  Button,
} from '@edx/paragon';
import { history } from '@edx/frontend-platform';

import Header from '../studio-header/Header';
import Loading from '../generic/Loading';
import { getLoadingStatuses } from '../generic/data/selectors';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import { RequestStatus } from '../data/constants';
import CourseRerunForm from './course-rerun-form';
import CourseRerunSideBar from './course-rerun-sidebar';
import messages from './messages';
import { useCourseRerun } from './hooks';

const CourseRerun = ({ courseId }) => {
  const {
    intl,
    displayName,
    savingStatus,
    initialFormValues,
    originalCourseData,
  } = useCourseRerun(courseId);
  const { organizationLoadingStatus } = useSelector(getLoadingStatuses);

  if (organizationLoadingStatus === RequestStatus.IN_PROGRESS) {
    return <Loading />;
  }

  const handleRerunCourseCancel = () => {
    history.push('/home');
  };

  return (
    <>
      <Header hideMainMenu />
      <Container size="xl" className="m-4">
        <section className="mb-4">
          <article>
            <section>
              <header className="d-flex">
                <h3 className="align-self-center font-weight-normal mb-0">{intl.formatMessage(messages.rerunTitle)}</h3>
                <ActionRow className="ml-auto">
                  <Button variant="outline-primary" onClick={handleRerunCourseCancel}>
                    {intl.formatMessage(messages.cancelButton)}
                  </Button>
                </ActionRow>
              </header>
              <hr />
              <Stack>
                <h3>{originalCourseData}</h3>
                <h2>{displayName}</h2>
              </Stack>
              <hr />
            </section>
          </article>
          <Layout
            lg={[{ span: 9 }, { span: 3 }]}
            md={[{ span: 9 }, { span: 3 }]}
            sm={[{ span: 9 }, { span: 3 }]}
            xs={[{ span: 9 }, { span: 3 }]}
            xl={[{ span: 9 }, { span: 3 }]}
          >
            <Layout.Element>
              <CourseRerunForm
                initialFormValues={initialFormValues}
                onClickCancel={handleRerunCourseCancel}
              />
            </Layout.Element>
            <Layout.Element>
              <CourseRerunSideBar />
            </Layout.Element>
          </Layout>
        </section>
      </Container>
      <div className="alert-toast">
        <InternetConnectionAlert
          isFailed={savingStatus === RequestStatus.FAILED}
          isQueryPending={savingStatus === RequestStatus.PENDING}
        />
      </div>
    </>
  );
};

CourseRerun.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseRerun;
