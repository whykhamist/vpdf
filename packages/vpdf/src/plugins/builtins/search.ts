import { computed, markRaw, ref } from "vue";
import type { VPdfPluginDefinition } from "../types";
import { isFeatureEnabled, isToolbarFeatureEnabled } from "../resolve";
import { VPDF_BUILTIN_PLUGIN_IDS } from "./ids";
import { VPDF_ICON_SLOTS } from "../../icons";
import SearchBar from "./SearchBar.vue";
import {
  queryFromSelectedText,
  runSearchFind,
  toFindOptions,
  toggleSearchOption,
  type VPdfSearchOption,
} from "./searchOptions";

const SearchBarRaw = markRaw(SearchBar);

export function VPdfSearchPlugin(): VPdfPluginDefinition {
  return {
    id: VPDF_BUILTIN_PLUGIN_IDS.search,
    name: "Search",
    setup(ctx) {
      const open = ref(false);
      const query = ref("");

      const searchEnabled = () =>
        isToolbarFeatureEnabled(ctx.options.value, "search") &&
        isFeatureEnabled(ctx.options.value, "search");
      const searchOpen = () => searchEnabled() && open.value;

      const openSearch = () => {
        if (!searchEnabled()) return;
        const selected = queryFromSelectedText(
          document.getSelection()?.toString() ?? "",
        );
        if (selected) {
          query.value = selected;
          ctx.controller.find(
            toFindOptions(ctx.state.value.search, selected, false),
          );
        }
        open.value = true;
      };

      const find = (findPrevious: boolean) => {
        runSearchFind(
          ctx.controller,
          ctx.state.value.search,
          query.value,
          findPrevious,
        );
      };

      const toggleOption = (option: VPdfSearchOption) => {
        ctx.controller.find(
          toggleSearchOption(ctx.state.value.search, option, query.value),
        );
      };

      const disposeToggle = ctx.registerToolbarItem({
        id: "toggle",
        label: "Search",
        title: "Search",
        icon: VPDF_ICON_SLOTS.search,
        placement: "end",
        order: 10,
        visible: searchEnabled,
        active: () => open.value,
        onClick: () => {
          open.value = !open.value;
          if (!open.value) ctx.controller.clearFind();
        },
      });

      const disposeBar = ctx.registerControl({
        id: "bar",
        region: "viewer-top",
        order: 10,
        visible: () => searchOpen(),
        component: SearchBarRaw,
        props: computed(() => ({
          search: { ...ctx.state.value.search, query: query.value },
          onQuery: (value: string) => {
            query.value = value;
          },
          onFind: find,
          onToggleOption: toggleOption,
          onClose: () => {
            open.value = false;
            query.value = "";
            ctx.controller.clearFind();
          },
        })),
      });

      const shortcutDisposers = [
        { id: "find-ctrl", key: "f", ctrl: true, when: searchEnabled, handler: openSearch },
        { id: "find-meta", key: "f", meta: true, when: searchEnabled, handler: openSearch },
        { id: "next-ctrl", key: "g", ctrl: true, when: searchOpen, handler: () => find(false) },
        { id: "next-meta", key: "g", meta: true, when: searchOpen, handler: () => find(false) },
        { id: "prev-ctrl", key: "g", ctrl: true, shift: true, when: searchOpen, handler: () => find(true) },
        { id: "prev-meta", key: "g", meta: true, shift: true, when: searchOpen, handler: () => find(true) },
        { id: "highlight-alt-a", key: "a", alt: true, when: searchOpen, handler: () => toggleOption("highlightAll") },
        { id: "highlight-alt-l", key: "l", alt: true, when: searchOpen, handler: () => toggleOption("highlightAll") },
        { id: "case-alt-c", key: "c", alt: true, when: searchOpen, handler: () => toggleOption("caseSensitive") },
        { id: "diacritics-alt-i", key: "i", alt: true, when: searchOpen, handler: () => toggleOption("matchDiacritics") },
        { id: "word-alt-w", key: "w", alt: true, when: searchOpen, handler: () => toggleOption("entireWord") },
      ].map((shortcut) => ctx.registerShortcut(shortcut));

      return () => {
        disposeToggle();
        disposeBar();
        for (const dispose of shortcutDisposers) dispose();
      };
    },
  };
}
