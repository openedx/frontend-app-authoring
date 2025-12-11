import React from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Card } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { thunkActions } from '@src/editors/data/redux';
import BaseModal from '@src/editors/sharedComponents/BaseModal';
import Button from '@src/editors/sharedComponents/Button';
import { ProblemTypeKeys } from '@src/editors/data/constants/problem';
import messages from '../messages';
import { handleConfirmEditorSwitch } from '../hooks';
import { useProblemEditorContext } from '../../ProblemEditorContext';

const SwitchEditorCard = ({
  editorType,
  problemType,
}) => {
  const [isConfirmOpen, setConfirmOpen] = React.useState(false);
  const dispatch = useDispatch();
  const { editorRef } = useProblemEditorContext();
  if (problemType === ProblemTypeKeys.ADVANCED) { return null; }

  return (
    <Card className="border border-light-700 shadow-none">
      <BaseModal
        isOpen={isConfirmOpen}
        close={() => { setConfirmOpen(false); }}
        title={<FormattedMessage {...messages[`ConfirmSwitchMessageTitle-${editorType}`]} />}
        confirmAction={(
          <Button
            /* istanbul ignore next */
            onClick={() => handleConfirmEditorSwitch({
              switchEditor: () => dispatch(thunkActions.problem.switchEditor(editorType, editorRef)),
              setConfirmOpen,
            })}
            variant="primary"
          >
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
        onClick={() => { setConfirmOpen(true); }}
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
