import { ComponentProps, useState } from 'react';
import { Avatar, Stack } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { LibraryPublishContributor } from '@src/library-authoring/data/api';
import messages from './messages';

const MAX_VISIBLE_CONTRIBUTORS = 5;

interface ContributorAvatarProps {
  username?: string;
  src?: string;
  className: string;
  size: ComponentProps<typeof Avatar>['size'];
}

interface ContributorsAvatarsProps {
  contributors: LibraryPublishContributor[];
}

export const ContributorAvatar = ({
  username,
  src,
  className,
  size,
}: ContributorAvatarProps) => {
  const intl = useIntl();
  const [imgError, setImgError] = useState(false);
  return (
    <Avatar
      className={className}
      size={size}
      src={imgError ? undefined : src}
      alt={username || intl.formatMessage(messages.historyEntryDefaultUser)}
      onError={() => setImgError(true)}
    />
  );
};

export const ContributorsAvatars = ({ contributors }: ContributorsAvatarsProps) => {
  const visible = contributors.slice(0, MAX_VISIBLE_CONTRIBUTORS);
  return (
    <Stack direction="horizontal" gap={2} className="ml-4.5">
      <div className="contributors-avatars">
        {visible.map(({ username, profileImageUrls }) => (
          <ContributorAvatar
            key={username}
            size="xs"
            className="contributors-avatar"
            username={username}
            src={profileImageUrls.small}
          />
        ))}
      </div>
      <span className="small">
        <FormattedMessage
          {...messages.historyContributors}
          values={{ count: contributors.length }}
        />
      </span>
    </Stack>
  );
};
