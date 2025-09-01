export default [
  {
    path: "/",
    component: () => import("@/components/layout.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("@/pages/index.vue"),
      },
      {
        path: "/:catchAll(.*)",
        name: "notFound",
        component: () => import("@/pages/404.vue"),
      },
    ],
  },
];
