export type ReferenceSearchResult = {
  kind: 'reference';
  data: {
    title: string;
    subtitle: string;
    origin: string;
    target?: string;
  };
};

export type SutraSearchResult = {
  kind: 'sutra';
  data: {
    title: string;
    subtitle: string;
    origin: string;
    target?: string;
  };
};

export type GlossarySearchResult = {
  kind: 'glossary';
  data: {
    title: string;
    subtitle: string;
    origin: string;
    target?: string;
    short_definition?: string;
    example_use?: string;
    related_terms?: string;
    terms_to_avoid?: string;
    options?: string;
    discussion?: string;
  };
};

export type SearchResults = (ReferenceSearchResult | SutraSearchResult | GlossarySearchResult)[];
