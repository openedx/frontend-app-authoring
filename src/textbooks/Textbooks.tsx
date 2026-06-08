import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Breadcrumb,
  Button,
  Container,
  Layout,
  Row,
} from '@openedx/paragon';
import { Add as AddIcon } from '@openedx/paragon/icons';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { SavingErrorAlert } from '@src/generic/saving-error-alert';
import { LoadingSpinner } from '@src/generic/Loading';
import SubHeader from '@src/generic/sub-header/SubHeader';

import ConnectionErrorAlert from '../generic/ConnectionErrorAlert';
import EmptyPlaceholder from './empty-placeholder/EmptyPlaceholder';
import TextbookCard from './textbook-card/TextbooksCard';
import TextbookSidebar from './textbook-sidebar/TextbookSidebar';
import TextbookForm from './textbook-form/TextbookForm';
import { useTextbooksFeatures } from './hooks';
import { getTextbookFormInitialValues } from './utils';
import messages from './messages';

const Textbooks = () => {
  const intl = useIntl();
  const { courseDetails } = useCourseAuthoringContext();

  const {
    textbooks,
    isLoading,
    isLoadingFailed,
    breadcrumbs,
    mutationErrorMessage,
    anyMutationFailed,
    isTextbookFormOpen,
    openTextbookForm,
    closeTextbookForm,
    handleTextbookFormSubmit,
    handleTextbookEditFormSubmit,
    handleTextbookDeleteSubmit,
  } = useTextbooksFeatures();

  if (isLoadingFailed) {
    return (
      <Container size="xl" className="course-unit px-4 mt-4">
        <ConnectionErrorAlert />
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {`${courseDetails?.name} | ${intl.formatMessage(messages.headingTitle)}`}
        </title>
      </Helmet>
      <Container size="xl" className="px-4">
        <section className="mb-4 mt-5">
          <SubHeader
            title={intl.formatMessage(messages.headingTitle)}
            breadcrumbs={
              <Breadcrumb
                linkAs={Link}
                ariaLabel={intl.formatMessage(messages.breadcrumbAriaLabel)}
                links={breadcrumbs}
              />
            }
            headerActions={
              <Button
                iconBefore={AddIcon}
                onClick={openTextbookForm}
                disabled={isTextbookFormOpen}
              >
                {intl.formatMessage(messages.newTextbookButton)}
              </Button>
            }
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
                    {textbooks.length ?
                      textbooks.map((textbook, index) => (
                        <TextbookCard
                          key={textbook.id}
                          textbook={textbook}
                          onEditSubmit={handleTextbookEditFormSubmit}
                          onDeleteSubmit={handleTextbookDeleteSubmit}
                          textbookIndex={index}
                        />
                      )) :
                      (
                        !isTextbookFormOpen && <EmptyPlaceholder onCreateNewTextbook={openTextbookForm} />
                      )}
                    {isTextbookFormOpen && (
                      <TextbookForm
                        closeTextbookForm={closeTextbookForm}
                        initialFormValues={getTextbookFormInitialValues()}
                        onSubmit={handleTextbookFormSubmit}
                      />
                    )}
                  </div>
                </section>
              </article>
            </Layout.Element>
            <Layout.Element>
              <TextbookSidebar />
            </Layout.Element>
          </Layout>
        </section>
      </Container>
      <div className="alert-toast">
        <SavingErrorAlert
          isQueryFailed={anyMutationFailed}
          errorMessage={mutationErrorMessage}
        />
      </div>
    </>
  );
};

export default Textbooks;
