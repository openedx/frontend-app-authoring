import { Link } from 'react-router-dom';
import { Button, Truncate } from '@openedx/paragon';

interface TitleLinkProps {
  title: string;
  titleLink: string;
  namePrefix: string;
};

const TitleLink = ({
  title,
  titleLink,
  namePrefix,
}: TitleLinkProps) => (
  <Button
    as={Link}
    variant="tertiary"
    data-testid={`${namePrefix}-card-header__title-link`}
    className="item-card-header__title-btn"
    to={titleLink}
  >
    <Truncate.Deprecated lines={1} className={`${namePrefix}-card-title mb-0`}>{title}</Truncate.Deprecated>
  </Button>
);

export default TitleLink;
