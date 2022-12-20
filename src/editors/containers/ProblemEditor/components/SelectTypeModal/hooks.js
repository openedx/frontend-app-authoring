import {
  useState,
} from 'react';
import { StrictDict } from '../../../../utils';

export const state = StrictDict({
  selected: (val) => useState(val),
});

export default { state };
