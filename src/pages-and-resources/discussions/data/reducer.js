import { combineReducers } from 'redux';

import { reducer as appListReducer } from '../app-list';
import { reducer as appConfigFormReducer } from '../app-config-form';

const reducer = combineReducers({
  appList: appListReducer,
  appConfigForm: appConfigFormReducer,
});

export default reducer;
