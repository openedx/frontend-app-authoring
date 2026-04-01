import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ModalDialog,
  Button,
  ActionRow,
  Hyperlink,
  Form,
} from '@openedx/paragon';
import { Formik } from 'formik';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { useHelpUrls } from '../../help-urls/hooks';
import FormikControl from '../../generic/FormikControl';
import { HIGHLIGHTS_FIELD_MAX_LENGTH } from '../constants';
import { getHighlightsFormValues } from '../utils';
import messages from './messages';

interface Highlights {
  highlight_1: string;
  highlight_2: string;
  highlight_3: string;
  highlight_4: string;
  highlight_5: string;
}

interface FormProps {
  onSubmit: (highlights: Highlights) => void;
}

interface Props extends FormProps {
  isOpen: boolean,
  onClose: () => void,
};

export const HighlightsForm = ({ onSubmit }: FormProps) => {
  const intl = useIntl();
  const { currentSelection } = useCourseAuthoringContext();
  const { data: currentItemData } = useCourseItemData(currentSelection?.currentId);
  const { highlights = [] } = currentItemData || {};
  const initialFormValues = getHighlightsFormValues(highlights);

  const {
    contentHighlights: contentHighlightsUrl,
  } = useHelpUrls(['contentHighlights']);

  return (
    <Formik initialValues={initialFormValues} onSubmit={onSubmit}>
      {({ values, dirty, handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          <ModalDialog.Body>
            <p className="mb-4.5 pb-2">
              {intl.formatMessage(messages.description, {
                documentation: (
                  <Hyperlink destination={contentHighlightsUrl} target="_blank" showLaunchIcon={false}>
                    {intl.formatMessage(messages.documentationLink)}
                  </Hyperlink>),
              })}
            </p>
            {Object.entries(initialFormValues).map(([key], index) => (
              <FormikControl
                key={key}
                name={key}
                value={values[key]}
                floatingLabel={intl.formatMessage(messages.highlight, { index: index + 1 })}
                maxLength={HIGHLIGHTS_FIELD_MAX_LENGTH}
                as="textarea"
              />
            ))}
          </ModalDialog.Body>
          <ModalDialog.Footer className="pt-1">
            <ActionRow>
              <ModalDialog.CloseButton variant="tertiary">
                {intl.formatMessage(messages.cancelButton)}
              </ModalDialog.CloseButton>
              <Button disabled={!dirty} type="submit">
                {intl.formatMessage(messages.saveButton)}
              </Button>
            </ActionRow>
          </ModalDialog.Footer>
        </Form>
      )}
    </Formik>
  );
}

const HighlightsModal = ({
  isOpen,
  onClose,
  onSubmit,
}: Props) => {
  const intl = useIntl();
  const { currentSelection } = useCourseAuthoringContext();
  const { data: currentItemData } = useCourseItemData(currentSelection?.currentId);
  const { displayName } = currentItemData || {};

  return (
    <ModalDialog
      title={displayName || ""}
      className="highlights-modal"
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
      isFullscreenOnMobile
      isOverflowVisible={false}
    >
      <ModalDialog.Header className="highlights-modal__header">
        <ModalDialog.Title>
          {intl.formatMessage(messages.title, {
            title: displayName,
          })}
        </ModalDialog.Title>
        <HighlightsForm onSubmit={onSubmit} />
      </ModalDialog.Header>
    </ModalDialog>
  );
};

export default HighlightsModal;
