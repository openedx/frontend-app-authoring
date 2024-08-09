import React from 'react';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Card } from '@openedx/paragon';
import PropTypes from 'prop-types';
import messages from '../messages';
import { thunkActions } from '../../../../../../data/redux';
import BaseModal from '../../../../../../sharedComponents/BaseModal';
import Button from '../../../../../../sharedComponents/Button';
import { confirmSwitchToAdvancedEditor } from '../hooks';
import { ProblemTypeKeys } from '../../../../../../data/constants/problem';

const SwitchToAdvancedEditorCard = ({
  problemType,
  switchToAdvancedEditor,
}) => {
  const [isConfirmOpen, setConfirmOpen] = React.useState(false);

  if (problemType === ProblemTypeKeys.ADVANCED) { return null; }

  return (
    <Card className="border border-light-700 shadow-none">
      <BaseModal
        isOpen={isConfirmOpen}
        close={() => { setConfirmOpen(false); }}
        title={(<FormattedMessage {...messages.ConfirmSwitchMessageTitle} />)}
        confirmAction={(
          <Button
            onClick={() => confirmSwitchToAdvancedEditor({ switchToAdvancedEditor, setConfirmOpen })}
            variant="primary"
          >
            <FormattedMessage {...messages.ConfirmSwitchButtonLabel} />
          </Button>
        )}
        size="md"
      >
        <FormattedMessage {...messages.ConfirmSwitchMessage} />
      </BaseModal>
      <Button
        className="my-3 ml-2 py-0"
        variant="link"
        size="sm"
        onClick={() => { setConfirmOpen(true); }}
      >
        <FormattedMessage {...messages.SwitchButtonLabel} />
      </Button>
    </Card>
  );
};

SwitchToAdvancedEditorCard.propTypes = {
  switchToAdvancedEditor: PropTypes.func.isRequired,
  problemType: PropTypes.string.isRequired,
};

export const mapStateToProps = () => ({
});
export const mapDispatchToProps = {
  switchToAdvancedEditor: thunkActions.problem.switchToAdvancedEditor,
};

export const SwitchToAdvancedEditorCardInternal = SwitchToAdvancedEditorCard; // For testing only
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SwitchToAdvancedEditorCard));
