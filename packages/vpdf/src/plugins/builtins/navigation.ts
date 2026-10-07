import { computed, markRaw } from "vue";
import type { VPdfPluginDefinition } from "../types";
import { isToolbarFeatureEnabled } from "../resolve";
import { VPDF_ICON_SLOTS } from "../../icons";
import { VPDF_BUILTIN_PLUGIN_IDS } from "./ids";
import PageNavControls from "./PageNavControls.vue";

const PageNavControlsRaw = markRaw(PageNavControls);

export function VPdfNavigationPlugin(): VPdfPluginDefinition {
  return {
    id: VPDF_BUILTIN_PLUGIN_IDS.navigation,
    name: "Navigation",
    setup(ctx) {
      const disposeSidebar = ctx.registerToolbarItem({
        id: "sidebar",
        label: "Sidebar",
        title: "Toggle sidebar",
        icon: VPDF_ICON_SLOTS.sidebar,
        placement: "start",
        order: 10,
        visible: () => isToolbarFeatureEnabled(ctx.options.value, "sidebar"),
        active: () => ctx.state.value.sidebar !== "none",
        onClick: () => {
          const current = ctx.state.value.sidebar;
          ctx.controller.setSidebar(current === "none" ? "thumbnails" : "none");
        },
      });

      const disposePageNav = ctx.registerToolbarItem({
        id: "page-nav",
        kind: "control",
        placement: "start",
        order: 20,
        visible: () => isToolbarFeatureEnabled(ctx.options.value, "pageNav"),
        component: PageNavControlsRaw,
        props: computed(() => ({
          pageNumber: ctx.state.value.pageNumber,
          pageCount: ctx.state.value.pageCount,
          onPrevious: () => ctx.controller.previousPage(),
          onNext: () => ctx.controller.nextPage(),
          onGoToPage: (page: number) => ctx.controller.goToPage(page),
        })),
      });

      const whenPageNav = () =>
        isToolbarFeatureEnabled(ctx.options.value, "pageNav");

      const disposeNext = ctx.registerShortcut({
        id: "next-arrow",
        key: "ArrowRight",
        when: whenPageNav,
        handler: () => ctx.controller.nextPage(),
      });
      const disposePageDown = ctx.registerShortcut({
        id: "next-page",
        key: "PageDown",
        when: whenPageNav,
        handler: () => ctx.controller.nextPage(),
      });
      const disposePrev = ctx.registerShortcut({
        id: "prev-arrow",
        key: "ArrowLeft",
        when: whenPageNav,
        handler: () => ctx.controller.previousPage(),
      });
      const disposePageUp = ctx.registerShortcut({
        id: "prev-page",
        key: "PageUp",
        when: whenPageNav,
        handler: () => ctx.controller.previousPage(),
      });
      const disposeHome = ctx.registerShortcut({
        id: "first-page",
        key: "Home",
        when: whenPageNav,
        handler: () => ctx.controller.goToPage(1),
      });
      const disposeEnd = ctx.registerShortcut({
        id: "last-page",
        key: "End",
        when: whenPageNav,
        handler: () => ctx.controller.goToPage(ctx.state.value.pageCount),
      });

      return () => {
        disposeSidebar();
        disposePageNav();
        disposeNext();
        disposePageDown();
        disposePrev();
        disposePageUp();
        disposeHome();
        disposeEnd();
      };
    },
  };
}
