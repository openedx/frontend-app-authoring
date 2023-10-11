export interface TaxonomyData {
    id: number;
    name: string;
    description: string;
    enabled: boolean;
    allow_multiple: boolean;
    allow_free_text: boolean;
    system_defined: boolean;
    visible_to_authors: boolean;
};

export interface TaxonomyListData {
    next: string;
    previous: string;
    count: number;
    num_pages: number;
    current_page: number;
    start: number;
    results: TaxonomyData[];
};

export interface QueryTaxonomyListData {
    data: TaxonomyListData;
};
