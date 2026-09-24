import React from 'react';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import type { EditorComponent } from '@src/editors/EditorComponent';

export interface XBlockEditorSlotProps extends EditorComponent {
  /** XBlock type being edited, e.g. `html`, `problem`, `games`. */
  blockType: string;
  /** Usage key of the block, or null when creating one. */
  blockId: string | null;
  learningContextId: string | null;
  lmsEndpointUrl: string | null;
  studioEndpointUrl: string | null;
  /** Whatever this app would render for `blockType` without a plugin. */
  children: React.ReactNode;
}

/**
 * Slot ID for a given block type.
 *
 * The ID is per-block-type on purpose. A single shared ID would force
 * `keepDefault: false` to apply to *every* block type at once, so an operator
 * adding an editor for one block would silently remove the built-in editors for
 * all the others. Scoping the ID means a plugin claims exactly the block type it
 * names, and every other type keeps whatever this app renders by default.
 */
export const xblockEditorSlotId = (blockType: string) => (
  `org.openedx.frontend.authoring.xblock_editor.${blockType}.v1`
);

/** Shorter IDs the slot also answers to (see README, "Slot ID Aliases"). */
export const xblockEditorSlotAliases = (blockType: string) => [
  `xblock_editor_${blockType}_slot`,
];

/**
 * Every ID a plugin may register under to claim this block type's editor.
 * Anything that decides "is there a plugin for this block type?" should check
 * all of these, the same way `PluginSlot` treats `id` and `idAliases` alike.
 */
export const xblockEditorSlotIds = (blockType: string) => [
  xblockEditorSlotId(blockType),
  ...xblockEditorSlotAliases(blockType),
];

/**
 * Holds the default content so that `PluginSlot` has something harmless to
 * write on. The framework merges `pluginProps` into the props of the slot's
 * direct child, and where both sides have a function it substitutes a wrapper
 * that calls the two and returns nothing. Applied to a built-in editor that
 * would call `onClose` twice and break `returnFunction`, which is curried
 * (`returnFunction()(result)`). Here the merged props land on this component,
 * which ignores them, and the editor inside keeps exactly the props it was given.
 */
const DefaultContent = ({ content }: { content: React.ReactNode; }) => <>{content}</>;

/**
 * Lets an out-of-tree plugin supply the authoring UI for an XBlock type.
 *
 * The default content is this app's existing behaviour: a built-in editor from
 * `supportedEditors` when one exists, otherwise `AdvancedEditor`. A plugin that
 * targets this slot with `keepDefault: false` replaces it.
 *
 * Plugins are ordinary React components running inside this app's bundle, so
 * they share its React, Paragon and `@edx/frontend-platform` instances and may
 * import app internals through the `CourseAuthoring` alias.
 */
const XBlockEditorSlot = ({
  blockType,
  blockId,
  learningContextId,
  lmsEndpointUrl,
  studioEndpointUrl,
  onClose,
  returnFunction,
  extraProps,
  children,
}: XBlockEditorSlotProps) => (
  <PluginSlot
    id={xblockEditorSlotId(blockType)}
    idAliases={xblockEditorSlotAliases(blockType)}
    pluginProps={{
      blockType,
      blockId,
      learningContextId,
      lmsEndpointUrl,
      studioEndpointUrl,
      onClose,
      returnFunction,
      extraProps,
    }}
  >
    <DefaultContent content={children} />
  </PluginSlot>
);

export default XBlockEditorSlot;
