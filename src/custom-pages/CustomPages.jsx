import React, { useEffect, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Switch, useRouteMatch } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { history } from '@edx/frontend-platform';
import { AppContext, PageRoute } from '@edx/frontend-platform/react';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
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
} from '@edx/paragon';
import { Add, SpinnerSimple } from '@edx/paragon/icons';
import Placeholder, {
  DraggableList,
  SortableItem,
  ErrorAlert,
} from '@edx/frontend-lib-content-components';

import { RequestStatus } from '../data/constants';
import { useModels } from '../generic/model-store';
import { getLoadingStatus, getSavingStatus } from './data/selectors';
import {
  addSingleCustomPage,
  fetchCustomPages,
  updatePageOrder,
  updateSingleCustomPage,
} from './data/thunks';

import previewLmsStaticPages from './data/images/previewLmsStaticPages.png';
import CustomPageCard from './CustomPageCard';
import messages from './messages';
import CustomPagesProvider from './CustomPagesProvider';
import EditModal from './EditModal';

const CustomPages = ({
  courseId,
  // injected
  intl,
}) => {
  const dispatch = useDispatch();
  const [orderedPages, setOrderedPages] = useState([]);
  const [currentPage, setCurrentPage] = useState();
  const [isOpen, open, close] = useToggle(false);
  const [isEditModalOpen, openEditModal, closeEditModal] = useToggle(false);

  const { config } = useContext(AppContext);
  const { path, url } = useRouteMatch();
  const learningCourseURL = `${config.LEARNING_BASE_URL}/course/${courseId}`;

  useEffect(() => {
    dispatch(fetchCustomPages(courseId));
  }, [courseId]);

  const customPagesIds = useSelector(state => state.customPages.customPagesIds);
  const addPageStatus = useSelector(state => state.customPages.addingStatus);
  const deletePageStatus = useSelector(state => state.customPages.deletingStatus);
  const savingStatus = useSelector(getSavingStatus);
  const loadingStatus = useSelector(getLoadingStatus);

  const pages = useModels('customPages', customPagesIds);

  const handleAddPage = () => { dispatch(addSingleCustomPage(courseId)); };
  const handleReorder = () => (newPageOrder) => {
    dispatch(updatePageOrder(courseId, newPageOrder));
  };
  const handleEditClose = () => (content) => {
    history.push(url);
    if (!content?.metadata) {
      closeEditModal();
      return;
    }
    dispatch(updateSingleCustomPage({
      blockId: currentPage,
      metadata: { displayName: content.metadata.display_name },
      onClose: closeEditModal,
      setCurrentPage,
    }));
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
  useEffect(() => { setOrderedPages(pages); }, [customPagesIds, savingStatus]);
  if (loadingStatus === RequestStatus.IN_PROGRESS) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return (<></>);
  }
  if (loadingStatus === RequestStatus.DENIED) {
    return (
      <div data-testid="under-construction-placeholder" className="row justify-contnt-center m-6">
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
            links={[
              { label: 'Content', href: `${config.STUDIO_BASE_URL}/course/${courseId}` },
              { label: 'Pages and Resources', href: `/course/${courseId}/pages-and-resources` },
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
            <ErrorAlert hideHeading isError={deletePageStatus === RequestStatus.FAILED}>
              {intl.formatMessage(messages.errorAlertMessage, { actionName: 'delete' })}
            </ErrorAlert>
            <ErrorAlert hideHeading isError={addPageStatus === RequestStatus.FAILED}>
              {intl.formatMessage(messages.errorAlertMessage, { actionName: 'add' })}
            </ErrorAlert>
            <ErrorAlert hideHeading isError={savingStatus === RequestStatus.FAILED}>
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
                >
                  <CustomPageCard
                    {...{
                      page,
                      dispatch,
                      deletePageStatus,
                      courseId,
                      setCurrentPage,
                      openEditModal,
                    }}
                  />
                </SortableItem>
              ))}
            </DraggableList>
            <StatefulButton
              data-testid="body-add-button"
              onClick={handleAddPage}
              state={addPageStatus}
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
        <Switch>
          <PageRoute path={`${path}/editor`}>
            {currentPage && (
              <EditModal courseId={courseId} isOpen={isEditModalOpen} pageId={currentPage} onClose={handleEditClose} />
            )}
          </PageRoute>
        </Switch>
      </Container>
    </CustomPagesProvider>
  );
};

CustomPages.propTypes = {
  courseId: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(CustomPages);
