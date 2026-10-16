<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Budgets</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openAddModal">
            <ion-icon slot="icon-only" :icon="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Budgets</ion-title>
        </ion-toolbar>
      </ion-header>

      <MonthPicker v-model="selectedMonth" />

      <div class="ion-padding">
        <BudgetProgressCard
          v-for="budget in monthBudgets"
          :key="budget.id"
          :budget="budget"
          :spent="spentByCategory(budget.categoryId)"
          :currency="settings.currency"
          :categories="categories"
          @edit="openEditModal"
          @delete="confirmDelete"
        />
        <ion-item v-if="monthBudgets.length === 0">
          <ion-label class="ion-text-center">
            No budgets for this month.
            <ion-button fill="clear" @click="openAddModal">Add one</ion-button>
          </ion-label>
        </ion-item>
      </div>

      <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal">
        <BudgetForm
          :budget="editingBudget"
          :month="selectedMonth"
          :categories="categories"
          @save="handleSave"
          @cancel="closeModal"
        />
      </ion-modal>

      <ion-alert
        :is-open="isAlertOpen"
        header="Delete Budget"
        message="Are you sure you want to delete this budget?"
        :buttons="alertButtons"
        @did-dismiss="closeAlert"
      ></ion-alert>
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
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonAlert,
} from "@ionic/vue";
import { add } from "ionicons/icons";
import { ref, computed, onMounted } from "vue";
import MonthPicker from "@/components/MonthPicker.vue";
import BudgetForm from "@/components/BudgetForm.vue";
import BudgetProgressCard from "@/components/BudgetProgressCard.vue";
import { useTransactionsStore, useBudgetsStore } from "@/stores/transactions";
import { useCategoriesStore } from "@/stores/categories";
import { useSettingsStore } from "@/stores/settings";
import type { Budget, Transaction } from "@/repositories/types";
import { getCurrentMonth } from "@/utils/month";

const transactionsStore = useTransactionsStore();
const budgetsStore = useBudgetsStore();
const categoriesStore = useCategoriesStore();
const settingsStore = useSettingsStore();

const selectedMonth = ref(getCurrentMonth());
const isModalOpen = ref(false);
const editingBudget = ref<Budget | null>(null);
const isAlertOpen = ref(false);
const budgetToDelete = ref<Budget | null>(null);

const categories = computed(() => categoriesStore.categories);
const settings = computed(() => settingsStore.settings);

const monthBudgets = computed(() =>
  budgetsStore.budgets.filter((b: Budget) => b.month === selectedMonth.value),
);

function spentByCategory(categoryId: string): number {
  return transactionsStore.transactions
    .filter(
      (t: Transaction) =>
        t.type === "expense" &&
        t.categoryId === categoryId &&
        t.date.startsWith(selectedMonth.value),
    )
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
}

const alertButtons = [
  { text: "Cancel", role: "cancel", handler: () => closeAlert() },
  { text: "Delete", role: "destructive", handler: () => deleteBudget() },
];

onMounted(async () => {
  await Promise.all([
    budgetsStore.load(),
    transactionsStore.load(),
    categoriesStore.load(),
    settingsStore.load(),
  ]);
});

function openAddModal() {
  editingBudget.value = null;
  isModalOpen.value = true;
}

function openEditModal(budget: Budget) {
  editingBudget.value = budget;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  editingBudget.value = null;
}

async function handleSave(data: Omit<Budget, "id">) {
  if (editingBudget.value) {
    await budgetsStore.updateBudget(editingBudget.value.id, data);
  } else {
    await budgetsStore.addBudget(data);
  }
  closeModal();
}

function confirmDelete(budget: Budget) {
  budgetToDelete.value = budget;
  isAlertOpen.value = true;
}

function closeAlert() {
  isAlertOpen.value = false;
  budgetToDelete.value = null;
}

async function deleteBudget() {
  if (budgetToDelete.value) {
    await budgetsStore.deleteBudget(budgetToDelete.value.id);
  }
  closeAlert();
}
</script>
