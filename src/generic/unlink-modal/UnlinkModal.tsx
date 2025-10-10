import {
  ActionRow,
  Button,
  AlertModal,
} from '@openedx/paragon';
import { Warning } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { BoldText } from '@src/utils';

import messages from './messages';
import LoadingButton from '../loading-button';

type UnlinkModalPropsContainer = {
  displayName?: string;
  category?: string;
};

type UnlinkModalPropsComponent = {
  displayName?: undefined;
  category: 'component';
};

type UnlinkModalProps = {
  isOpen: boolean;
  close: () => void;
  onUnlinkSubmit: () => void | Promise<void>,
} & (UnlinkModalPropsContainer | UnlinkModalPropsComponent);

export const UnlinkModal = ({
  displayName,
  category,
  isOpen,
  close,
  onUnlinkSubmit,
}: UnlinkModalProps) => {
  const intl = useIntl();
  if (!category) {
    // On the first render, the initial value for `category` might be undefined.
    return null;
  }

  const isComponent = category === 'component' as const;

  const categoryName = intl.formatMessage(messages[`${category}Name` as keyof typeof messages]);
  const childrenCategoryName = !isComponent
    ? intl.formatMessage(messages[`${category}ChildrenName` as keyof typeof messages])
    : undefined;
  const modalTitle = !isComponent
    ? intl.formatMessage(messages.title, { displayName })
    : intl.formatMessage(messages.titleComponent);
  const modalDescription = intl.formatMessage(messages.description, {
    categoryName,
    b: BoldText,
  });
  const modalDescriptionChildren = !isComponent ? intl.formatMessage(messages.descriptionChildren, {
    categoryName,
    childrenCategoryName,
  }) : null;

  return (
    <AlertModal
      title={modalTitle}
      isOpen={isOpen}
      onClose={close}
      variant="warning"
      icon={Warning}
      footerNode={(
        <ActionRow>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              close();
            }}
            variant="tertiary"
          >
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <LoadingButton
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await onUnlinkSubmit();
            }}
            variant="primary"
            label={intl.formatMessage(messages.unlinkButton)}
          />
        </ActionRow>
      )}
    >
      <div>
        <p className="mt-2">{modalDescription}</p>
        <p>{modalDescriptionChildren}</p>
      </div>
    </AlertModal>
  );
};
