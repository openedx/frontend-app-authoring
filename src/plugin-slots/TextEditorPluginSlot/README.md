# TextEditorPluginSlot

### Slot ID: `org.openedx.frontend.authoring.text_editor_plugin.v1`

### Slot ID Aliases
* `text_editor_plugin_slot`

### Plugin Props:

* `blockType` - String. The type of block being edited (e.g., `html`).

## Description

The `TextEditorPluginSlot` is rendered inside the Text Editor modal window for HTML XBlocks.
It is intended as a generic extension point that can host **any React component** – for example:

- **Contextual helpers** (tips, validation messages, writing guides)
- **Content utilities** (templates, reusable snippets, glossary insert tools)
- **Integrations** (linking to external systems, analytics, metadata editors)

By default, the slot is **empty**. Widgets are attached via `env.config.jsx` using the
`@openedx/frontend-plugin-framework`.

The only prop your component receives from the slot is:

- `blockType` – the current editor block type (for this slot it will typically be `html`).

Your component is responsible for interacting with the editor (if needed) using Redux state,
DOM APIs, or other utilities provided by `frontend-app-authoring`.

## Example: Adding a component into `TextEditorPluginSlot`

The following example configuration shows how to add a custom widget to the slot:

```jsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { MyTextEditorHelper } from '@example/my-text-editor-helper';

const config = {
  pluginSlots: {
    'org.openedx.frontend.authoring.text_editor_plugin.v1': {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'my-text-editor-helper',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: MyTextEditorHelper,
          },
        },
      ]
    }
  },
}

export default config;
```

## Example: Custom Implementation

The following example shows a minimal helper component that uses `blockType`:

```jsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { Card } from '@openedx/paragon';

const CustomTextEditorWidget = ({ blockType }) => {
  // Your custom implementation (example)
  return (
    <Card>
      <Card.Body>
        Custom widget for {blockType} editor 🤗🤗🤗
      </Card.Body>
    </Card>
  );
};

const config = {
  pluginSlots: {
    'org.openedx.frontend.authoring.text_editor_plugin.v1': {
      plugins: [
        {
          widget: {
            id: 'custom-text-editor-widget',
            priority: 1,
            type: DIRECT_PLUGIN,
            RenderWidget: CustomTextEditorWidget,
          },
          op: PLUGIN_OPERATIONS.Insert,
        },
      ]
    }
  },
}

export default config;
```

### Example: Screenshots

**With a widget rendered in the slot**

![Screenshot with component in TextEditorPluginSlot](./images/html_editor_slot.png)

**Default HTML editor without a widget**

![Screenshot with default HTML editor](./images/default_html_editor.png)
