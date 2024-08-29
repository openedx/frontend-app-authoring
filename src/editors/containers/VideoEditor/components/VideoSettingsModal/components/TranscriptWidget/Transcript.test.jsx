import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import * as module from './Transcript';

import { MockUseState } from '../../../../../../testUtils';

const Transcript = module.TranscriptInternal;

jest.mock('./LanguageSelector', () => 'LanguageSelector');
jest.mock('./TranscriptActionMenu', () => 'TranscriptActionMenu');

describe('Transcript Component', () => {
  describe('state hooks', () => {
    const state = new MockUseState(module.hooks);

    beforeEach(() => {
      jest.clearAllMocks();
    });
    describe('state hooks', () => {
      state.testGetter(state.keys.inDeleteConfirmation);
    });

    describe('setUpDeleteConfirmation hook', () => {
      beforeEach(() => {
        state.mock();
      });
      afterEach(() => {
        state.restore();
      });
      test('inDeleteConfirmation: state values', () => {
        expect(module.hooks.setUpDeleteConfirmation().inDeleteConfirmation).toEqual(false);
      });
      test('inDeleteConfirmation setters: launch', () => {
        module.hooks.setUpDeleteConfirmation().launchDeleteConfirmation();
        expect(state.setState[state.keys.inDeleteConfirmation]).toHaveBeenCalledWith(true);
      });
      test('inDeleteConfirmation setters: cancel', () => {
        module.hooks.setUpDeleteConfirmation().cancelDelete();
        expect(state.setState[state.keys.inDeleteConfirmation]).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('component', () => {
    describe('component', () => {
      const props = {
        index: 'sOmenUmBer',
        language: 'lAnG',
        deleteTranscript: jest.fn().mockName('thunkActions.video.deleteTranscript'),
      };
      afterAll(() => {
        jest.clearAllMocks();
      });
      test('snapshots: renders as expected with default props: dont show confirm delete', () => {
        jest.spyOn(module.hooks, 'setUpDeleteConfirmation').mockImplementationOnce(() => ({
          inDeleteConfirmation: false,
          launchDeleteConfirmation: jest.fn().mockName('launchDeleteConfirmation'),
          cancelDelete: jest.fn().mockName('cancelDelete'),
        }));
        expect(
          shallow(<Transcript {...props} />).snapshot,
        ).toMatchSnapshot();
      });
      test('snapshots: renders as expected with default props: dont show confirm delete, language is blank so delete is shown instead of action menu', () => {
        jest.spyOn(module.hooks, 'setUpDeleteConfirmation').mockImplementationOnce(() => ({
          inDeleteConfirmation: false,
          launchDeleteConfirmation: jest.fn().mockName('launchDeleteConfirmation'),
          cancelDelete: jest.fn().mockName('cancelDelete'),
        }));
        expect(
          shallow(<Transcript {...props} language="" />).snapshot,
        ).toMatchSnapshot();
      });
      test('snapshots: renders as expected with default props: show confirm delete', () => {
        jest.spyOn(module.hooks, 'setUpDeleteConfirmation').mockImplementationOnce(() => ({
          inDeleteConfirmation: true,
          launchDeleteConfirmation: jest.fn().mockName('launchDeleteConfirmation'),
          cancelDelete: jest.fn().mockName('cancelDelete'),
        }));
        expect(
          shallow(<Transcript {...props} />).snapshot,
        ).toMatchSnapshot();
      });
      test('snapshots: renders as expected with transcriptUrl', () => {
        jest.spyOn(module.hooks, 'setUpDeleteConfirmation').mockImplementationOnce(() => ({
          inDeleteConfirmation: false,
          launchDeleteConfirmation: jest.fn().mockName('launchDeleteConfirmation'),
          cancelDelete: jest.fn().mockName('cancelDelete'),
        }));
        expect(
          shallow(<Transcript {...props} transcriptUrl="url" />).snapshot,
        ).toMatchSnapshot();
      });
    });
  });
});
