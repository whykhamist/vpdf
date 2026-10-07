import type {
  VPdfFindEventType,
  VPdfFindOptions,
  VPdfSearchState,
  VPdfViewerController,
} from "../../types";

export type VPdfSearchOption =
  | "highlightAll"
  | "caseSensitive"
  | "matchDiacritics"
  | "entireWord";

const OPTION_FIND_TYPE: Record<VPdfSearchOption, VPdfFindEventType> = {
  highlightAll: "highlightallchange",
  caseSensitive: "casesensitivitychange",
  matchDiacritics: "diacriticmatchingchange",
  entireWord: "entirewordchange",
};

const FIND_CONTROL_STATUS = [
  "found",
  "not-found",
  "wrapped",
  "pending",
] as const;

const MATCH_RECOUNT_FIND_TYPES: ReadonlySet<VPdfFindEventType> = new Set([
  "",
  "again",
  "casesensitivitychange",
  "entirewordchange",
  "diacriticmatchingchange",
]);

export function isMatchRecountFindType(type: VPdfFindEventType): boolean {
  return MATCH_RECOUNT_FIND_TYPES.has(type);
}

export function searchPatchFromFindControlState(
  state: number,
  matchesCount?: { current: number; total: number },
): Pick<VPdfSearchState, "status"> &
  Partial<Pick<VPdfSearchState, "matchCount" | "currentMatch">> {
  const status = FIND_CONTROL_STATUS[state] ?? "idle";
  if (matchesCount) {
    return {
      status,
      matchCount: matchesCount.total,
      currentMatch: matchesCount.current,
    };
  }
  if (status === "not-found") {
    return { status, matchCount: 0, currentMatch: 0 };
  }
  return { status };
}

export const SEARCH_QUERY_MAX_LENGTH = 100;

export function queryFromSelectedText(
  text: string,
  maxLength = SEARCH_QUERY_MAX_LENGTH,
): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  return normalized.slice(0, maxLength);
}

export function canAdvanceFind(
  search: VPdfSearchState,
  query: string,
): boolean {
  const trimmedQuery = query.trim();
  return (
    trimmedQuery.length > 0 &&
    search.query === trimmedQuery &&
    search.matchCount > 0 &&
    (search.status === "found" || search.status === "wrapped")
  );
}

export function toFindOptions(
  search: VPdfSearchState,
  query: string,
  findPrevious = false,
): VPdfFindOptions {
  return {
    query,
    caseSensitive: search.caseSensitive,
    entireWord: search.entireWord,
    highlightAll: search.highlightAll,
    matchDiacritics: search.matchDiacritics,
    findPrevious,
  };
}

export function toggleSearchOption(
  search: VPdfSearchState,
  option: VPdfSearchOption,
  query: string,
): VPdfFindOptions {
  return {
    ...toFindOptions(search, query),
    [option]: !search[option],
    type: OPTION_FIND_TYPE[option],
  };
}

export function runSearchFind(
  controller: Pick<
    VPdfViewerController,
    "find" | "findNext" | "findPrevious"
  >,
  search: VPdfSearchState,
  query: string,
  findPrevious: boolean,
): void {
  if (canAdvanceFind(search, query)) {
    if (findPrevious) controller.findPrevious();
    else controller.findNext();
    return;
  }
  controller.find(toFindOptions(search, query, findPrevious));
}
