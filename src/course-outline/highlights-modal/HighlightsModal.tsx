import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ModalDialog,
  Button,
  ActionRow,
  Hyperlink,
  Form,
  Card,
  IconButton,
} from '@openedx/paragon';
import { Edit as EditIcon } from '@openedx/paragon/icons';
import { Formik, useFormikContext } from 'formik';
import { useEffect, useState } from 'react';

import { useCourseOutlineContext } from '@src/course-outline/CourseOutlineContext';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { ExpandableCard } from '@src/generic/expandable-card/ExpandableCard';
import { useBlocker } from 'react-router';
import PromptIfDirty from '@src/generic/prompt-if-dirty/PromptIfDirty';
import { useHelpUrls } from '../../help-urls/hooks';
import FormikControl from '../../generic/FormikControl';
import { HIGHLIGHTS_FIELD_MAX_LENGTH } from '../constants';
import { getHighlightsFormValues } from '../utils';
import messages from './messages';

export interface HighlightData {
  highlight_1: string;
  highlight_2: string;
  highlight_3: string;
  highlight_4: string;
  highlight_5: string;
}

type DisplayMode = 'empty' | 'viewing' | 'editing';

interface HighlightsFormProps {
  onSubmit: (highlights: HighlightData) => void;
  onCancel?: () => void;
  initialValues: HighlightData;
  onDirtyChange?: (dirty: boolean) => void;
}

interface HighlightsCardProps {
  sectionId: string;
  onSubmit: (highlights: HighlightData) => void;
}

