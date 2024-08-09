/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/**
 * This is an example component for an xblock Editor
 * It uses pre-existing components to handle the saving of a the result of a function into the xblock's data.
 * To use run npm run-script addXblock <your>
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Spinner } from '@openedx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import EditorContainer from '../EditorContainer';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from '.';
import { actions, selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';

export const hooks = {
  getContent: () => ({
    some: 'content',
  }),
};

export const thumbEditor = ({
  onClose,
  // redux
  blockValue,
  lmsEndpointUrl,
  blockFailed,
  blockFinished,
  initializeEditor,
  exampleValue,
  // inject
  intl,
}) => (
  <EditorContainer
    getContent={module.hooks.getContent}
    onClose={onClose}
  >
    <div>
      {exampleValue}
    </div>
    <div className="editor-body h-75 overflow-auto">
      {!blockFinished
        ? (
          <div className="text-center p-6">
            <Spinner
              animation="border"
              className="m-3"
              // Use a messages.js file for intl messages.
              screenreadertext={intl.formatMessage('Loading Spinner')}
            />
          </div>
        )
        : (
          <p>
            Your Editor Goes here.
            You can get at the xblock data with the blockValue field.
            here is what is in your xblock:  {JSON.stringify(blockValue)}
          </p>
        )}
    </div>
  </EditorContainer>
);
thumbEditor.defaultProps = {
  blockValue: null,
  lmsEndpointUrl: null,
};
thumbEditor.propTypes = {
  onClose: PropTypes.func.isRequired,
  // redux
  blockValue: PropTypes.shape({
    data: PropTypes.shape({ data: PropTypes.string }),
  }),
  lmsEndpointUrl: PropTypes.string,
  blockFailed: PropTypes.bool.isRequired,
  blockFinished: PropTypes.bool.isRequired,
  initializeEditor: PropTypes.func.isRequired,
  // inject
  intl: intlShape.isRequired,
};

export const mapStateToProps = (state) => ({
  blockValue: selectors.app.blockValue(state),
  lmsEndpointUrl: selectors.app.lmsEndpointUrl(state),
  blockFailed: selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchBlock }),
  blockFinished: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }),
  // TODO fill with redux state here if needed
  exampleValue: selectors.game.exampleValue(state),
});

export const mapDispatchToProps = {
  initializeEditor: actions.app.initializeEditor,
  // TODO fill with dispatches here if needed
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(thumbEditor));
