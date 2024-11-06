import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';

import {
  Container,
  Button,
  AlertModal,
  ActionRow,
} from '@openedx/paragon';
import AnswerWidget from './AnswerWidget';
import SettingsWidget from './SettingsWidget';
import QuestionWidget from './QuestionWidget';
import EditorContainer from '../../../EditorContainer';
import { selectors } from '../../../../data/redux';
import RawEditor from '../../../../sharedComponents/RawEditor';
import { ProblemTypeKeys } from '../../../../data/constants/problem';

import {
  checkIfEditorsDirty, parseState, saveWarningModalToggle, getContent,
} from './hooks';
import './index.scss';
import messages from './messages';

import ExplanationWidget from './ExplanationWidget';
import { saveBlock } from '../../../../hooks';

const EditProblemView = ({
  returnFunction,
  // redux
  problemType,
  problemState,
  lmsEndpointUrl,
  returnUrl,
  analytics,
  isDirty,
  // injected
  intl,
}) => {
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  const isAdvancedProblemType = problemType === ProblemTypeKeys.ADVANCED;
  const { isSaveWarningModalOpen, openSaveWarningModal, closeSaveWarningModal } = saveWarningModalToggle();

  const checkIfDirty = () => {
    if (isAdvancedProblemType && editorRef && editorRef?.current) {
      /* istanbul ignore next */
      return editorRef.current.observer?.lastChange !== 0;
    }
    return isDirty || checkIfEditorsDirty();
  };

  return (
    <EditorContainer
      getContent={() => getContent({
        problemState,
        openSaveWarningModal,
        isAdvancedProblemType,
        editorRef,
        lmsEndpointUrl,
      })}
      isDirty={checkIfDirty}
      returnFunction={returnFunction}
    >
      <AlertModal
        title={isAdvancedProblemType ? (
          intl.formatMessage(messages.olxSettingDiscrepancyTitle)
        ) : intl.formatMessage(messages.noAnswerTitle)}
        isOpen={isSaveWarningModalOpen}
        onClose={closeSaveWarningModal}
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={closeSaveWarningModal}>
              <FormattedMessage {...messages.saveWarningModalCancelButtonLabel} />
            </Button>
            <Button
              onClick={() => saveBlock({
                content: parseState({
                  problem: problemState,
                  isAdvanced: isAdvancedProblemType,
                  ref: editorRef,
                  lmsEndpointUrl,
                })(),
                returnFunction,
                destination: returnUrl,
                dispatch,
                analytics,
              })}
            >
              <FormattedMessage {...messages.saveWarningModalSaveButtonLabel} />
            </Button>
          </ActionRow>
        )}
      >
        {isAdvancedProblemType ? (
          <FormattedMessage {...messages.olxSettingDiscrepancyBodyExplanation} />
        ) : (
          <>
            <div>
              <FormattedMessage {...messages.saveWarningModalBodyQuestion} />
            </div>
            <div>
              <FormattedMessage {...messages.noAnswerBodyExplanation} />
            </div>
          </>
        )}
      </AlertModal>
      <div className="editProblemView d-flex flex-row flex-nowrap justify-content-end">
        {isAdvancedProblemType ? (
          <Container fluid className="advancedEditorTopMargin p-0">
            <RawEditor editorRef={editorRef} lang="xml" content={problemState.rawOLX} />
          </Container>
        ) : (
          <span className="flex-grow-1 mb-5">
            <QuestionWidget />
            <ExplanationWidget />
            <AnswerWidget problemType={problemType} />
          </span>
        )}
        <span className="editProblemView-settingsColumn">
          <SettingsWidget problemType={problemType} />
        </span>
      </div>
    </EditorContainer>
  );
};

EditProblemView.defaultProps = {
  lmsEndpointUrl: null,
  returnFunction: null,
  isDirty: false,
};

EditProblemView.propTypes = {
  problemType: PropTypes.string.isRequired,
  returnFunction: PropTypes.func,
  // eslint-disable-next-line
  problemState: PropTypes.any.isRequired,
  analytics: PropTypes.shape({}).isRequired,
  lmsEndpointUrl: PropTypes.string,
  returnUrl: PropTypes.string.isRequired,
  isDirty: PropTypes.bool,
  // injected
  intl: intlShape.isRequired,
};

export const mapStateToProps = (state) => ({
  analytics: selectors.app.analytics(state),
  lmsEndpointUrl: selectors.app.lmsEndpointUrl(state),
  returnUrl: selectors.app.returnUrl(state),
  problemType: selectors.problem.problemType(state),
  problemState: selectors.problem.completeState(state),
  isDirty: selectors.problem.isDirty(state),
});

export const EditProblemViewInternal = EditProblemView; // For testing only
export default injectIntl(connect(mapStateToProps)(EditProblemView));
