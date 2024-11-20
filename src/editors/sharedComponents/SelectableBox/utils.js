import { CheckboxControl } from './FormCheckbox';
import { RadioControl } from './FormRadio';
import FormRadioSet from './FormRadioSet';
import FormCheckboxSet from './FormCheckboxSet';

// eslint-disable-next-line consistent-return
export const getInputType = (component, type) => {
  if (component === 'SelectableBox') {
    switch (type) {
      case 'radio':
        return RadioControl;
      case 'checkbox':
        return CheckboxControl;
      default:
        return RadioControl;
    }
  } else if (component === 'SelectableBoxSet') {
    switch (type) {
      case 'radio':
        return FormRadioSet;
      case 'checkbox':
        return FormCheckboxSet;
      default:
        return FormRadioSet;
    }
  }
};
