import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';

const CategoryIndicator = ({ categoryText, displayName }: { categoryText: string, displayName: string }) => {
  const intl = useIntl();
  return (
    <div className="xblock-items-category small text-gray-500">
      <span className="sr-only">
        {intl.formatMessage(messages.moveModalCategoryIndicatorAccessibilityText, {
          categoryText,
          displayName,
        })}
      </span>
      <span
        className="category-text"
        aria-hidden="true"
        data-testid="move-xblock-modal-category"
      >
        {categoryText}
      </span>
    </div>
  );
};

export default CategoryIndicator;