const ConfirmNavigationModal = ({
  isOpen,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const intl = useIntl();

  return (
    <ModalDialog
      title={intl.formatMessage(messages.unsavedChangesTitle)}
      isOpen={isOpen}
      onClose={onCancel}
      hasCloseButton
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages.unsavedChangesTitle)}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <p>{intl.formatMessage(messages.unsavedChangesMessage)}</p>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <Button variant="tertiary" onClick={onCancel}>
            {intl.formatMessage(messages.keepEditingButton)}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {intl.formatMessage(messages.discardChangesButton)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

// Separate component so hooks can be used at the top level of a component
const HighlightsFormInner = ({
  initialValues,
  onCancel,
  onDirtyChange,
}: Pick<HighlightsFormProps, 'onCancel' | 'onDirtyChange' | 'initialValues'>) => {
  const intl = useIntl();
  const { contentHighlights: contentHighlightsUrl } = useHelpUrls([
    'contentHighlights',
  ]);

  const {
    values,
    dirty,
    handleSubmit,
    resetForm,
  } = useFormikContext<HighlightData>();

  // Notify parent of dirty state changes
  useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className="highlights-form">
        <p className="mb-4.5 pb-2">
          {intl.formatMessage(messages.description, {
            documentation: (
              <Hyperlink
                destination={contentHighlightsUrl}
                target="_blank"
                showLaunchIcon={false}
              >
                {intl.formatMessage(messages.documentationLink)}
              </Hyperlink>
            ),
          })}
        </p>
        <div className="highlights-form__fields">
          {Object.entries(initialValues).map(([key], index) => (
            <FormikControl
              key={key}
              name={key}
              value={values[key]}
              floatingLabel={intl.formatMessage(messages.highlight, {
                index: index + 1,
              })}
              maxLength={HIGHLIGHTS_FIELD_MAX_LENGTH}
              as="textarea"
            />
          ))}
        </div>
        <div className="highlights-form__actions">
          <Button
            variant="tertiary"
            onClick={() => {
              resetForm();
              onCancel?.();
            }}
          >
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <Button disabled={!dirty} type="submit">
            {intl.formatMessage(messages.saveButton)}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export const HighlightsForm = ({
  onSubmit,
  onCancel,
  initialValues,
  onDirtyChange,
}: HighlightsFormProps) => (
  <Formik initialValues={initialValues} onSubmit={onSubmit}>
    <HighlightsFormInner
      initialValues={initialValues}
      onCancel={onCancel}
      onDirtyChange={onDirtyChange}
    />
  </Formik>
);

const HighlightsViewCard = ({
  highlights,
  onEdit,
}: {
  highlights: string[];
  onEdit: () => void;
}) => {
  const intl = useIntl();
  const nonEmptyHighlights = highlights.filter((h) => h?.trim());

  return (
    <Card>
      <Card.Header
        title={intl.formatMessage(messages.highlightsTitle)}
        size="sm"
        actions={
          <ActionRow>
            <IconButton
              size="sm"
              src={EditIcon}
              onClick={onEdit}
              alt={intl.formatMessage(messages.editButton)}
            />
          </ActionRow>
        }
      />
      <Card.Body>
        <ExpandableCard maxHeight={400}>
          {nonEmptyHighlights.map((highlight) => <p key={highlight}>{highlight}</p>)}
        </ExpandableCard>
      </Card.Body>
    </Card>
  );
};

const HighlightsEmptyState = ({ onAdd }: { onAdd: () => void; }) => {
  const intl = useIntl();

  return (
    <Button block onClick={onAdd}>
      {intl.formatMessage(messages.addHighlightsButton)}
    </Button>
  );
};

export const HighlightsCard = ({ sectionId, onSubmit }: HighlightsCardProps) => {
  const { data: currentItemData } = useCourseItemData(sectionId);
  const { highlights = [] } = currentItemData || {};

  const [mode, setMode] = useState<DisplayMode>(
    highlights.some((h) => h?.trim()) ? 'viewing' : 'empty',
  );

  const [formDirty, setFormDirty] = useState(false);

  const initialFormValues = getHighlightsFormValues(highlights);
  const blocker = useBlocker(formDirty);

  const handleAddClick = () => {
    setMode('editing');
    setFormDirty(false);
  };

  const handleEditClick = () => {
    setMode('editing');
    setFormDirty(false);
  };

  const handleFormSubmit = async (values: HighlightData) => {
    // Call parent onSubmit
    onSubmit(values);
    setFormDirty(false);
    setMode(
      Object.values(values).some((v) => v?.trim()) ? 'viewing' : 'empty',
    );
  };

  const handleFormCancel = () => {
    setFormDirty(false);
    setMode(
      highlights.some((h) => h?.trim()) ? 'viewing' : 'empty',
    );
  };

  /* istanbul ignore next */
  const handleConfirmNavigation = () => {
    setFormDirty(false);
    blocker.proceed?.();
  };

  return (
    <>
      <ConfirmNavigationModal
        isOpen={blocker.state === 'blocked'}
        onConfirm={handleConfirmNavigation}
        onCancel={/* istanbul ignore next */ () => {
          blocker.reset?.();
        }}
      />

      {mode === 'empty' && <HighlightsEmptyState onAdd={handleAddClick} />}

      {mode === 'viewing' && (
        <HighlightsViewCard
          highlights={highlights}
          onEdit={handleEditClick}
        />
      )}

      {mode === 'editing' && (
        <HighlightsForm
          initialValues={initialFormValues}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          onDirtyChange={setFormDirty}
        />
      )}
      <PromptIfDirty dirty={formDirty} />
    </>
  );
};

// Keep the modal version for backward compatibility
const HighlightsModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (highlights: HighlightData) => void;
}) => {
  const intl = useIntl();
  const { currentSelection } = useCourseOutlineContext();
  const { data: currentItemData } = useCourseItemData(
    currentSelection?.currentId,
  );
  const { displayName } = currentItemData || {};
  const { highlights = [] } = currentItemData || {};
  const initialFormValues = getHighlightsFormValues(highlights);

  return (
    <ModalDialog
      title={displayName || ''}
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
      </ModalDialog.Header>
      <ModalDialog.Body>
        <HighlightsForm
          initialValues={initialFormValues}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default HighlightsModal;
