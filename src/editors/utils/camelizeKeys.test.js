import { camelizeKeys } from './index';

const snakeCaseObject = {
  some_attribute:
    {
      another_attribute: [
        { a_list: 'a lIsT' },
        { of_attributes: 'iN diFferent' },
        { different_cases: 'to Test' },
      ],
    },
  a_final_attribute: null,
  a_last_one: undefined,
};
const camelCaseObject = {
  someAttribute:
    {
      anotherAttribute: [
        { aList: 'a lIsT' },
        { ofAttributes: 'iN diFferent' },
        { differentCases: 'to Test' },
      ],
    },
  aFinalAttribute: null,
  aLastOne: undefined,
};

describe('camelizeKeys', () => {
  it('converts keys of objects to be camelCase', () => {
    expect(camelizeKeys(snakeCaseObject)).toEqual(camelCaseObject);
  });
});
