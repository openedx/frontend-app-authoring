import React from 'react';
import { render, screen } from '@testing-library/react';

import XBlockEditorSlot, { xblockEditorSlotId } from '.';

jest.mock('@openedx/frontend-plugin-framework', () => ({
  // Stand in for the real slot: render children, and expose the id so the
  // per-block-type scoping can be asserted.
  PluginSlot: ({ id, children }: { id: string; children: React.ReactNode; }) => (
    <div data-testid="plugin-slot" data-slot-id={id}>{children}</div>
  ),
}));

const defaultProps = {
  blockType: 'games',
  blockId: 'block-v1:org+course+run+type@games+block@abc',
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
      'org.openedx.frontend.authoring.xblock_editor.games.v1',
    );
  });

  it('gives different block types different slot ids', () => {
    // A shared id would make `keepDefault: false` for one block type remove the
    // built-in editors for every other type too.
    expect(xblockEditorSlotId('games')).not.toEqual(xblockEditorSlotId('problem'));
    expect(xblockEditorSlotId('problem')).toEqual(
      'org.openedx.frontend.authoring.xblock_editor.problem.v1',
    );
  });
});
