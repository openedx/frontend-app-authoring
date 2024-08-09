import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { actions } from '../../../../../../data/redux';
import { LicenseTypes } from '../../../../../../data/constants/licenses';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './hooks';
import messages from './messages';

jest.mock('../../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: jest.fn(args => ({ updateField: args })).mockName('actions.video.updateField'),
    },
  },
}));

describe('VideoEditorTranscript hooks', () => {
  describe('determineLicense', () => {
    const courseLicenseProps = {
      isLibrary: false,
      licenseType: '',
      licenseDetails: {},
      courseLicenseType: 'sOMEliCENse',
      courseLicenseDetails: {},
    };
    const libraryLicenseProps = {
      isLibrary: true,
      licenseType: 'sOMEliCENse',
      licenseDetails: {},
      courseLicenseType: '',
      courseLicenseDetails: {},
    };
    const blockLicenseProps = {
      isLibrary: false,
      licenseType: 'sOMEliCENse',
      licenseDetails: {},
      courseLicenseType: '',
      courseLicenseDetails: {},
    };
    it('returns expected license, details and level for course set license', () => {
      expect(module.determineLicense(courseLicenseProps)).toEqual({
        license: 'sOMEliCENse',
        details: {},
        level: 'course',
      });
    });
    it('returns expected license, details and level for library set license', () => {
      expect(module.determineLicense(libraryLicenseProps)).toEqual({
        license: 'sOMEliCENse',
        details: {},
        level: 'library',
      });
    });
    it('returns expected license, details and level for block set license', () => {
      expect(module.determineLicense(blockLicenseProps)).toEqual({
        license: 'sOMEliCENse',
        details: {},
        level: 'block',
      });
    });
  });
  describe('determineText', () => {
    it('returns expected level and license description for course level', () => {
      expect(module.determineText({ level: 'course' })).toEqual({
        levelDescription: <FormattedMessage {...messages.courseLevelDescription} />,
        licenseDescription: <FormattedMessage {...messages.courseLicenseDescription} />,
      });
    });
    it('returns expected level and license description for library level', () => {
      expect(module.determineText({ level: 'library' })).toEqual({
        levelDescription: <FormattedMessage {...messages.libraryLevelDescription} />,
        licenseDescription: <FormattedMessage {...messages.libraryLicenseDescription} />,
      });
    });
    it('returns expected level and license description for library level', () => {
      expect(module.determineText({ level: 'default' })).toEqual({
        levelDescription: <FormattedMessage {...messages.defaultLevelDescription} />,
        licenseDescription: <FormattedMessage {...messages.defaultLicenseDescription} />,
      });
    });
  });
  describe('onSelectLicense', () => {
    // const mockEvent = { target: { value: mockLangValue } };
    const mockDispatch = jest.fn();
    test('it dispatches the correct thunk for all rights reserved', () => {
      const mockLicenseValue = 'all-rights-reserved';
      const callBack = module.onSelectLicense({ dispatch: mockDispatch });
      callBack(mockLicenseValue);
      expect(actions.video.updateField).toHaveBeenCalledWith({
        licenseType: LicenseTypes.allRightsReserved,
        licenseDetails: {},
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        updateField: {
          licenseType: LicenseTypes.allRightsReserved,
          licenseDetails: {},
        },
      });
    });
    test('it dispatches the correct thunk for creative commons', () => {
      const mockLicenseValue = 'creative-commons';
      const callBack = module.onSelectLicense({ dispatch: mockDispatch });
      callBack(mockLicenseValue);
      expect(actions.video.updateField).toHaveBeenCalledWith({
        licenseType: LicenseTypes.creativeCommons,
        licenseDetails: {
          attribution: true,
          noncommercial: true,
          noDerivatives: true,
          shareAlike: false,
        },
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        updateField: {
          licenseType: LicenseTypes.creativeCommons,
          licenseDetails: {
            attribution: true,
            noncommercial: true,
            noDerivatives: true,
            shareAlike: false,
          },
        },
      });
    });
    test('it dispatches the correct thunk for no license type', () => {
      const mockLicenseValue = 'sOMEliCENse';
      const callBack = module.onSelectLicense({ dispatch: mockDispatch });
      callBack(mockLicenseValue);
      expect(actions.video.updateField).toHaveBeenCalledWith({ licenseType: LicenseTypes.select });
      expect(mockDispatch).toHaveBeenCalledWith({ updateField: { licenseType: LicenseTypes.select } });
    });
  });
});
