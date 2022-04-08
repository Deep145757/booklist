export const type = `
  
  type BookSummary {
    _id: String
    title: String
    asin: String
    isbn: String
    ean: String
    smallImage: String
    smallImagePreview: String
    mediumImage: String
    mediumImagePreview: String
    authors: [String]
  }

  type BookSummaryQueryResults {
    BookSummarys: [BookSummary!]!
    Meta: QueryResultsMetadata!
  }

  type BookSummarySingleQueryResult {
    BookSummary: BookSummary
  }

  type BookSummaryMutationResult {
    BookSummary: BookSummary
    success: Boolean!
    Meta: MutationResultInfo!
  }

  type BookSummaryMutationResultMulti {
    BookSummarys: [BookSummary]
    success: Boolean!
    Meta: MutationResultInfo!
  }

  type BookSummaryBulkMutationResult {
    success: Boolean!
    Meta: MutationResultInfo!
  }

  input BookSummaryInput {
    _id: String
    title: String
    asin: String
    isbn: String
    ean: String
    smallImage: String
    smallImagePreview: String
    mediumImage: String
    mediumImagePreview: String
    authors: [String]
  }

  input BookSummaryMutationInput {
    title: String
    asin: String
    isbn: String
    ean: String
    smallImage: String
    smallImagePreview: String
    mediumImage: String
    mediumImagePreview: String
    authors: [String]
    authors_PUSH: String
    authors_CONCAT: [String]
    authors_UPDATE: StringArrayUpdate
    authors_UPDATES: [StringArrayUpdate]
    authors_PULL: [String]
    authors_ADDTOSET: [String]
  }

  input BookSummarySort {
    _id: Int
    title: Int
    asin: Int
    isbn: Int
    ean: Int
    smallImage: Int
    smallImagePreview: Int
    mediumImage: Int
    mediumImagePreview: Int
    authors: Int
  }

  input BookSummaryFilters {
    title_contains: String
    title_startsWith: String
    title_endsWith: String
    title_regex: String
    title: String
    title_ne: String
    title_in: [String]
    title_nin: [String]
    asin_contains: String
    asin_startsWith: String
    asin_endsWith: String
    asin_regex: String
    asin: String
    asin_ne: String
    asin_in: [String]
    asin_nin: [String]
    isbn_contains: String
    isbn_startsWith: String
    isbn_endsWith: String
    isbn_regex: String
    isbn: String
    isbn_ne: String
    isbn_in: [String]
    isbn_nin: [String]
    authors_count: Int
    authors_textContains: String
    authors_startsWith: String
    authors_endsWith: String
    authors_regex: String
    authors: [String]
    authors_in: [[String]]
    authors_nin: [[String]]
    authors_contains: String
    authors_containsAny: [String]
    authors_containsAll: [String]
    authors_ne: [String]
    OR: [BookSummaryFilters]
  }
  
`;

export const mutation = `

  updateBookSummary (
    _id: String,
    Updates: BookSummaryMutationInput
  ): BookSummaryMutationResult

`;

export const query = `

  allBookSummarys (
    title_contains: String,
    title_startsWith: String,
    title_endsWith: String,
    title_regex: String,
    title: String,
    title_ne: String,
    title_in: [String],
    title_nin: [String],
    asin_contains: String,
    asin_startsWith: String,
    asin_endsWith: String,
    asin_regex: String,
    asin: String,
    asin_ne: String,
    asin_in: [String],
    asin_nin: [String],
    isbn_contains: String,
    isbn_startsWith: String,
    isbn_endsWith: String,
    isbn_regex: String,
    isbn: String,
    isbn_ne: String,
    isbn_in: [String],
    isbn_nin: [String],
    authors_count: Int,
    authors_textContains: String,
    authors_startsWith: String,
    authors_endsWith: String,
    authors_regex: String,
    authors: [String],
    authors_in: [[String]],
    authors_nin: [[String]],
    authors_contains: String,
    authors_containsAny: [String],
    authors_containsAll: [String],
    authors_ne: [String],
    OR: [BookSummaryFilters],
    SORT: BookSummarySort,
    SORTS: [BookSummarySort],
    LIMIT: Int,
    SKIP: Int,
    PAGE: Int,
    PAGE_SIZE: Int
  ): BookSummaryQueryResults!

  getBookSummary (
    _id: String
  ): BookSummarySingleQueryResult!

`;
