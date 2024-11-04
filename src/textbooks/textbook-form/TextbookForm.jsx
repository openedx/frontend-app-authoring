import { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { FieldArray, Formik } from 'formik';
import {
  PictureAsPdf as PdfIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  Upload as UploadIcon,
} from '@openedx/paragon/icons';
import {
  ActionRow,
  Button,
  Form,
  Icon,
  IconButtonWithTooltip,
  useToggle,
} from '@openedx/paragon';

import FormikControl from '../../generic/FormikControl';
import PromptIfDirty from '../../generic/prompt-if-dirty/PromptIfDirty';
import ModalDropzone from '../../generic/modal-dropzone/ModalDropzone';
import { useModel } from '../../generic/model-store';
import { UPLOAD_FILE_MAX_SIZE } from '../../constants';
import textbookFormValidationSchema from './validations';
import messages from './messages';

const TextbookForm = ({
  closeTextbookForm,
  initialFormValues,
  onSubmit,
  onSavingStatus,
  courseId,
}) => {
  const intl = useIntl();

  const courseDetail = useModel('courseDetails', courseId);
  const courseTitle = courseDetail ? courseDetail?.name : '';

  const [currentTextbookIndex, setCurrentTextbookIndex] = useState(0);
  const [isUploadModalOpen, openUploadModal, closeUploadModal] = useToggle(false);
  const [selectedFile, setSelectedFile] = useState('');

  const onCloseUploadModal = () => {
    closeUploadModal();
    setSelectedFile('');
  };

  const onUploadButtonClick = (index) => {
    setCurrentTextbookIndex(index);
    openUploadModal();
  };

  return (
    <div className="textbook-form" data-testid="textbook-form">
      <Formik
        initialValues={initialFormValues}
        validationSchema={textbookFormValidationSchema(intl)}
        onSubmit={onSubmit}
        validateOnBlur
        validateOnMount
      >
        {({
          values, handleSubmit, isValid, dirty, setFieldValue,
        }) => (
          <>
            <Form.Group size="sm" className="form-field">
              <Form.Label size="sm" className="font-weight-bold form-main-label text-black">
                {intl.formatMessage(messages.tabTitleLabel)} *
              </Form.Label>
              <FormikControl
                name="tab_title"
                value={values.tab_title}
                placeholder={intl.formatMessage(messages.tabTitlePlaceholder)}
              />
              <Form.Control.Feedback className="form-helper-text">
                {intl.formatMessage(messages.tabTitleHelperText)}
              </Form.Control.Feedback>
            </Form.Group>
            <FieldArray
              name="chapters"
              render={(arrayHelpers) => (
                <>
                  {!!values?.chapters.length && values.chapters.map(({ title, url }, index) => (
                    <div className="form-chapters-fields" data-testid="form-chapters-fields">
                      <Form.Group size="sm" className="form-field">
                        <Form.Label size="sm" className="form-label font-weight-bold required text-black">
                          {intl.formatMessage(messages.chapterTitleLabel)} *
                        </Form.Label>
                        <FormikControl
                          name={`chapters[${index}].title`}
                          value={title}
                          placeholder={intl.formatMessage(messages.chapterTitlePlaceholder, { value: index + 1 })}
                        />
                        <Form.Control.Feedback className="form-helper-text">
                          {intl.formatMessage(messages.chapterTitleHelperText)}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group size="sm" className="form-field">
                        <div className="d-flex align-items-center mb-1">
                          <Form.Label size="sm" className="font-weight-bold mb-0 text-black">
                            {intl.formatMessage(messages.chapterUrlLabel)} *
                          </Form.Label>
                          <IconButtonWithTooltip
                            size="sm"
                            className="ml-auto field-icon-button"
                            tooltipContent={intl.formatMessage(messages.uploadButtonTooltip)}
                            src={UploadIcon}
                            iconAs={Icon}
                            data-testid="chapter-upload-button"
                            alt={intl.formatMessage(messages.uploadButtonAlt)}
                            onClick={() => onUploadButtonClick(index)}
                          />
                          <IconButtonWithTooltip
                            size="sm"
                            className="field-icon-button"
                            tooltipContent={intl.formatMessage(messages.deleteButtonTooltip)}
                            src={DeleteIcon}
                            iconAs={Icon}
                            data-testid="chapter-delete-button"
                            alt={intl.formatMessage(messages.deleteButtonAlt)}
                            onClick={() => arrayHelpers.remove(index)}
                          />
                        </div>
                        <FormikControl
                          name={`chapters[${index}].url`}
                          value={url}
                          placeholder={intl.formatMessage(messages.chapterUrlPlaceholder)}
                        />
                        <Form.Control.Feedback className="form-helper-text">
                          {intl.formatMessage(messages.chapterUrlHelperText)}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </div>
                  ))}
                  <div>
                    {!values.chapters.length && (
                      <Form.Control.Feedback className="pgn__form-text-invalid mb-2">
                        {intl.formatMessage(messages.addChapterHelperText)}
                      </Form.Control.Feedback>
                    )}
                    <Button
                      variant="outline-primary"
                      className="w-100"
                      iconBefore={AddIcon}
                      onClick={() => arrayHelpers.push({ title: '', url: '' })}
                    >
                      {intl.formatMessage(messages.addChapterButton)}
                    </Button>
                  </div>
                </>
              )}
            />
            <ActionRow>
              <Button variant="tertiary" onClick={closeTextbookForm} data-testid="cancel-button">
                {intl.formatMessage(messages.cancelButton)}
              </Button>
              <Button onClick={handleSubmit} disabled={!isValid} type="submit">
                {intl.formatMessage(messages.saveButton)}
              </Button>
            </ActionRow>
            <ModalDropzone
              isOpen={isUploadModalOpen}
              onClose={onCloseUploadModal}
              onCancel={onCloseUploadModal}
              onChange={(value) => setFieldValue(`chapters[${currentTextbookIndex}].url`, value)}
              fileTypes={['pdf']}
              modalTitle={intl.formatMessage(messages.uploadModalTitle, { courseName: courseTitle })}
              imageDropzoneText={intl.formatMessage(messages.uploadModalDropzoneText)}
              imageHelpText={intl.formatMessage(messages.uploadModalHelperText)}
              onSavingStatus={onSavingStatus}
              invalidFileSizeMore={intl.formatMessage(
                messages.uploadModalFileInvalidSizeText,
                { maxSize: UPLOAD_FILE_MAX_SIZE / (1000 * 1000) },
              )}
              onSelectFile={setSelectedFile}
              previewComponent={(
                <div className="modal-preview">
                  <Icon src={PdfIcon} className="modal-preview-icon" />
                  <span className="modal-preview-text">{selectedFile}</span>
                </div>
              )}
              maxSize={UPLOAD_FILE_MAX_SIZE}
            />
            <PromptIfDirty dirty={dirty} />
          </>
        )}
      </Formik>
    </div>
  );
};

TextbookForm.propTypes = {
  closeTextbookForm: PropTypes.func.isRequired,
  initialFormValues: PropTypes.shape({}).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onSavingStatus: PropTypes.func.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default TextbookForm;
