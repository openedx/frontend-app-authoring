import { StrictDict } from '../../../utils';
import { RequestStates } from '../../constants/requests';
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
