import React, { useState } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button, ButtonGroup, Form } from '@openedx/paragon';
import { ContainerType } from '@src/generic/key-utils';
import messages from './messages';

import './SettingsPanel.scss';

interface SettingsPanelProps {
  containerType: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ containerType }) => {
  const [grading] = useState('ungraded');
  const [visibility] = useState('default');
  const [resultsVisibility] = useState('show');

  const disableAll = true; // 👈 set to false to re-enable

  return (
    <>
      <div className="pb-2 pl-4 pr-4 space-y-4">
        <p className="text-muted small mb-4">
          { containerType === ContainerType.Section && (
            <FormattedMessage {...messages.settingsSectionDefaultText} />
          )}
          { containerType === ContainerType.Subsection && (
            <FormattedMessage {...messages.settingsSubSectionDefaultText} />
          )}
          { containerType === ContainerType.Unit && (
            <FormattedMessage {...messages.settingsUnitDefaultText} />
          )}
        </p>
      </div>
      <div className="pb-4 pl-4 pr-4 space-y-4">
        {containerType === ContainerType.Subsection && (
        <>
          <h6 className="text-muted small font-weight-bold mb-3">
            <FormattedMessage {...messages.settingsSectionGradingLabel} />
          </h6>
          <ButtonGroup className="d-flex w-100 mb-4.5">
            <Button
              className="flex-fill"
              variant={grading === 'ungraded' ? 'dark' : 'outline-secondary'}
              size="sm"
              disabled={disableAll}
            >
              <FormattedMessage {...messages.settingsSectionUpgradeButton} />
            </Button>
            <Button
              className="flex-fill"
              variant={grading === 'graded' ? 'dark' : 'outline-secondary'}
              size="sm"
              disabled={disableAll}
            >
              <FormattedMessage {...messages.settingsSectionGradeButton} />
            </Button>
          </ButtonGroup>
        </>
        )}

        <h6 className="text-muted small font-weight-bold mt-3 mb-3">
          <FormattedMessage {...messages.settingsSectionVisibilityLabel} />
        </h6>
        <ButtonGroup className="d-flex w-100">
          <Button
            className="flex-fill"
            variant={visibility === 'default' ? 'dark' : 'outline-secondary'}
            size="sm"
            disabled={disableAll}
          >
            <FormattedMessage {...messages.settingsSectionDefaultVisibilityButton} />
          </Button>
          <Button
            className="flex-fill"
            variant={visibility === 'staff' ? 'dark' : 'outline-secondary'}
            size="sm"
            disabled={disableAll}
          >
            <FormattedMessage {...messages.settingsSectionStaffOnlyButton} />
          </Button>
        </ButtonGroup>
        {containerType === ContainerType.Subsection && (
          <Form.Checkbox className="mt-3 text-muted mb-4.5" disabled>
            <FormattedMessage {...messages.settingsSectionHideContentAfterDueDateLabel} />
          </Form.Checkbox>
        )}

        {containerType === ContainerType.Subsection && (
          <>
            <h6 className="text-muted small font-weight-bold mt-1 mb-3">
              <FormattedMessage {...messages.settingsSectionAssessmentResultsVisibilityLabel} />
            </h6>
            <ButtonGroup className="d-flex w-100">
              <Button
                className="flex-fill"
                variant={resultsVisibility === 'show' ? 'dark' : 'outline-secondary'}
                size="sm"
                disabled={disableAll}
              >
                <FormattedMessage {...messages.settingsSectionShowButton} />
              </Button>
              <Button
                className="flex-fill"
                variant={resultsVisibility === 'hide' ? 'dark' : 'outline-secondary'}
                size="sm"
                disabled={disableAll}
              >
                <FormattedMessage {...messages.settingsSectionHideButton} />
              </Button>
            </ButtonGroup>
            <Form.Checkbox className="mt-3 text-muted mb-4.5" disabled>
              <FormattedMessage {...messages.settingsSectionOnlyShowResultsAfterDueDateLabel} />
            </Form.Checkbox>
          </>
        )}
        {containerType === ContainerType.Unit && (
          <>
            <h6 className="text-muted small font-weight-bold mt-3 mb-3">
              <FormattedMessage {...messages.settingsSectionDiscussionLabel} />
            </h6>
            <Form.Checkbox className="mt-3 text-muted" disabled checked>
              <FormattedMessage {...messages.settingsSectionEnableDiscussionLabel} />
            </Form.Checkbox>
            <p className="text-muted small mb-4 text-muted-override">
              <FormattedMessage {...messages.settingsSectionUnpublishedUnitsLabel} />
            </p>
          </>
        )}
      </div>
    </>
  );
};
