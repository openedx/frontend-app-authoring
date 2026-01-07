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
  <>
    <div className="mr-2">
      {prefixIcon}
    </div>
    <Button
      as={Link}
      variant="tertiary"
      data-testid={`${namePrefix}-card-header__title-link`}
      className="item-card-header__title-btn align-items-end"
      to={titleLink}
      title={title}
    >
      <span className={`${namePrefix}-card-title mb-0 text-left`}>
        {title}
      </span>
    </Button>
  </>
);

export default TitleLink;
