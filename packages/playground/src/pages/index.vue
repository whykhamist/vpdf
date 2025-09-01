<script setup lang="ts">
import Acrobat_reference_secured from "@files/Acrobat_reference_secured.pdf";
import Acrobat_reference from "@files/acrobat_reference.pdf";
import With_Attachments from "@files/attachments.pdf";
import type { LocationQuery, LocationQueryRaw } from "vue-router";

const router = useRouter();
const route = useRoute();

const options = ref({
  srcId: "acrobat_reference",
  theme: "",
  icon: "",
  smoothJump: true,
  textlayer: false,
});

const files = ref([
  {
    value: "acrobat_reference",
    label: "Acrobat Reference",
    src: Acrobat_reference,
  },
  {
    value: "acrobat_reference_secured",
    label: "Acrobat Reference Secured (password)",
    src: Acrobat_reference_secured,
  },
  {
    value: "with_attachments",
    label: "With Attachments",
    src: With_Attachments,
  },
  {
    value: "online",
    label: "Online Source",
    src: "https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.7old.pdf",
  },
]);

const themes = ref([
  {
    label: "Light",
    value: "",
  },
  {
    label: "Dark",
    value: "vpdf-dark",
  },
  {
    label: "Sepia",
    value: "vpdf-sepia",
  },
]);

const icons = ref([
  {
    label: "VPDF",
    value: "",
  },
  {
    label: "Emojie",
    value: "vpdf-icons-emoji",
  },
]);

const src = computed(
  () => files.value.find((f) => f.value == options.value.srcId)?.src,
);

watch(
  options,
  (val) => {
    router.push({
      name: "Home",
      query: {
        smooth: val.smoothJump ? "1" : "0",
        textlayer: val.textlayer ? "1" : "0",
        id: val.srcId,
        theme: val.theme,
        icon: val.icon,
      },
    });
  },
  { deep: true },
);

watch(
  () => route.query,
  (val) => {
    options.value = {
      srcId: `${val.id ?? "acrobat_reference"}`,
      theme: `${val.theme ?? ""}`,
      icon: `${val.icon ?? ""}`,
      smoothJump: val.smooth == "1",
      textlayer: val.textlayer == "1",
    };
  },
  { immediate: true, deep: true },
);

onMounted(() => {});
</script>

<template>
  <div
    class="vpdf:flex vpdf:h-screen vpdf:w-screen vpdf:flex-col vpdf:bg-background-800 vpdf:md:flex-row"
    :class="options.theme"
  >
    <div
      class="vpdf:flex vpdf:w-full vpdf:flex-row vpdf:flex-wrap vpdf:gap-2 vpdf:px-3 vpdf:py-2 vpdf:md:w-64 vpdf:md:flex-col"
    >
      <TCheckBox v-model="options.smoothJump" label="Smooth Jump" />
      <TCheckBox v-model="options.textlayer" label="Text Layer" />
      <div
        class="vpdf:grid vpdf:w-full vpdf:grid-cols-3 vpdf:gap-2 vpdf:md:grid-cols-1"
      >
        <TSelect
          v-model="options.srcId"
          :options="files"
          label="Source"
          class=""
        />
        <TSelect
          v-model="options.theme"
          :options="themes"
          label="Theme"
          class=""
        />
        <TSelect
          v-model="options.icon"
          :options="icons"
          label="Icons"
          class=""
        />
      </div>
    </div>
    <div class="vpdf:flex-auto vpdf:md:w-[calc(100dvw_-_48rem)]">
      <VPdf
        v-if="src"
        :src
        :textLayer="options.textlayer"
        :smoothJump="options.smoothJump"
        :class="`${options.theme} ${options.icon}`"
      />
      <div v-else class="vpdf:bg-negative-400 vpdf:text-center">
        Unknown PDF Source
      </div>
    </div>
  </div>
</template>
