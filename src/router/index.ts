import { createRouter, createWebHistory } from "@ionic/vue-router";
import type { RouteRecordRaw } from "vue-router";
import TabsPage from "../views/TabsPage.vue";
import DashboardPage from "../views/DashboardPage.vue";
import TransactionsPage from "../views/TransactionsPage.vue";
import BudgetsPage from "../views/BudgetsPage.vue";
import SettingsPage from "../views/SettingsPage.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/tabs/dashboard" },
  {
    path: "/tabs/",
    component: TabsPage,
    children: [
      { path: "", redirect: "/tabs/dashboard" },
      { path: "dashboard", component: DashboardPage },
      { path: "transactions", component: TransactionsPage },
      { path: "budgets", component: BudgetsPage },
      { path: "settings", component: SettingsPage },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
