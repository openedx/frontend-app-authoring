import { useEffect } from 'react';
import { MockUseState } from '../../../testUtils';

// import tinyMCE from '../../data/constants/tinyMCE';
import { keyStore } from '../../utils';
import pluginConfig from '../TextEditor/pluginConfig';
import * as module from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  createRef: jest.fn(val => ({ ref: val })),
  useRef: jest.fn(val => ({ current: val })),
  useEffect: jest.fn(),
  useCallback: (cb, prereqs) => ({ cb, prereqs }),
}));

const state = new MockUseState(module);
const moduleKeys = keyStore(module);

let hook;
let output;

describe('Problem editor hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('state hooks', () => {
    state.testGetter(state.keys.refReady);
  });

  describe('non-state hooks', () => {
    beforeEach(() => { state.mock(); });
    afterEach(() => { state.restore(); });

    describe('setupCustomBehavior', () => {
      test('It calls addButton and addToggleButton in the editor, but openModal is not called', () => {
        const addButton = jest.fn();
        const addIcon = jest.fn();
        const updateQuestion = jest.fn();
        const editor = {
          ui: { registry: { addButton, addIcon } },
          on: jest.fn(),
        };
        const toggleLabelFormatting = expect.any(Function);
        output = module.setupCustomBehavior({ updateQuestion })(editor);
        expect(addIcon.mock.calls).toEqual([['textToSpeech',
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 22C3.08333 22 2.72917 21.8542 2.4375 21.5625C2.14583 21.2708 2 20.9167 2 20.5V3.5C2 3.08333 2.14583 2.72917 2.4375 2.4375C2.72917 2.14583 3.08333 2 3.5 2H13L11.5 3.5H3.5V20.5H15.5V17H17V20.5C17 20.9167 16.8542 21.2708 16.5625 21.5625C16.2708 21.8542 15.9167 22 15.5 22H3.5ZM6 17.75V16.25H13V17.75H6ZM6 14.75V13.25H11V14.75H6ZM15.5 15L11.5 11H8V6H11.5L15.5 2V15ZM17 12.7V4.05C17.9333 4.4 18.6667 5.01667 19.2 5.9C19.7333 6.78333 20 7.65 20 8.5C20 9.35 19.7083 10.1917 19.125 11.025C18.5417 11.8583 17.8333 12.4167 17 12.7ZM17 16.25V14.7C18.1667 14.2833 19.2083 13.5333 20.125 12.45C21.0417 11.3667 21.5 10.05 21.5 8.5C21.5 6.95 21.0417 5.63333 20.125 4.55C19.2083 3.46667 18.1667 2.71667 17 2.3V0.75C18.7 1.2 20.125 2.1375 21.275 3.5625C22.425 4.9875 23 6.63333 23 8.5C23 10.3667 22.425 12.0125 21.275 13.4375C20.125 14.8625 18.7 15.8 17 16.25Z" fill="black"/></svg>',
        ]]);
        expect(addButton.mock.calls).toEqual([
          ['customLabelButton', {
            icon: 'textToSpeech',
            text: 'Label',
            tooltip: 'Apply a "Question" label to specific text, recognized by screen readers. Recommended to improve accessibility.',
            onAction: toggleLabelFormatting,
          }],
        ]);
      });
    });

    describe('parseContentForLabels', () => {
      test('it calls getContent and updateQuestion for some content', () => {
        const editor = { getContent: jest.fn(() => '<p><label>Some question label</label></p><p>some content <label>around a label</label> followed by more text</p><img src="/static/soMEImagEURl1.jpeg"/>') };
        const updateQuestion = jest.fn();
        const content = '<p><label>Some question label</label></p><p>some content </p><p><label>around a label</label></p><p> followed by more text</p><img src="/static/soMEImagEURl1.jpeg"/>';
        module.parseContentForLabels({ editor, updateQuestion });
        expect(editor.getContent).toHaveBeenCalled();
        expect(updateQuestion).toHaveBeenCalledWith(content);
      });
      test('it calls getContent and updateQuestion for empty content', () => {
        const editor = { getContent: jest.fn(() => '') };
        const updateQuestion = jest.fn();
        const content = '';
        module.parseContentForLabels({ editor, updateQuestion });
        expect(editor.getContent).toHaveBeenCalled();
        expect(updateQuestion).toHaveBeenCalledWith(content);
      });
    });

    describe('problemEditorConfig', () => {
      const props = {
        question: '',
      };
      const evt = 'fakeEvent';
      const editor = 'myEditor';
      const setupCustomBehavior = args => ({ setupCustomBehavior: args });
      beforeEach(() => {
        props.setEditorRef = jest.fn();
        props.updateQuestion = jest.fn();
        jest.spyOn(module, moduleKeys.setupCustomBehavior)
          .mockImplementationOnce(setupCustomBehavior);
        output = module.problemEditorConfig(props);
      });
      test('It creates an onInit which calls setEditorRef', () => {
        output.onInit(evt, editor);
        expect(props.setEditorRef).toHaveBeenCalledWith(editor);
      });
      test('It sets the blockvalue to be empty string by default', () => {
        expect(output.initialValue).toBe('');
      });
      test('It sets the blockvalue to be the blockvalue if nonempty', () => {
        const questionText = 'SomE hTML content';
        output = module.problemEditorConfig({ ...props, question: questionText });
        expect(output.initialValue).toBe(questionText);
      });
      test('It configures plugins and toolbars correctly', () => {
        expect(output.init.plugins).toEqual('autoresize');
        expect(output.init.toolbar).toEqual(`${pluginConfig().toolbar} | customLabelButton`);
      });

      it('calls setupCustomBehavior on setup', () => {
        expect(output.init.setup).toEqual(
          setupCustomBehavior({
            updateQuestion: props.updateQuestion,
          }),
        );
      });
    });

    describe('prepareEditorRef', () => {
      beforeEach(() => {
        hook = module.prepareEditorRef();
      });
      const key = state.keys.refReady;
      test('sets refReady to false by default, ref is null', () => {
        expect(state.stateVals[key]).toEqual(false);
        expect(hook.editorRef.current).toBe(null);
      });
      test('when useEffect triggers, refReady is set to true', () => {
        expect(state.setState[key]).not.toHaveBeenCalled();
        const [cb, prereqs] = useEffect.mock.calls[0];
        expect(prereqs).toStrictEqual([state.setState[key]]);
        cb();
        expect(state.setState[key]).toHaveBeenCalledWith(true);
      });
      test('calling setEditorRef sets the ref value', () => {
        const fakeEditor = { editor: 'faKe Editor' };
        expect(hook.editorRef.current).not.toBe(fakeEditor);
        hook.setEditorRef.cb(fakeEditor);
        expect(hook.editorRef.current).toBe(fakeEditor);
      });
    });
  });
});
