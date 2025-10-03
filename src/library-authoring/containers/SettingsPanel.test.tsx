import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { ContainerType } from '@src/generic/key-utils';
import { SettingsPanel } from './SettingsPanel';
import messages from './messages';

const renderWithIntl = (ui: React.ReactNode) => render(
  <IntlProvider locale="en" messages={{}}>
    {ui}
  </IntlProvider>,
);

describe('SettingsPanel', () => {
  describe('Section container', () => {
    test('renders section default info text', () => {
      renderWithIntl(<SettingsPanel containerType={ContainerType.Section} />);
      expect(
        screen.getByText(messages.settingsSectionDefaultText.defaultMessage),
      ).toBeInTheDocument();
    });

    test('does not render grading or results visibility', () => {
      renderWithIntl(<SettingsPanel containerType={ContainerType.Section} />);
      expect(
        screen.queryByText(messages.settingsSectionGradingLabel.defaultMessage),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          messages.settingsSectionAssessmentResultsVisibilityLabel.defaultMessage,
        ),
      ).not.toBeInTheDocument();
    });

    test('renders visibility controls', () => {
      renderWithIntl(<SettingsPanel containerType={ContainerType.Section} />);
      expect(
        screen.getByText(messages.settingsSectionVisibilityLabel.defaultMessage),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: messages.settingsSectionDefaultVisibilityButton.defaultMessage,
        }),
      ).toBeDisabled();
    });
  });

  describe('Subsection container', () => {
    test('renders subsection default info text', () => {
      renderWithIntl(<SettingsPanel containerType={ContainerType.Subsection} />);
      expect(
        screen.getByText(messages.settingsSubSectionDefaultText.defaultMessage),
      ).toBeInTheDocument();
    });

    test('renders grading buttons (disabled)', () => {
      renderWithIntl(<SettingsPanel containerType={ContainerType.Subsection} />);
      expect(
        screen.getByRole('button', {
          name: messages.settingsSectionUpgradeButton.defaultMessage,
        }),
      ).toBeDisabled();
      expect(
        screen.getByRole('button', {
          name: messages.settingsSectionGradeButton.defaultMessage,
        }),
      ).toBeDisabled();
    });

    test('renders visibility + hide content checkbox', () => {
      renderWithIntl(<SettingsPanel containerType={ContainerType.Subsection} />);
      expect(
        screen.getByLabelText(
          messages.settingsSectionHideContentAfterDueDateLabel.defaultMessage,
        ),
      ).toBeDisabled();
    });

    test('renders results visibility controls', () => {
      renderWithIntl(<SettingsPanel containerType={ContainerType.Subsection} />);
      expect(
        screen.getByRole('button', {
          name: messages.settingsSectionShowButton.defaultMessage,
        }),
      ).toBeDisabled();
      expect(
        screen.getByRole('button', {
          name: messages.settingsSectionHideButton.defaultMessage,
        }),
      ).toBeDisabled();
      expect(
        screen.getByLabelText(
          messages.settingsSectionOnlyShowResultsAfterDueDateLabel.defaultMessage,
        ),
      ).toBeDisabled();
    });
  });

  describe('Unit container', () => {
    test('renders unit default info text', () => {
      renderWithIntl(<SettingsPanel containerType={ContainerType.Unit} />);
      expect(
        screen.getByText(messages.settingsUnitDefaultText.defaultMessage),
      ).toBeInTheDocument();
    });

    test('renders discussion settings', () => {
      renderWithIntl(<SettingsPanel containerType={ContainerType.Unit} />);
      expect(
        screen.getByText(messages.settingsSectionDiscussionLabel.defaultMessage),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(
          messages.settingsSectionEnableDiscussionLabel.defaultMessage,
        ),
      ).toBeChecked();
      expect(
        screen.getByText(messages.settingsSectionUnpublishedUnitsLabel.defaultMessage),
      ).toBeInTheDocument();
    });
  });
});
