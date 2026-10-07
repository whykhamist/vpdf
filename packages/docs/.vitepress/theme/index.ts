import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import DocsViewer from "./components/DocsViewer.vue";
import AllPluginsDemo from "./examples/AllPluginsDemo.vue";
import CustomEditorDemo from "./examples/CustomEditorDemo.vue";
import CustomPluginDemo from "./examples/CustomPluginDemo.vue";
import CustomThemesDemo from "./examples/CustomThemesDemo.vue";
import LoadFilesDemo from "./examples/LoadFilesDemo.vue";
import Mermaid from "./components/Mermaid.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("Mermaid", Mermaid);
    app.component("DocsViewer", DocsViewer);
    app.component("AllPluginsDemo", AllPluginsDemo);
    app.component("CustomEditorDemo", CustomEditorDemo);
    app.component("CustomPluginDemo", CustomPluginDemo);
    app.component("CustomThemesDemo", CustomThemesDemo);
    app.component("LoadFilesDemo", LoadFilesDemo);
  },
} satisfies Theme;
