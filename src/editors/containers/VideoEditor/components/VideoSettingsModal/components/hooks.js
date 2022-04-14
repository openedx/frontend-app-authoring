import { useSelector } from 'react-redux';

import { keyStore } from '../../../../../utils';
import { actions, selectors } from '../../../../../data/redux';

export const selectorKeys = keyStore(selectors.video);

export const widgetValue = (key, dispatch) => ({
  formValue: useSelector(selectors.video[key]),
  setFormValue: (val) => dispatch(actions.video.load({ [key]: val })),
});

export default {
  selectorKeys,
  widgetValue,
};
