import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Card,
  Collapsible,
  Icon,
  IconButtonWithTooltip,
  useToggle,
} from '@openedx/paragon';
import {
  EditOutline as EditIcon,
  RemoveRedEye as ViewIcon,
  DeleteOutline as DeleteIcon,
} from '@openedx/paragon/icons';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import DeleteModal from '@src/generic/delete-modal/DeleteModal';

import TextbookForm, { TextbookFormOnSubmit } from '../textbook-form/TextbookForm';
import { getTextbookFormInitialValues } from '../utils';
import messages from './messages';
import { Textbook } from '../data/api';

export interface TextbookCardProps {
  textbook: Textbook;
  onEditSubmit: (fromValues: Textbook, onSuccess: () => void) => void;
  onDeleteSubmit: (id: string) => void;
  textbookIndex: number;
}

const TextbookCard = ({
  textbook,
  onEditSubmit,
  onDeleteSubmit,
  textbookIndex,
}: TextbookCardProps) => {
  const intl = useIntl();
  const { courseId } = useCourseAuthoringContext();

  const [isTextbookFormOpen, openTextbookForm, closeTextbookForm] = useToggle(false);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);

  const { tabTitle, chapters, id } = textbook;

  const onPreviewTextbookClick = () => {
    /* istanbul ignore next */
    window.open(`${getConfig().LMS_BASE_URL}/courses/${courseId}/pdfbook/${textbookIndex}/`, '_blank');
  };

  const handleDeleteButtonSubmit = () => {
    closeDeleteModal();
    onDeleteSubmit(id);
  };

  const handleEditSubmit: TextbookFormOnSubmit = (values) => {
    onEditSubmit(values, closeTextbookForm);
  };

  return (
    <>
      {isTextbookFormOpen ?
        (
          <TextbookForm
            closeTextbookForm={closeTextbookForm}
            initialFormValues={getTextbookFormInitialValues(true, { tab_title: tabTitle, chapters, id })}
            onSubmit={handleEditSubmit}
          />
        ) :
        (
          (
            <Card className="textbook-card" data-testid="textbook-card">
              <Card.Header
                title={tabTitle}
                actions={
                  <ActionRow>
                    <IconButtonWithTooltip
                      tooltipContent={intl.formatMessage(messages.buttonView)}
                      src={ViewIcon}
                      iconAs={Icon}
                      data-testid="textbook-view-button"
                      alt={intl.formatMessage(messages.buttonView)}
                      onClick={onPreviewTextbookClick}
                    />
                    <IconButtonWithTooltip
                      tooltipContent={intl.formatMessage(messages.buttonEdit)}
                      src={EditIcon}
                      iconAs={Icon}
                      data-testid="textbook-edit-button"
                      alt={intl.formatMessage(messages.buttonEdit)}
                      onClick={openTextbookForm}
                    />
                    <IconButtonWithTooltip
                      tooltipContent={intl.formatMessage(messages.buttonDelete)}
                      src={DeleteIcon}
                      iconAs={Icon}
                      data-testid="textbook-delete-button"
                      alt={intl.formatMessage(messages.buttonDelete)}
                      onClick={openDeleteModal}
                    />
                  </ActionRow>
                }
              />
              <div className="textbook-card__chapters">
                <Collapsible
                  styling="basic"
                  data-testid="chapters-button"
                  title={intl.formatMessage(messages.chaptersTitle, { count: chapters.length })}
                >
                  {chapters.map(({ title, url }) => (
                    <div className="textbook-card__chapter-item" key={title}>
                      <span className="small">{title}</span>
                      <span className="small text-gray-700">{url}</span>
                    </div>
                  ))}
                </Collapsible>
              </div>
            </Card>
          )
        )}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        close={closeDeleteModal}
        title={intl.formatMessage(messages.deleteModalTitle, { textbookTitle: textbook.tabTitle })}
        description={intl.formatMessage(messages.deleteModalDescription)}
        onDeleteSubmit={handleDeleteButtonSubmit}
      />
    </>
  );
};

export default TextbookCard;
