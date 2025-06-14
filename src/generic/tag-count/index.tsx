import { Button, Icon, Stack } from '@openedx/paragon';
import { Tag } from '@openedx/paragon/icons';
import classNames from 'classnames';

type TagCountProps = {
  count: number;
  onClick?: () => void;
  size?: Parameters<typeof Icon>[0]['size'];
  dataTestId?: string;
};

// eslint-disable-next-line react/prop-types
const TagCount: React.FC<TagCountProps> = ({
  count,
  onClick,
  size,
  dataTestId,
}: TagCountProps) => {
  const renderContent = () => (
    <Stack direction="horizontal" gap={1}>
      <Icon size={size} src={Tag} />
      {count}
    </Stack>
  );

  return (
    <div className={
      classNames('generic-tag-count d-flex', { 'zero-count': count === 0 })
    }
    >
      { onClick ? (
        <Button variant="tertiary" onClick={onClick} data-testid={dataTestId}>
          {renderContent()}
        </Button>
      )
        : renderContent()}
    </div>
  );
};

export default TagCount;
