import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';

import {
  Container,
  Button,
  AlertModal,
  ActionRow,
} from '@edx/paragon';
import AnswerWidget from './AnswerWidget';
import SettingsWidget from './SettingsWidget';
import QuestionWidget from './QuestionWidget';
import EditorContainer from '../../../EditorContainer';
import { selectors } from '../../../../data/redux';
import RawEditor from '../../../../sharedComponents/RawEditor';
import { ProblemTypeKeys } from '../../../../data/constants/problem';

import { parseState, noAnswerModalToggle, getContent } from './hooks';
import './index.scss';
import messages from './messages';

import ExplanationWidget from './ExplanationWidget';
import { saveBlock } from '../../../../hooks';

export const EditProblemView = ({
  // redux
  problemType,
  problemState,
  assets,
  lmsEndpointUrl,
  returnUrl,
  analytics,
  // injected
  intl,
}) => {
  const editorRef = useRef(null);
  const isAdvancedProblemType = problemType === ProblemTypeKeys.ADVANCED;
  const { isNoAnswerModalOpen, openNoAnswerModal, closeNoAnswerModal } = noAnswerModalToggle();
  const dispatch = useDispatch();

  return (
    <EditorContainer
      getContent={() => getContent({
        problemState,
        openNoAnswerModal,
        isAdvancedProblemType,
        editorRef,
        assets,
        lmsEndpointUrl,
      })}
    >
      <AlertModal
        title={intl.formatMessage(messages.noAnswerModalTitle)}
        isOpen={isNoAnswerModalOpen}
        onClose={closeNoAnswerModal}
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={closeNoAnswerModal}>
              <FormattedMessage {...messages.noAnswerCancelButtonLabel} />
            </Button>
            <Button
              onClick={() => saveBlock({
                content: parseState({
                  problem: problemState,
                  isAdvanced: isAdvancedProblemType,
                  ref: editorRef,
                  assets,
                  lmsEndpointUrl,
                })(),
                destination: returnUrl,
                dispatch,
                analytics,
              })}
            >
              <FormattedMessage {...messages.noAnswerSaveButtonLabel} />
            </Button>
          </ActionRow>
        )}
      >
        <div>
          <FormattedMessage {...messages.noAnswerModalBodyQuestion} />
        </div>
        <div>
          <FormattedMessage {...messages.noAnswerModalBodyExplanation} />
        </div>
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
  assets: null,
  lmsEndpointUrl: null,
};

EditProblemView.propTypes = {
  problemType: PropTypes.string.isRequired,
  // eslint-disable-next-line
  problemState: PropTypes.any.isRequired,
  assets: PropTypes.shape({}),
  analytics: PropTypes.shape({}).isRequired,
  lmsEndpointUrl: PropTypes.string,
  returnUrl: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export const mapStateToProps = (state) => ({
  assets: selectors.app.assets(state),
  analytics: selectors.app.analytics(state),
  lmsEndpointUrl: selectors.app.lmsEndpointUrl(state),
  returnUrl: selectors.app.returnUrl(state),
  problemType: selectors.problem.problemType(state),
  problemState: selectors.problem.completeState(state),
});

export default injectIntl(connect(mapStateToProps)(EditProblemView));
