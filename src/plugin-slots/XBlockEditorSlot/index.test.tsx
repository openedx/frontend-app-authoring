import React from 'react';
import { render, screen } from '@testing-library/react';
import { mergeConfig } from '@edx/frontend-platform';
import { initializeMocks } from '@src/testUtils';

import XBlockEditorSlot, { xblockEditorSlotId, hasEditorPlugin } from '.';

jest.mock('@openedx/frontend-plugin-framework', () => ({
  // Stand in for the real slot: render children, and expose the id so the
  // per-block-type scoping can be asserted.
  PluginSlot: ({ id, children }: { id: string; children: React.ReactNode; }) => (
    <div data-testid="plugin-slot" data-slot-id={id}>{children}</div>
  ),
}));

const defaultProps = {
  blockType: 'invideoquiz',
  blockId: 'block-v1:org+course+run+type@invideoquiz+block@abc',
  learningContextId: 'course-v1:org+course+run',
  lmsEndpointUrl: 'http://localhost:18000',
  studioEndpointUrl: 'http://localhost:18010',
  onClose: null,
};

describe('XBlockEditorSlot', () => {
  it('renders the default content when no plugin is configured', () => {
    render(
      <XBlockEditorSlot {...defaultProps}>
        <span>default editor</span>
      </XBlockEditorSlot>,
    );
    expect(screen.getByText('default editor')).toBeInTheDocument();
  });

  it('scopes the slot id to the block type', () => {
    render(
      <XBlockEditorSlot {...defaultProps}>
        <span>default editor</span>
      </XBlockEditorSlot>,
    );
    expect(screen.getByTestId('plugin-slot')).toHaveAttribute(
      'data-slot-id',
      'org.openedx.frontend.authoring.xblock_editor.invideoquiz.v1',
    );
  });

  it('gives different block types different slot ids', () => {
    // A shared id would make `keepDefault: false` for one block type remove the
    // built-in editors for every other type too.
    expect(xblockEditorSlotId('invideoquiz')).not.toEqual(xblockEditorSlotId('problem'));
    expect(xblockEditorSlotId('problem')).toEqual(
      'org.openedx.frontend.authoring.xblock_editor.problem.v1',
    );
  });
});

describe('hasEditorPlugin', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('is false when no block type is given', () => {
    expect(hasEditorPlugin(null)).toBe(false);
    expect(hasEditorPlugin(undefined)).toBe(false);
  });

  it('is false when pluginSlots has never been configured at all', () => {
    expect(hasEditorPlugin('invideoquiz')).toBe(false);
  });

  it('is false when pluginSlots has no entry for this block type', () => {
    mergeConfig({ pluginSlots: { some_other_slot: { plugins: [{ op: 'insert', widget: { id: 'x' } }] } } });
    expect(hasEditorPlugin('invideoquiz')).toBe(false);
  });

  it('is false for a slot entry that is explicitly undefined', () => {
    mergeConfig({
      pluginSlots: { 'org.openedx.frontend.authoring.xblock_editor.invideoquiz.v1': undefined },
    });
    expect(hasEditorPlugin('invideoquiz')).toBe(false);
  });

  it('is false for a slot entry with no plugins field at all', () => {
    mergeConfig({
      pluginSlots: {
        'org.openedx.frontend.authoring.xblock_editor.invideoquiz.v1': {},
      },
    });
    expect(hasEditorPlugin('invideoquiz')).toBe(false);
  });

  it('is false for a slot entry with an empty plugins array', () => {
    mergeConfig({
      pluginSlots: {
        'org.openedx.frontend.authoring.xblock_editor.invideoquiz.v1': { plugins: [] },
      },
    });
    expect(hasEditorPlugin('invideoquiz')).toBe(false);
  });

  it('is true once the canonical slot id has at least one plugin', () => {
    mergeConfig({
      pluginSlots: {
        'org.openedx.frontend.authoring.xblock_editor.invideoquiz.v1': {
          plugins: [{ op: 'insert', widget: { id: 'x' } }],
        },
      },
    });
    expect(hasEditorPlugin('invideoquiz')).toBe(true);
  });

  it('is true when the alias slot id is configured instead of the canonical one', () => {
    mergeConfig({
      pluginSlots: {
        xblock_editor_invideoquiz_slot: {
          plugins: [{ op: 'insert', widget: { id: 'x' } }],
        },
      },
    });
    expect(hasEditorPlugin('invideoquiz')).toBe(true);
  });
});
