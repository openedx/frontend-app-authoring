import { StrictDict } from '../../../utils';
import { RequestStates } from '../../constants/requests';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './selectors';

export const requestStatus = (state, { requestKey }) => state.requests[requestKey];

export const statusSelector = (fn) => (state, { requestKey }) => fn(state.requests[requestKey]);

export const isInactive = ({ status }) => status === RequestStates.inactive;
export const isPending = ({ status }) => status === RequestStates.pending;
export const isCompleted = ({ status }) => status === RequestStates.completed;
export const isFailed = ({ status }) => status === RequestStates.failed;
export const isFinished = ({ status }) => (
  [RequestStates.failed, RequestStates.completed].includes(status)
);
export const error = (request) => request.error;
export const errorStatus = (request) => request.error?.response?.status;
export const errorCode = (request) => request.error?.response?.data;

export const data = (request) => request.data;

export const connectedStatusSelectors = () => ({
  isInactive: module.statusSelector(isInactive),
  isPending: module.statusSelector(isPending),
  isCompleted: module.statusSelector(isCompleted),
  isFailed: module.statusSelector(isFailed),
  isFinished: module.statusSelector(isFinished),
  error: module.statusSelector(error),
  errorCode: module.statusSelector(errorCode),
  errorStatus: module.statusSelector(errorStatus),
  data: module.statusSelector(data),
});

export default StrictDict({
  requestStatus,
  ...module.connectedStatusSelectors(),
});
