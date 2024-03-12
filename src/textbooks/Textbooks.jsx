import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Breadcrumb,
  Button,
  Container,
  Layout,
  Row,
} from '@openedx/paragon';
import { Add as AddIcon } from '@openedx/paragon/icons';
import { useSelector } from 'react-redux';

import { getProcessingNotification } from '../generic/processing-notification/data/selectors';
import { useModel } from '../generic/model-store';
import { LoadingSpinner } from '../generic/Loading';
import SubHeader from '../generic/sub-header/SubHeader';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import ProcessingNotification from '../generic/processing-notification';
import getPageHeadTitle from '../generic/utils';
import EmptyPlaceholder from './empty-placeholder/EmptyPlaceholder';
import TextbookCard from './textbook-card/TextbooksCard';
import TextbookSidebar from './textbook-sidebar/TextbookSidebar';
import TextbookForm from './textbook-form/TextbookForm';
import { useTextbooks } from './hooks';
import { getTextbookFormInitialValues } from './utils';
import messages from './messages';

const Textbooks = ({ courseId }) => {
  const intl = useIntl();

  const courseDetails = useModel('courseDetails', courseId);
  document.title = getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.headingTitle));

  const {
    textbooks,
    isLoading,
    breadcrumbs,
    isTextbookFormOpen,
    openTextbookForm,
    closeTextbookForm,
    isInternetConnectionAlertFailed,
    isQueryPending,
    handleTextbookFormSubmit,
    handleSavingStatusDispatch,
    handleTextbookEditFormSubmit,
    handleTextbookDeleteSubmit,
  } = useTextbooks(courseId);

  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  if (isLoading) {
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }

  return (
    <>
      <Container size="xl" className="px-4">
        <section className="mb-4 mt-5">
          <SubHeader
            title={intl.formatMessage(messages.headingTitle)}
            breadcrumbs={(
              <Breadcrumb ariaLabel={intl.formatMessage(messages.breadcrumbAriaLabel)} links={breadcrumbs} />
            )}
            headerActions={(
              <Button
                iconBefore={AddIcon}
                onClick={openTextbookForm}
                disabled={isTextbookFormOpen}
              >
                {intl.formatMessage(messages.newTextbookButton)}
              </Button>
            )}
          />
          <Layout
            lg={[{ span: 9 }, { span: 3 }]}
            md={[{ span: 9 }, { span: 3 }]}
            sm={[{ span: 12 }, { span: 12 }]}
            xs={[{ span: 12 }, { span: 12 }]}
            xl={[{ span: 9 }, { span: 3 }]}
          >
            <Layout.Element>
              <article>
                <section className="textbook-section">
                  <div className="pt-4">
                    {textbooks.length ? textbooks.map((textbook, index) => (
                      <TextbookCard
                        key={textbook.id}
                        textbook={textbook}
                        courseId={courseId}
                        handleSavingStatusDispatch={handleSavingStatusDispatch}
                        onEditSubmit={handleTextbookEditFormSubmit}
                        onDeleteSubmit={handleTextbookDeleteSubmit}
                        textbookIndex={index}
                      />
                    )) : (
                      !isTextbookFormOpen && <EmptyPlaceholder onCreateNewTextbook={openTextbookForm} />
                    )}
                    {isTextbookFormOpen && (
                      <TextbookForm
                        closeTextbookForm={closeTextbookForm}
                        initialFormValues={getTextbookFormInitialValues()}
                        onSubmit={handleTextbookFormSubmit}
                        onSavingStatus={handleSavingStatusDispatch}
                        courseId={courseId}
                      />
                    )}
                  </div>
                </section>
              </article>
            </Layout.Element>
            <Layout.Element>
              <TextbookSidebar courseId={courseId} />
            </Layout.Element>
          </Layout>
        </section>
      </Container>
      <ProcessingNotification
        isShow={isShowProcessingNotification}
        title={processingNotificationTitle}
      />
      <div className="alert-toast">
        <InternetConnectionAlert
          isFailed={isInternetConnectionAlertFailed}
          isQueryPending={isQueryPending}
        />
      </div>
    </>
  );
};

Textbooks.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default Textbooks;
