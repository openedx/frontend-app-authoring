import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Card } from '@openedx/paragon';
import PropTypes from 'prop-types';
import messages from '../messages';
import { selectors, thunkActions } from '../../../../../../data/redux';
import BaseModal from '../../../../../../sharedComponents/BaseModal';
import Button from '../../../../../../sharedComponents/Button';
import { handleConfirmEditorSwitch } from '../hooks';
import { ProblemTypeKeys } from '../../../../../../data/constants/problem';

const SwitchEditorCard = ({
  editorType,
  problemType,
  switchEditor,
  isMarkdownEditorEnabled,
}) => {
  const [isConfirmOpen, setConfirmOpen] = React.useState(false);

  if (isMarkdownEditorEnabled || problemType === ProblemTypeKeys.ADVANCED) { return null; }

  return (
    <Card className="border border-light-700 shadow-none">
      <BaseModal
        isOpen={isConfirmOpen}
        close={() => { setConfirmOpen(false); }}
        title={<FormattedMessage {...messages[`ConfirmSwitchMessageTitle-${editorType}`]} />}
        confirmAction={(
          <Button
            /* istanbul ignore next */
            onClick={() => handleConfirmEditorSwitch({ switchEditor: () => switchEditor(editorType), setConfirmOpen })}
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
  switchEditor: PropTypes.func.isRequired,
  isMarkdownEditorEnabled: PropTypes.bool.isRequired,
  problemType: PropTypes.string.isRequired,
  editorType: PropTypes.string.isRequired,
};

export const mapStateToProps = (state) => ({
  isMarkdownEditorEnabled: selectors.problem.isMarkdownEditorEnabled(state)
     && selectors.app.isMarkdownEditorEnabledForCourse(state),
});
export const mapDispatchToProps = {
  switchEditor: thunkActions.problem.switchEditor,
};

export const SwitchEditorCardInternal = SwitchEditorCard; // For testing only
export default connect(mapStateToProps, mapDispatchToProps)(SwitchEditorCard);
