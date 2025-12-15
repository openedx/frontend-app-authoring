# ProblemEditorPluginSlot

### Slot ID: `org.openedx.frontend.authoring.problem_editor_plugin.v1`

### Slot ID Aliases
* `problem_editor_plugin_slot`

### Plugin Props:

* `blockType` - String. The type of problem block being edited (e.g., 'problem-single-select', 'problem-multi-select', 'problem', 'advanced').

## Description

The slot is positioned in the Problem Editor modal window for all problem XBlock types (single-select, multi-select, dropdown, numerical-input, text-input, and advanced). It is suitable for adding AI-powered content generation tools or other editor enhancements.

By default, the slot is **empty**. Add widgets via `env.config.jsx`.

The slot is available in both:
- **Visual Editor Mode**: Where the widget can generate OLX content that is parsed and loaded into the visual editor components.
- **Advanced/Raw Editor Mode**: Where the widget can generate raw OLX or Markdown content that is directly inserted into the CodeMirror editor.

## Example: Adding the AI Content Assistant

The following example configuration shows how to add the built-in AI Content Assistant widget:

```jsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { AIAssistantWidget } from '@edx/frontend-ai-content-assistant';

const config = {
  pluginSlots: {
    'org.openedx.frontend.authoring.problem_editor_plugin.v1': {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'ai-content-assistant',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: AIAssistantWidget,
          },
        },
      ]
    }
  },
}

export default config;
```

## Example: Custom Implementation

The following example configuration shows how to add a custom AI assistant:

```jsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { Card } from '@openedx/paragon';

const CustomAIAssistant = ({ blockType }) => {
  // Your custom AI assistant implementation (example)
  return (
    <Card>
      <Card.Body>
        Custom Component for {blockType} Editor 🤗🤗🤗
      </Card.Body>
    </Card>
  );
};

const config = {
  pluginSlots: {
    'org.openedx.frontend.authoring.problem_editor_plugin.v1': {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom-problem-editor-assistant',
            priority: 1,
            type: DIRECT_PLUGIN,
            RenderWidget: CustomProblemAssistant,
          },
        },
      ]
    }
  },
}

export default config;
```

### Example: Screenshot with default Problem Editor
![Screenshot with custom implementation](./images/default_problem_editor.png)

### Example: Screenshots with passed component into plugin slot for Problem editor
![Screenshot with hidden AIAssistantWidget](./images/problem_editor_slot.png)
