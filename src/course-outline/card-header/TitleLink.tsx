import { Link } from 'react-router-dom';
import { Button } from '@openedx/paragon';

interface TitleLinkProps {
  title: string;
  titleLink: string;
  namePrefix: string;
  prefixIcon?: React.ReactNode;
}

const TitleLink = ({
  title,
  titleLink,
  namePrefix,
  prefixIcon,
}: TitleLinkProps) => (
  <Button
    as={Link}
    variant="tertiary"
    data-testid={`${namePrefix}-card-header__title-link`}
    className="item-card-header__title-btn align-items-end"
    to={titleLink}
    title={title}
  >
    {prefixIcon}
    <span className={`${namePrefix}-card-title mb-0 truncate-1-line`}>
      {title}
    </span>
  </Button>
);

export default TitleLink;
