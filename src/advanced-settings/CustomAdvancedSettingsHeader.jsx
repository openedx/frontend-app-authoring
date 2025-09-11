/* eslint-disable react/prop-types */
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import SubHeader from '../generic/sub-header/SubHeader';
import WarningMessage from '../generic/warning-message/WarningMessage';

const CustomAdvancedSettingsHeader = (props) => (
  <div className="advanced-settings-custom-header">
    <div className="advanced-settings-custom-sub-header">
      <div className="advanced-settings-custom-sub-header-title">
        <SubHeader
          title={props.headerTitle}
          contentTitle={props.headerContentTitle}
        />
      </div>

      <div className="custom-setting-items-deprecated-setting">
        <Button
          variant="outline-primary"
          onClick={() => props.onClick()}
          size="sm"
        >
          <FormattedMessage
            id="course-authoring.advanced-settings.deprecated.button.text"
            defaultMessage="{visibility} deprecated settings"
            values={{
              visibility: props.showDeprecated ? props.hideDeprecatedMessage : props.showDeprecatedMessage,
            }}
          />
        </Button>
      </div>
    </div>

    <hr className="customHr" />

    <div className="warning-message-container">
      <WarningMessage message="Do not modify these policies unless you are familiar with their purpose." />
    </div>
  </div>
);

export default CustomAdvancedSettingsHeader;
