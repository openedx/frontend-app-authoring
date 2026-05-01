import {
  Button,
  SearchField,
  Stack,
} from '@openedx/paragon';
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
    <Stack direction="horizontal" gap={3} className="flex-wrap align-items-center mb-4">
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
      <Button
        variant="outline-primary"
        iconBefore={expandAll ? CloseFullscreen : OpenInFull}
        onClick={() => onExpandAllChange(!expandAll)}
      >
        {expandAll ? intl.formatMessage(messages.collapseAll) : intl.formatMessage(messages.expandAll)}
      </Button>
      <Button
        variant={showDeprecated ? 'outline-brand' : 'outline-primary'}
        onClick={() => onDeprecatedChange(!showDeprecated)}
      >
        {showDeprecated ? intl.formatMessage(messages.hideDeprecated) : intl.formatMessage(messages.showDeprecated)}
      </Button>
    </Stack>
  );
};

export default SettingsFilters;
