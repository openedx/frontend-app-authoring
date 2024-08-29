import { nodeContainsChildTags, findNodesAndRemoveTheirParentNodes, tagName } from './reactStateOLXHelpers';

describe('reactStateOLXHelpers', () => {
  describe('findNodesWithChildTags', () => {
    const node = {
      div:
       [
         {
           label:
           [
             { '#text': 'def' },
           ],
         },
         { '#text': ' ' },
         {
           em:
           [
             { '#text': 'ghi' },
           ],
           ':@': { '@_class': 'olx_description' },
         },
         {
           em:
           [
             { '#text': 'jkl' },
           ],
         },
       ],
    };

    const nodeWithNestedLabel = {
      div:
       [
         {
           div:
           [{
             label:
            [
              { '#text': 'def' },
            ],
           }],
         },
         { '#text': ' ' },
         {
           em:
           [
             { '#text': 'ghi' },
           ],
           ':@': { '@_class': 'olx_description' },
         },
         {
           em:
           [
             { '#text': 'jkl' },
           ],
         },
       ],
    };

    it('should return true if node contains specified child tags', () => {
      const received = nodeContainsChildTags(node, ['p', 'label']);
      expect(received).toEqual(true);
    });

    it('should return false if node does not contain child tags', () => {
      const received = nodeContainsChildTags(node, ['p', 'span']);
      expect(received).toEqual(false);
    });

    it('should return true if node contains specified nested child tags and recursive is true', () => {
      const received = nodeContainsChildTags(nodeWithNestedLabel, ['p', 'label'], { recursive: true });
      expect(received).toEqual(true);
    });

    it('should return false if node contains specified nested child tags and recursive is not set', () => {
      const received = nodeContainsChildTags(nodeWithNestedLabel, ['p', 'label']);
      expect(received).toEqual(false);
    });

    it('should handle arrays somehow, in case there is an edge case where it is passed', () => {
      const received = nodeContainsChildTags([nodeWithNestedLabel, node], ['p', 'label'], { recursive: true });
      expect(received).toEqual(true);
    });
  });

  describe('findNodesAndRemoveTheirParentNodes', () => {
    const exampleQuestionObject = [
      {
        p: [{
          '#text': 'abc',
        }],
      },
      {
        div:
        [
          {
            label:
            [{ '#text': 'def' }],
          },
          { '#text': ' ' },
          {
            em:
            [{
              '#text': 'ghi',
            }],
            ':@': { '@_class': 'olx_description' },
          },
          { em: [{ '#text': 'Just a generic em tag' }] },
        ],
      },
    ];

    const questionObjectWithoutDiv = [
      {
        p: [{
          '#text': 'abc',
        }],
      },
      {
        label: [{ '#text': 'def' }],
      },
      { '#text': ' ' },
      {
        em:
            [{
              '#text': 'ghi',
            }],
        ':@': { '@_class': 'olx_description' },
      },
      { em: [{ '#text': 'Just a generic em tag' }] },
    ];

    it('should remove parent nodes of specified child tags', () => {
      expect(findNodesAndRemoveTheirParentNodes({
        arrayOfNodes: exampleQuestionObject,
        nodesToFind: ['label'],
        parentsToRemove: ['div'],
      })).toEqual(questionObjectWithoutDiv);
    });

    it('should not remove anything unless specified in "parentsToRemove"', () => {
      expect(findNodesAndRemoveTheirParentNodes({
        arrayOfNodes: exampleQuestionObject,
        nodesToFind: ['label'],
        parentsToRemove: ['span'],
      })).toEqual(exampleQuestionObject);
    });
  });

  describe('tagName', () => {
    it('should return the tag name of the node', () => {
      expect(tagName({
        p: [{
          '#text': 'abc',
        }],
      })).toEqual('p');
    });

    it('should throw an error if the node is an array', () => {
      expect(() => tagName([])).toThrow(TypeError);
    });

    it('should return undefined if the node is text-only', () => {
      expect(tagName({ '#text': 'abc' })).toEqual(undefined);
    });

    it('should return undefined if the node is an empty object', () => {
      expect(tagName({})).toEqual(undefined);
    });

    it('should return correct tagName if the node has text and class properties as well', () => {
      expect(tagName({
        ':@': { '@_class': 'olx_description' },
        '#text': 'abc',
        em:
            [{
              '#text': 'ghi',
            }],
      })).toEqual('em');
    });
  });
});
