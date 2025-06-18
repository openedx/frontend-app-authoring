import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Container,
  Layout,
} from '@openedx/paragon';
import { Add as AddIcon } from '@openedx/paragon/icons';

import SubHeader from '../generic/sub-header/SubHeader';
import EmptyPlaceholder from './empty-placeholder/EmptyPlaceholder';
import TextbookCard from './textbook-card/TextbooksCard';
import TextbookSidebar from './textbook-sidebar/TextbookSidebar';
import TextbookForm from './textbook-form/TextbookForm';
import { getTextbookFormInitialValues } from './utils';
import messages from './messages';

const TextbooksNew = ({ courseId,
  textbooks,
  isLoading,
  isTextbookFormOpen,
  openTextbookForm,
  closeTextbookForm,
  handleTextbookFormSubmit,
  handleSavingStatusDispatch,
  handleTextbookEditFormSubmit,
  handleTextbookDeleteSubmit,
}) => {
  const intl = useIntl();

  return (
    <Container size="xl" className="px-4 textbook-card">
      <section className="setting-items mb-4">

        <Layout
          lg={[{ span: 9 }, { span: 3 }]}
          md={[{ span: 9 }, { span: 3 }]}
          sm={[{ span: 12 }, { span: 12 }]}
          xs={[{ span: 12 }, { span: 12 }]}
          xl={[{ span: 9 }, { span: 3 }]}
        >
          <Layout.Element>
            <article>
              <SubHeader
                title={intl.formatMessage(messages.headingTitle)}
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
              <span className="pages_bar" />
              <section className="textbook-section">
                <div>
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
  );
};

TextbooksNew.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default TextbooksNew;
