# XBlockEditorSlot

### Slot ID: `org.openedx.frontend.authoring.xblock_editor.<blockType>.v1`

`<blockType>` is the XBlock type being edited, e.g.
`org.openedx.frontend.authoring.xblock_editor.games.v1`.

### Slot ID Aliases

- `xblock_editor_<blockType>_slot`

### Plugin Props:

- `blockType` - String. The XBlock type being edited.
- `blockId` - String or null. Usage key of the block; null while one is being created.
- `learningContextId` - String or null. Course or library the block belongs to.
- `lmsEndpointUrl` - String or null.
- `studioEndpointUrl` - String or null.
- `onClose` - Function or null. Call to dismiss the editor.
- `returnFunction` - Function or null. Called with the editor result when the host wants the value back instead of a save.
- `extraProps` - Object or null. Host-supplied extras, passed through untouched.

## Description

Lets an out-of-tree plugin supply the authoring UI for an XBlock type, so an
editor can be maintained and released outside this repository.

The slot's default content is this app's existing behaviour: a built-in editor
from `supportedEditors` when one exists for the block type, otherwise
`AdvancedEditor`, which renders the block's own `studio_view` in a sandboxed
iframe. Installing no plugins changes nothing.

Because a plugin is an ordinary React component rendered inside this app's
bundle, it shares this app's React, Paragon and `@edx/frontend-platform`
instances — it must declare them as `peerDependencies`, never as
`dependencies`, or the build will end up with two copies of React. It may also
import app internals through the `CourseAuthoring` alias, as the packages under
`plugins/` already do:

```jsx
import EditorContainer from 'CourseAuthoring/editors/containers/EditorContainer';
import DraggableList from 'CourseAuthoring/generic/DraggableList';
```

### Why the slot ID includes the block type

`keepDefault` is per-slot. If every block type shared one slot ID, an operator
adding an editor for a single block type with `keepDefault: false` would remove
the built-in editors for **all** block types at once. Naming the block type in
the ID means a plugin claims exactly that type, and every other type keeps
whatever this app renders by default.

The consequence is that a plugin must know the block type it edits, which it
does, and that there is no way to register one editor for several types without
listing each. That trade is deliberate: it keeps the failure mode local.

A slot with no configuration resolves to `{ keepDefault: true, plugins: [] }`
(`usePluginSlot` in `@openedx/frontend-plugin-framework`), so an unconfigured
block type renders this app's default editor and nothing changes for operators
who install no plugins.

### Replacing versus wrapping

- `keepDefault: false` — the plugin _is_ the editor. This is the usual case.
- `keepDefault: true` with `PLUGIN_OPERATIONS.Wrap` on `widgetId: 'default_contents'`
  — decorate the built-in editor rather than replace it.

## Example

Supply an external editor for the `games` block type. `GamesEditor` comes from a
separate npm package that declares `react`, `@openedx/paragon` and
`@edx/frontend-platform` as peer dependencies.

```jsx
import GamesEditor from '@openedx-plugins/xblock-games-editor';
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.authoring.xblock_editor.games.v1': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'games-editor',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: GamesEditor,
          },
        },
      ],
    },
  },
};

export default config;
```

## What this slot does not do

It selects the editor for a block type; it does not put the block in the
**Add component** palette. That remains a separate concern.

## How a claimed block type reaches this editor

Studio's unit page only sends a fixed set of block types to this app's editor.
For every other type it posts an `editXBlock` message, which normally opens the
legacy Studio edit modal inside the iframe.

Registering a plugin for a block type changes that for the unit page: when an
`editXBlock` message arrives for a block whose type has a plugin under any of
the slot's IDs, this app opens its own editor page for the block (and therefore
the plugin) instead of the legacy modal. "Has a plugin" means the slot's
effective config has at least one entry in `plugins`. As in `PluginSlot`
itself, when both the canonical ID and an alias are configured only the last
one counts, and a slot configured with no plugins is treated as unclaimed. Block types with no plugin are
untouched and keep opening the legacy modal. No edx-platform change is needed.

The block type is read from the usage key (`...+type@<blockType>+block@...`),
so this applies to course blocks. See `useMessageHandlers` in
`src/course-unit/xblock-container-iframe/hooks`.
