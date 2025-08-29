/* eslint-disable import/no-extraneous-dependencies */
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faApple, faFacebook, faGoogle, faMicrosoft,
//   faChartBar, faUsers, faGraduationCap, faFileAlt,
} from '@fortawesome/free-brands-svg-icons';
// import {
//   faChartBar as fasChartBar,
//   faUsers as fasUsers,
//   faGraduationCap as fasGraduationCap,
//   faFileAlt as fasFileAlt,
// } from '@fortawesome/free-solid-svg-icons';

import {
    faUsers, faChartBar, faTachometerAlt, faClock
} from '@fortawesome/free-solid-svg-icons'

export default function registerFontAwesomeIcons() {
  // Add brand icons
  library.add(faApple, faFacebook, faGoogle, faMicrosoft);

  // Add solid icons (for your dashboard metrics)
  library.add(faUsers, faChartBar, faTachometerAlt, faClock);
}
