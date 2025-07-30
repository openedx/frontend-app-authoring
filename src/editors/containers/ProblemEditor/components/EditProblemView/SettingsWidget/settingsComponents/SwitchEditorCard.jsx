import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Card } from '@openedx/paragon';
import PropTypes from 'prop-types';
import messages from '../messages';
import { selectors, thunkActions } from '../../../../../../data/redux';
import BaseModal from '../../../../../../sharedComponents/BaseModal';
import Button from '../../../../../../sharedComponents/Button';
import { handleConfirmEditorSwitch } from '../hooks';
import { ProblemTypeKeys } from '../../../../../../data/constants/problem';

const SwitchEditorCard = ({ problemType, editorType }) => {
  const dispatch = useDispatch();

  const isMarkdownEditorEnabled = useSelector(
    (state) => selectors.problem.isMarkdownEditorEnabled(state)
      && selectors.app.isMarkdownEditorEnabledForCourse(state),
  );

  const [isConfirmOpen, setConfirmOpen] = React.useState(false);

  if (isMarkdownEditorEnabled || problemType === ProblemTypeKeys.ADVANCED) {
    return null;
  }

  const handleSwitch = () => {
    handleConfirmEditorSwitch({
      switchEditor: () => dispatch(thunkActions.problem.switchEditor(editorType)),
      setConfirmOpen,
    });
  };

  return (
    <Card className="border border-light-700 shadow-none">
      <BaseModal
        isOpen={isConfirmOpen}
        close={() => setConfirmOpen(false)}
        title={
          <FormattedMessage {...messages[`ConfirmSwitchMessageTitle-${editorType}`]} />
        }
        confirmAction={(
          <Button onClick={handleSwitch} variant="primary">
            <FormattedMessage {...messages[`ConfirmSwitchButtonLabel-${editorType}`]} />
          </Button>
        )}
        size="md"
      >
        <FormattedMessage {...messages[`ConfirmSwitchMessage-${editorType}`]} />
      </BaseModal>

      <Button
        className="my-3 ml-2 py-0"
        variant="link"
        size="sm"
        onClick={() => setConfirmOpen(true)}
      >
        <FormattedMessage {...messages[`SwitchButtonLabel-${editorType}`]} />
      </Button>
    </Card>
  );
};

SwitchEditorCard.propTypes = {
  problemType: PropTypes.string.isRequired,
  editorType: PropTypes.string.isRequired,
};

export default SwitchEditorCard;
