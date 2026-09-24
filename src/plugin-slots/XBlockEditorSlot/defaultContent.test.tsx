import React from 'react';
import { fireEvent, initializeMocks, render, screen } from '@src/testUtils';

import XBlockEditorSlot from '.';

/**
 * Uses the real PluginSlot (index.test.tsx stubs it), because the behaviour
 * under test is the framework's: it merges `pluginProps` into the props of the
 * slot's default child, and combines two function props into one wrapper that
 * calls both and returns nothing.
 */
const DefaultEditor = ({ onClose, returnFunction }: {
  onClose: () => void;
  returnFunction: () => (result: string) => void;
}) => (
  <>
    <button type="button" onClick={() => onClose()}>close</button>
    <button type="button" onClick={() => returnFunction()('saved')}>save</button>
  </>
);

describe('XBlockEditorSlot default content', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('hands the built-in editor its own props, untouched by pluginProps', () => {
    const onClose = jest.fn();
    const afterSave = jest.fn();
    const returnFunction = jest.fn(() => afterSave);
    render(
      <XBlockEditorSlot
        blockType="html"
        blockId={null}
        learningContextId="lib:org:lib"
        lmsEndpointUrl={null}
        studioEndpointUrl={null}
        onClose={onClose}
        returnFunction={returnFunction}
      >
        <DefaultEditor onClose={onClose} returnFunction={returnFunction} />
      </XBlockEditorSlot>,
    );

    // `returnFunction` is curried; a merged wrapper would return undefined.
    fireEvent.click(screen.getByRole('button', { name: 'save' }));
    expect(afterSave).toHaveBeenCalledWith('saved');
    expect(returnFunction).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
