import _ from 'lodash-es';
import { actions } from '..';
import { OLXParser } from '../../../containers/ProblemEditor/data/OLXParser';
import { parseSettings } from '../../../containers/ProblemEditor/data/SettingsParser';

export const initializeProblem = (blockValue) => (dispatch) => {
  const rawOLX = _.get(blockValue, 'data.data', {});
  try {
    const olxParser = new OLXParser(rawOLX);
    const { ...data } = olxParser.getParsedOLXData();
    let { settings } = olxParser.getParsedOLXData();
    settings = { ...settings, ...parseSettings(_.get(blockValue, 'data.metadata', {})) };
    if (!_.isEmpty(rawOLX) && !_.isEmpty(data)) {
      dispatch(actions.problem.load({ ...data, rawOLX, settings }));
    }
  } catch (error) {
    // eslint-disable-next-line
    console.error(error);
  }
};

export default { initializeProblem };
