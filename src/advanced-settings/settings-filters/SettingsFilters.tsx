import { Button, Icon, SearchField } from '@openedx/paragon';
import { OpenInFull, CloseFullscreen } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

interface SettingsFiltersProps {
  filterText: string;
  onFilterChange: (value: string) => void;
  showDeprecated: boolean;
  onDeprecatedChange: (value: boolean) => void;
  expandAll: boolean;
  onExpandAllChange: (value: boolean) => void;
}

const SettingsFilters = ({
  filterText,
  onFilterChange,
  showDeprecated,
  onDeprecatedChange,
  expandAll,
  onExpandAllChange,
}: SettingsFiltersProps) => {
  const intl = useIntl();

  return (
    <div className="settings-filters d-flex align-items-center gap-3 mb-4">
      <div className="settings-filters-search">
        <SearchField
          onSubmit={onFilterChange}
          onChange={onFilterChange}
          onClear={() => onFilterChange('')}
          value={filterText}
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
          screenReaderText={{
            label: intl.formatMessage(messages.searchLabel),
            submitButton: intl.formatMessage(messages.searchSubmitButton),
          }}
          size="sm"
        />
      </div>
      <Button
        variant="outline-primary"
        onClick={() => onExpandAllChange(!expandAll)}
      >
        <Icon src={expandAll ? CloseFullscreen : OpenInFull} className="mr-1" />
        {expandAll ? intl.formatMessage(messages.collapseAll) : intl.formatMessage(messages.expandAll)}
      </Button>
      <Button
        variant={showDeprecated ? 'outline-brand' : 'outline-primary'}
        onClick={() => onDeprecatedChange(!showDeprecated)}
      >
        {showDeprecated ? intl.formatMessage(messages.hideDeprecated) : intl.formatMessage(messages.showDeprecated)}
      </Button>
    </div>
  );
};

export default SettingsFilters;
