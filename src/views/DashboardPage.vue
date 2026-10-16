<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Dashboard</ion-title>
        </ion-toolbar>
      </ion-header>

      <MonthPicker v-model="selectedMonth" />

      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-card class="summary-card">
              <ion-card-content>
                <ion-text color="medium"><small>Income</small></ion-text>
                <h2 class="ion-no-margin" style="color: var(--ion-color-success)">
                  {{ formatCurrency(monthIncome, settings.currency) }}
                </h2>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col>
            <ion-card class="summary-card">
              <ion-card-content>
                <ion-text color="medium"><small>Expenses</small></ion-text>
                <h2 class="ion-no-margin" style="color: var(--ion-color-danger)">
                  {{ formatCurrency(monthExpense, settings.currency) }}
                </h2>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-card class="summary-card">
              <ion-card-content>
                <ion-text color="medium"><small>Balance</small></ion-text>
                <h2 class="ion-no-margin">{{ formatCurrency(monthBalance, settings.currency) }}</h2>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-card v-if="monthBudgets.length > 0">
        <ion-card-header>
          <ion-card-title>Budgets</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div v-for="budget in monthBudgets" :key="budget.id" class="budget-row">
            <div class="budget-label">
              <span>{{ categoryName(budget.categoryId) }}</span>
              <span>
                {{ formatCurrency(spentByCategory(budget.categoryId), settings.currency) }} /
                {{ formatCurrency(budget.limit, settings.currency) }}
              </span>
            </div>
            <ion-progress-bar
              :value="Math.min(spentByCategory(budget.categoryId) / budget.limit, 1)"
              :color="budgetColor(budget)"
            ></ion-progress-bar>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Spending by category</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <CategoryPieChart :labels="chartLabels" :values="chartValues" :colors="chartColors" />
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Recent transactions</ion-card-title>
        </ion-card-header>
        <ion-list lines="none">
          <ion-item v-for="transaction in recentTransactions" :key="transaction.id">
            <ion-label>
              <h3>{{ categoryName(transaction.categoryId) }}</h3>
              <p>{{ transaction.date }}{{ transaction.note ? " • " + transaction.note : "" }}</p>
            </ion-label>
            <ion-note slot="end" :color="transaction.type === 'income' ? 'success' : 'danger'">
              {{ transaction.type === "income" ? "+" : "-"
              }}{{ formatCurrency(transaction.amount, settings.currency) }}
            </ion-note>
          </ion-item>
          <ion-item v-if="recentTransactions.length === 0">
            <ion-label class="ion-text-center"><p>No transactions this month</p></ion-label>
          </ion-item>
        </ion-list>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonProgressBar,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
} from "@ionic/vue";
import { ref, computed, onMounted } from "vue";
import MonthPicker from "@/components/MonthPicker.vue";
import CategoryPieChart from "@/components/CategoryPieChart.vue";
import { useTransactionsStore, useBudgetsStore } from "@/stores/transactions";
import { useCategoriesStore } from "@/stores/categories";
import { useSettingsStore } from "@/stores/settings";
import type { Budget, Transaction, Category } from "@/repositories/types";
import { formatCurrency } from "@/utils/currency";
import { getCurrentMonth } from "@/utils/month";
import { computeBudgetStatus, sumExpensesByCategory } from "@/utils/budget";

const transactionsStore = useTransactionsStore();
const budgetsStore = useBudgetsStore();
const categoriesStore = useCategoriesStore();
const settingsStore = useSettingsStore();

const selectedMonth = ref(getCurrentMonth());

const categories = computed(() => categoriesStore.categories);
const settings = computed(() => settingsStore.settings);

const monthTransactions = computed(() =>
  transactionsStore.transactions.filter((t: Transaction) => t.date.startsWith(selectedMonth.value)),
);

const monthIncome = computed(() =>
  monthTransactions.value
    .filter((t: Transaction) => t.type === "income")
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
);

const monthExpense = computed(() =>
  monthTransactions.value
    .filter((t: Transaction) => t.type === "expense")
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
);

const monthBalance = computed(() => monthIncome.value - monthExpense.value);

const monthBudgets = computed(() =>
  budgetsStore.budgets.filter((b: Budget) => b.month === selectedMonth.value),
);

const recentTransactions = computed(() =>
  [...monthTransactions.value]
    .sort((a: Transaction, b: Transaction) => b.date.localeCompare(a.date))
    .slice(0, 5),
);

const expenseByCategory = computed(() =>
  sumExpensesByCategory(monthTransactions.value, selectedMonth.value),
);

const chartLabels = computed(() =>
  [...expenseByCategory.value.keys()].map((id) => categoryName(id)),
);
const chartValues = computed(() => [...expenseByCategory.value.values()]);
const chartColors = computed(() =>
  [...expenseByCategory.value.keys()].map(
    (id) => categories.value.find((c: Category) => c.id === id)?.color || "#64748b",
  ),
);

function categoryName(id: string): string {
  return categories.value.find((c: Category) => c.id === id)?.name || "Unknown";
}

function spentByCategory(categoryId: string): number {
  return expenseByCategory.value.get(categoryId) || 0;
}

function budgetColor(budget: Budget): string {
  return computeBudgetStatus(spentByCategory(budget.categoryId), budget.limit).color;
}

onMounted(async () => {
  await Promise.all([
    transactionsStore.load(),
    budgetsStore.load(),
    categoriesStore.load(),
    settingsStore.load(),
  ]);
});
</script>

<style scoped>
.summary-card {
  margin: 4px;
  text-align: center;
}
.budget-row {
  margin-bottom: 14px;
}
.budget-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 4px;
}
</style>
