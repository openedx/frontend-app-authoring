import {
  Image,
  Icon,
  Stack,
  IconButtonWithTooltip,
} from '@openedx/paragon';
import {
  EditOutline as EditOutlineIcon,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import commonMessages from '../../messages';
import messages from '../messages';

interface SignatoryProps {
  name: string;
  title: string;
  organization: string;
  signatureImagePath: string;
  index: number;
  handleEdit: () => void;
}

const Signatory = ({
  index,
  name,
  title,
  organization,
  signatureImagePath,
  handleEdit,
}: SignatoryProps) => {
  const intl = useIntl();

  return (
    <div className="bg-light-200 p-2.5 signatory" data-testid="signatory">
      <Stack className="signatory__header" gap={3}>
        <h3 className="section-title m-0">{`${intl.formatMessage(messages.signatoryTitle)} ${index + 1}`}</h3>
        <Stack className="signatory__text-fields-stack">
          <p className="signatory__text">
            <b>{intl.formatMessage(messages.nameLabel)}</b> {name}
          </p>
          <p className="signatory__text">
            <b>{intl.formatMessage(messages.titleLabel)}</b> {title}
          </p>
          <p className="signatory__text">
            <b>{intl.formatMessage(messages.organizationLabel)}</b> {organization}
          </p>
        </Stack>
      </Stack>

      <IconButtonWithTooltip
        className="signatory__action-button"
        src={EditOutlineIcon}
        iconAs={Icon}
        alt={intl.formatMessage(commonMessages.editTooltip)}
        tooltipContent={<div>{intl.formatMessage(commonMessages.editTooltip)}</div>}
        onClick={handleEdit}
      />
      <div className="signatory__image-container">
        {signatureImagePath && (
          <Image
            src={`${getConfig().STUDIO_BASE_URL}${signatureImagePath}`}
            fluid
            alt={intl.formatMessage(messages.imageLabel)}
            className="signatory__image"
          />
        )}
      </div>
    </div>
  );
};

export default Signatory;
