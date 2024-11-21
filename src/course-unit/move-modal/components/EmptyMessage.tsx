import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';

const EmptyMessage = ({ category, categoryText }: { category: string, categoryText: string }) => {
  const intl = useIntl();
  return (
    <li className="xblock-no-child-message">
      {intl.formatMessage(messages.moveModalEmptyCategoryText, {
        category,
        categoryText: categoryText.toLowerCase(),
      })}
    </li>
  );
};

export default EmptyMessage;
