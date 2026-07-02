import { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  Link,
} from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { PageWrap } from '@edx/frontend-platform/react';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Breadcrumb,
  Button,
  Layout,
  Hyperlink,
  StatefulButton,
  Icon,
  useToggle,
  Image,
  ModalDialog,
  Container,
} from '@openedx/paragon';
import { Add, SpinnerSimple } from '@openedx/paragon/icons';
import Placeholder from '@src/editors/Placeholder';
import DraggableList, { SortableItem } from '@src/generic/DraggableList';
import ErrorAlert from '@src/editors/sharedComponents/ErrorAlerts/ErrorAlert';
import { RequestStatus } from '@src/data/constants';
import getPageHeadTitle from '@src/generic/utils';
import { getPagePath } from '@src/utils';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import {
  useCustomPages,
  useAddCustomPage,
  useReorderCustomPages,
  useUpdateCustomPageName,
  type CustomPage,
} from './data/apiHooks';
import previewLmsStaticPages from './data/images/previewLmsStaticPages.png';
import CustomPageCard from './CustomPageCard';
import messages from './messages';
import CustomPagesProvider from './CustomPagesProvider';
import EditModal from './EditModal';

const CustomPages = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [orderedPages, setOrderedPages] = useState<CustomPage[]>([]);
  const [currentPage, setCurrentPage] = useState<string | undefined>();
  const [isOpen, open, close] = useToggle(false);
  const { courseId, courseDetails } = useCourseAuthoringContext();

  document.title = getPageHeadTitle(courseDetails?.name || '', intl.formatMessage(messages.heading));

  const config = getConfig();
  const learningCourseURL = `${config.LEARNING_BASE_URL}/course/${courseId}`;

  const { data: pages, isLoading, error, isError } = useCustomPages(courseId);
  const addPageMutation = useAddCustomPage(courseId);
  const reorderMutation = useReorderCustomPages(courseId);
  const updateNameMutation = useUpdateCustomPageName(courseId);

  const isDenied = isError && (error as any)?.response?.status === 403;
  const isLoadError = isError && !isDenied;

  useEffect(() => {
    if (pages) {
      setOrderedPages(pages);
    }
  }, [pages]);

  const handleAddPage = () => {
    addPageMutation.mutate();
  };

  const handleReorder = () => (newPageOrder: CustomPage[]) => {
    reorderMutation.mutate(newPageOrder);
  };

  const handleEditClose = () => (content: any) => {
    navigate(`/course/${courseId}/custom-pages`);
    if (!content?.metadata) {
      setCurrentPage(undefined);
      return;
    }
    updateNameMutation.mutate(
      { blockId: currentPage!, displayName: content.metadata.display_name },
    );
    setCurrentPage(undefined);
  };

  const addPageStateProps = {
    labels: {
      default: intl.formatMessage(messages.addPageBodyLabel),
      pending: intl.formatMessage(messages.addingPageBodyLabel),
    },
    icons: {
      default: <Icon src={Add} />,
      pending: <Icon src={SpinnerSimple} className="icon-spin" />,
    },
    disabledStates: ['pending'],
  };

  if (isLoading) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }
  if (isDenied && !pages) {
    return (
      <div data-testid="under-construction-placeholder" className="row justify-content-center m-6">
        <Placeholder />
      </div>
    );
  }
  return (
    <CustomPagesProvider courseId={courseId}>
      <Container size="xl" className="p-4 pt-5">
        <div className="small gray-700">
          <Breadcrumb
            ariaLabel="Custom Page breadcrumbs"
            linkAs={Link}
            links={[
              {
                label: 'Content',
                to: `/course/${courseId}`,
              },
              { label: 'Pages and Resources', to: getPagePath(courseId, 'true', 'tabs') },
            ]}
          />
        </div>
        <ActionRow>
          <div className="h2">
            <FormattedMessage {...messages.heading} />
          </div>
          <ActionRow.Spacer />
          <Button
            iconBefore={Add}
            onClick={handleAddPage}
            data-testid="header-add-button"
          >
            <FormattedMessage {...messages.addPageHeaderLabel} />
          </Button>
          <Hyperlink
            destination={learningCourseURL}
            target="_blank"
            rel="noopener noreferrer"
            showLaunchIcon={false}
            data-testid="header-view-live-button"
          >
            <Button>
              <FormattedMessage {...messages.viewLiveLabel} />
            </Button>
          </Hyperlink>
        </ActionRow>
        <hr />
        <Layout
          lg={[{ span: 9, offset: 0 }, { span: 3, offset: 0 }]}
          md={[{ span: 9, offset: 0 }, { span: 3, offset: 0 }]}
          sm={[{ span: 9, offset: 0 }, { span: 3, offset: 0 }]}
          xs={[{ span: 9, offset: 0 }, { span: 3, offset: 0 }]}
          xl={[{ span: 9, offset: 0 }, { span: 3, offset: 0 }]}
        >
          <Layout.Element>
            <ErrorAlert hideHeading isError={isLoadError}>
              {intl.formatMessage(messages.errorAlertMessage, { actionName: 'load' })}
            </ErrorAlert>
            <ErrorAlert hideHeading isError={addPageMutation.isError}>
              {intl.formatMessage(messages.errorAlertMessage, { actionName: 'add' })}
            </ErrorAlert>
            <ErrorAlert hideHeading isError={reorderMutation.isError}>
              {intl.formatMessage(messages.errorAlertMessage, { actionName: 'save' })}
            </ErrorAlert>
            <div className="small gray-700 mb-4">
              <FormattedMessage {...messages.note} />
            </div>
            <DraggableList itemList={orderedPages} setState={setOrderedPages} updateOrder={handleReorder}>
              {orderedPages.map((page) => (
                <SortableItem
                  id={page.id}
                  key={page.id}
                  componentStyle={{
                    background: 'white',
                    borderRadius: '6px',
                    padding: '24px',
                    marginBottom: '16px',
                    boxShadow: '0px 1px 5px #ADADAD',
                  }}
                  actions={
                    <CustomPageCard
                      page={page}
                      courseId={courseId}
                      setCurrentPage={setCurrentPage}
                    />
                  }
                />
              ))}
            </DraggableList>
            <StatefulButton
              data-testid="body-add-button"
              onClick={handleAddPage}
              state={addPageMutation.isPending ? RequestStatus.PENDING : 'default'}
              {...addPageStateProps}
            />
          </Layout.Element>
          <Layout.Element>
            <div className="h4">
              <FormattedMessage {...messages.pageExplanationHeader} />
            </div>
            <div className="small gray-700">
              <FormattedMessage {...messages.pageExplanationBody} />
            </div>
            <hr />
            <div className="h4">
              <FormattedMessage {...messages.customPagesExplanationHeader} />
            </div>
            <div className="small gray-700">
              <FormattedMessage {...messages.customPagesExplanationBody} />
            </div>
            <hr />
            <div className="h4">
              <FormattedMessage {...messages.studentViewExplanationHeader} />
            </div>
            <div className="small gray-700">
              <FormattedMessage {...messages.studentViewExplanationBody} />
            </div>
            <Button
              data-testid="student-view-example-button"
              variant="link"
              size="sm"
              onClick={open}
              className="pl-0"
            >
              <FormattedMessage {...messages.studentViewExampleButton} />
            </Button>
          </Layout.Element>
        </Layout>
        <ModalDialog
          isOpen={isOpen}
          onClose={close}
          size="lg"
          title={intl.formatMessage(messages.studentViewModalTitle)}
          isOverflowVisible={false}
        >
          <ModalDialog.Header>
            <ModalDialog.Title>
              <FormattedMessage {...messages.studentViewModalTitle} />
            </ModalDialog.Title>
          </ModalDialog.Header>
          <ModalDialog.Body>
            <Image src={previewLmsStaticPages} fluid className="mb-3" />
            <div className="small">
              <FormattedMessage {...messages.studentViewModalBody} />
            </div>
          </ModalDialog.Body>
        </ModalDialog>
        <Routes>
          <Route
            path="/editor"
            element={currentPage && (
              <PageWrap>
                <EditModal
                  courseId={courseId}
                  pageId={currentPage}
                  onClose={handleEditClose}
                />
              </PageWrap>
            )}
          />
        </Routes>
      </Container>
    </CustomPagesProvider>
  );
};

export default CustomPages;
