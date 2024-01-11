module.exports = {
  'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b': {
    taxonomies: [
      {
        name: 'FlatTaxonomy',
        taxonomyId: 3,
        canTagObject: true,
        tags: [
          {
            value: 'flat taxonomy tag 3856',
            lineage: [
              'flat taxonomy tag 3856',
            ],
          },
        ],
      },
      {
        name: 'HierarchicalTaxonomy',
        taxonomyId: 4,
        canTagObject: true,
        tags: [
          {
            value: 'hierarchical taxonomy tag 1.7.59',
            lineage: [
              'hierarchical taxonomy tag 1',
              'hierarchical taxonomy tag 1.7',
              'hierarchical taxonomy tag 1.7.59',
            ],
          },
          {
            value: 'hierarchical taxonomy tag 2.13.46',
            lineage: [
              'hierarchical taxonomy tag 2',
              'hierarchical taxonomy tag 2.13',
              'hierarchical taxonomy tag 2.13.46',
            ],
          },
          {
            value: 'hierarchical taxonomy tag 3.4.50',
            lineage: [
              'hierarchical taxonomy tag 3',
              'hierarchical taxonomy tag 3.4',
              'hierarchical taxonomy tag 3.4.50',
            ],
          },
        ],
      },
    ],
  },
};
