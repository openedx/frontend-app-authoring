import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Button, Form, IconButton, ModalDialog,
} from '@openedx/paragon';
import { Settings } from '@openedx/paragon/icons';
import { useState } from 'react';
import { useCourseImportFilter } from './context';
import messages from './messages';

interface FilterModalProps {
  show: boolean;
  onClose: () => void;
  handleSave: (isChecked: boolean) => void;
}

const FilterModal = ({ show, onClose, handleSave }: FilterModalProps) => {
  const intl = useIntl();
  const { hidePreviouslyImportedCourses } = useCourseImportFilter() || {};
  const [isChecked, setChecked] = useState(!hidePreviouslyImportedCourses);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setChecked(e.target.checked);

  const reset = () => setChecked(!hidePreviouslyImportedCourses);

  const submit = () => {
    handleSave(isChecked);
  };

  const cancel = () => {
    onClose();
    reset();
  };

  if (!show) {
    return null;
  }

  return (
    <ModalDialog
      title={intl.formatMessage(messages.modalTitle)}
      onClose={cancel}
      isOverflowVisible={false}
      hasCloseButton
      isFullscreenOnMobile
      isOpen={show}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages.modalTitle)}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Form.Checkbox checked={isChecked} onChange={handleChange}>
          {intl.formatMessage(messages.checkboxLabel)}
        </Form.Checkbox>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage(messages.cancelBtn)}
          </ModalDialog.CloseButton>
          <Button onClick={submit}>
            {intl.formatMessage(messages.saveBtn)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export const CourseImportFilter = () => {
  const intl = useIntl();
  const [show, setShow] = useState(false);
  const importContext = useCourseImportFilter();
  const { setHidePreviouslyImportedCourses } = importContext || {};
  const handleSave = (isChecked: boolean) => {
    setHidePreviouslyImportedCourses?.(!isChecked);
    setShow(false);
  };

  if (typeof importContext === 'undefined') {
    return null;
  }

  return (
    <>
      <IconButton
        src={Settings}
        alt={intl.formatMessage(messages.actionBtnAltText)}
        onClick={() => setShow((prev) => !prev)}
      />
      <FilterModal handleSave={handleSave} show={show} onClose={() => setShow(false)} />
    </>
  );
};
