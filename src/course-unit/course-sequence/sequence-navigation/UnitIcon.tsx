import { type FC } from 'react';
import { Icon } from '@openedx/paragon';
import { BookOpen as BookOpenIcon } from '@openedx/paragon/icons';

import { UNIT_TYPE_ICONS_MAP } from '@src/generic/block-type-utils/constants';

interface Props {
  type: keyof typeof UNIT_TYPE_ICONS_MAP;
}

const UnitIcon: FC<Props> = ({ type }) => {
  const icon = UNIT_TYPE_ICONS_MAP[type] || BookOpenIcon;

  return <Icon src={icon} screenReaderText={type} />;
};

export default UnitIcon;
