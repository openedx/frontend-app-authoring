import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';

import {
  Container,
  Button,
  AlertModal,
  ActionRow,
} from '@openedx/paragon';

import PropTypes from 'prop-types';
import { useEditorContext } from '@src/editors/EditorContext';
import AnswerWidget from './AnswerWidget';
import SettingsWidget from './SettingsWidget';
import QuestionWidget from './QuestionWidget';
import EditorContainer from '../../../EditorContainer';
import RawEditor from '../../../../sharedComponents/RawEditor';
import { ProblemTypeKeys } from '../../../../data/constants/problem';
import { blockTypes } from '../../../../data/constants/app';

import {
  checkIfEditorsDirty, parseState, saveWarningModalToggle, getContent,
} from './hooks';

import './index.scss';
import messages from './messages';
import ExplanationWidget from './ExplanationWidget';
import { saveBlock } from '../../../../hooks';

import { selectors } from '../../../../data/redux';
import { ProblemEditorContextProvider } from './ProblemEditorContext';
import { ProblemEditorPluginSlot } from '../../../../../plugin-slots/ProblemEditorPluginSlot';

const EditProblemView = ({ returnFunction }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const editorRef = useRef(null);

  const analytics = useSelector(selectors.app.analytics);
  const lmsEndpointUrl = useSelector(selectors.app.lmsEndpointUrl);
  const returnUrl = useSelector(selectors.app.returnUrl);
  const problemType = useSelector(selectors.problem.problemType);
  const problemState = useSelector(selectors.problem.completeState);
  const isDirty = useSelector(selectors.problem.isDirty);

  const isMarkdownEditorEnabledSelector = useSelector(selectors.problem.isMarkdownEditorEnabled);
  const { isMarkdownEditorEnabledForContext } = useEditorContext();

  const isMarkdownEditorEnabled = isMarkdownEditorEnabledSelector && isMarkdownEditorEnabledForContext;

  const isAdvancedProblemType = problemType === ProblemTypeKeys.ADVANCED;

  const { isSaveWarningModalOpen, openSaveWarningModal, closeSaveWarningModal } = saveWarningModalToggle();

  const checkIfDirty = () => {
    if (isAdvancedProblemType && editorRef?.current) {
      return editorRef.current.observer?.lastChange !== 0;
    }
    return isDirty || checkIfEditorsDirty();
  };

  return (
    <ProblemEditorContextProvider editorRef={editorRef}>
      <EditorContainer
        getContent={() => getContent({
          problemState,
          openSaveWarningModal,
          isAdvancedProblemType,
          isMarkdownEditorEnabled,
          editorRef,
          lmsEndpointUrl,
        })}
        isDirty={checkIfDirty}
        returnFunction={returnFunction}
      >
        <AlertModal
          title={isAdvancedProblemType
            ? intl.formatMessage(messages.olxSettingDiscrepancyTitle)
            : intl.formatMessage(messages.noAnswerTitle)}
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
                    isMarkdown: isMarkdownEditorEnabled,
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
          {isAdvancedProblemType || isMarkdownEditorEnabled ? (
            <Container fluid className="advancedEditorTopMargin p-0">
              <RawEditor
                editorRef={editorRef}
                lang={isMarkdownEditorEnabled ? 'markdown' : 'xml'}
                content={isMarkdownEditorEnabled ? problemState.rawMarkdown : problemState.rawOLX}
              />
            </Container>
          ) : (
            <span className="flex-grow-1 mb-5">
              <ProblemEditorPluginSlot blockType={problemType || blockTypes.problem} />
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
    </ProblemEditorContextProvider>
  );
};
EditProblemView.defaultProps = {
  returnFunction: null,
};

EditProblemView.propTypes = {
  returnFunction: PropTypes.func,
};

export default EditProblemView;
