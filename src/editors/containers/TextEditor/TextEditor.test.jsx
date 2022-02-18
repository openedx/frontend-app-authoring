import React from 'react';
import { render, screen } from '@testing-library/react';
import TextEditor from './TextEditor';
import EditorPageContext from '../EditorPageContext';
import { ActionStates } from '../data/constants';

// Per https://github.com/tinymce/tinymce-react/issues/91 React unit testing in JSDOM is not supported by tinymce.
// Consequently, mock the Editor out.
const mockRole = 'Tiny-MCE-Mock';
jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: () => <div role={mockRole} />
    ,
  };
});

test('Loading State:', () => {
  const context = {
    blockValue: null,
    blockError: null,
    blockLoading: ActionStates.IN_PROGRESS,
    editorRef: null,
  };
  render(
    <EditorPageContext.Provider value={context}>
      <TextEditor />
    </EditorPageContext.Provider>,
  );
  expect(screen.queryByRole(mockRole)).not.toBeTruthy();
});
test('Loaded State-- No Error', () => {
  const htmltext = 'Im baby palo santo ugh celiac fashion axe. La croix lo-fi venmo whatever. Beard man braid migas single-origin coffee forage ramps.';
  const context = {
    blockValue:
      {
        data:
      { data: { htmltext } },
      },
    blockError: null,
    blockLoading: ActionStates.FINISHED,
  };
  render(
    <EditorPageContext.Provider value={context}>
      <TextEditor />
    </EditorPageContext.Provider>,
  );
  expect(screen.findByRole(mockRole)).toBeTruthy();
});
