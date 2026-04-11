# Image Settings Modal Slot

### Slot ID: `org.openedx.frontend.authoring.image_settings_modal.v1`

### Plugin Props:

- `initialValues` - Object. The initial values for the Formik form.
- `validationSchema` - Object. The Yup validation schema for the form.
- `processValues` - Function. A function to process form values before submission.

## Description

This slot wraps the image settings modal. It can be used to modify the form's initial values, validation schema, or to wrap the entire modal component. You can also use this slot to add validation and initial values to the form. The `processValues` function is called to clean up values being submitted.

Combined with `ImageAdditionalSettingsSlot`, this slot allows extending the image editing capabilities of the image settings modal.

Since this slot wraps a modal that uses a React portal, you can't use it to wrap the modal in another div etc.

## Example

The following `env.config.jsx` will modify the image settings modal to log the values being submitted.

```jsx
import { PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.authoring.image_settings_modal.v1': {
      keepDefault: true,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Modify,
          widgetId: 'default_contents',
          fn: (widget) => {
            widget.content.processValues = (values) => {
              console.log('Processing values:', values);
            };
            return widget;
          },
        },
      ],
    },
  },
};

export default config;
```
