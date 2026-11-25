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
import { useCourseUserPermissions } from '@src/authz/hooks';
import { getPagesAndResourcesPermissions } from '@src/authz/permissionHelpers';

import ConnectionErrorAlert from '@src/generic/ConnectionErrorAlert';
import ViewOnlyPermissionsAlert from '@src/generic/ViewOnlyPermissionsAlert';
import EmptyPlaceholder from './empty-placeholder/EmptyPlaceholder';
import TextbookCard from './textbook-card/TextbooksCard';
import TextbookSidebar from './textbook-sidebar/TextbookSidebar';
import TextbookForm from './textbook-form/TextbookForm';
import { useTextbooksFeatures } from './hooks';
import { getTextbookFormInitialValues } from './utils';
import messages from './messages';

const Textbooks = () => {
  const intl = useIntl();
  const { courseId, courseDetails } = useCourseAuthoringContext();
  const {
    isLoading: isLoadingUserPermissions,
    canManagePagesAndResources,
  } = useCourseUserPermissions(courseId, getPagesAndResourcesPermissions(courseId));
  const isEditable = !isLoadingUserPermissions && canManagePagesAndResources;

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

  if (isLoading || isLoadingUserPermissions) {
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
            headerActions={isEditable ?
              (
                <Button
                  iconBefore={AddIcon}
                  onClick={openTextbookForm}
                  disabled={isTextbookFormOpen}
                >
                  {intl.formatMessage(messages.newTextbookButton)}
                </Button>
              ) :
              null}
            banner={isEditable ? null : <ViewOnlyPermissionsAlert className="mb-3" />}
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
                          isEditable={isEditable}
                        />
                      )) :
                      (
                        !isTextbookFormOpen && (
                          <EmptyPlaceholder onCreateNewTextbook={openTextbookForm} isEditable={isEditable} />
                        )
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
