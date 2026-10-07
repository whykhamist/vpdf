<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  ref,
  type PropType,
  type VNode,
} from "vue";
import type { VPdfOutlineItem } from "../../types";
import { VPDF_ICON_SLOTS, VPDF_ICON_FALLBACKS } from "../../icons";
import VPdfIcon from "../../components/VPdfIcon.vue";

defineProps<{
  items: VPdfOutlineItem[];
  onSelect: (item: VPdfOutlineItem) => void | Promise<void>;
}>();

let outlineNodeSeq = 0;

function isInitiallyExpanded(item: VPdfOutlineItem): boolean {
  if (!item.items.length) return false;
  return (item.count ?? 1) >= 0;
}

let OutlineBranch: ReturnType<typeof defineComponent>;
OutlineBranch = defineComponent({
  name: "VPdfOutlineBranch",
  props: {
    item: { type: Object as PropType<VPdfOutlineItem>, required: true },
    onSelect: {
      type: Function as PropType<
        (item: VPdfOutlineItem) => void | Promise<void>
      >,
      required: true,
    },
  },
  setup(props) {
    const hasChildren = computed(() => props.item.items.length > 0);
    const expanded = ref(isInitiallyExpanded(props.item));
    const listId = `vpdf-outline-${++outlineNodeSeq}`;

    function toggle() {
      expanded.value = !expanded.value;
    }

    return (): VNode => {
      const item = props.item;
      const open = hasChildren.value && expanded.value;
      const toggleSlot = open
        ? VPDF_ICON_SLOTS.outlineCollapse
        : VPDF_ICON_SLOTS.outlineExpand;
      return h("li", { class: "vpdf-outline-node" }, [
        h("div", { class: "vpdf-outline-row" }, [
          hasChildren.value
            ? h(
                "button",
                {
                  type: "button",
                  class: "vpdf-outline-toggle",
                  "aria-expanded": open,
                  "aria-controls": listId,
                  "aria-label": open
                    ? `Collapse ${item.title}`
                    : `Expand ${item.title}`,
                  onClick: toggle,
                },
                h(VPdfIcon, {
                  name: toggleSlot,
                  fallback: VPDF_ICON_FALLBACKS[toggleSlot],
                }),
              )
            : h('span', { class: 'vpdf-outline-toggle-spacer', 'aria-hidden': 'true' }),
          h(
            "button",
            {
              type: "button",
              class: [
                "vpdf-outline-item",
                item.bold ? "vpdf:font-semibold" : "",
                item.italic ? "vpdf:italic" : "",
              ]
                .filter(Boolean)
                .join(" "),
              onClick: () => props.onSelect(item),
            },
            item.title,
          ),
        ]),
        hasChildren.value
          ? h(
              "ul",
              {
                id: listId,
                class: "vpdf-outline-list",
                hidden: !open,
              },
              item.items.map((child, index) =>
                h(OutlineBranch, {
                  key: `${index}-${child.title}-${String(child.dest ?? child.url ?? "")}`,
                  item: child,
                  onSelect: props.onSelect,
                }),
              ),
            )
          : null,
      ]);
    };
  },
});

const OutlineTree = defineComponent({
  name: "VPdfOutlineTree",
  props: {
    items: { type: Array as PropType<VPdfOutlineItem[]>, required: true },
    onSelect: {
      type: Function as PropType<
        (item: VPdfOutlineItem) => void | Promise<void>
      >,
      required: true,
    },
  },
  setup(treeProps) {
    return () =>
      h(
        "ul",
        { class: "vpdf-outline-list" },
        treeProps.items.map((item, index) =>
          h(OutlineBranch, {
            key: `${index}-${item.title}-${String(item.dest ?? item.url ?? "")}`,
            item,
            onSelect: treeProps.onSelect,
          }),
        ),
      );
  },
});
</script>

<template>
  <nav class="vpdf-outline" aria-label="Bookmarks">
    <OutlineTree v-if="items.length" :items="items" :on-select="onSelect" />
    <p v-else class="vpdf-text-muted">No outline</p>
  </nav>
</template>
