<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Transactions</ion-title>
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
          <ion-title size="large">Transactions</ion-title>
        </ion-toolbar>
      </ion-header>

      <MonthPicker v-model="selectedMonth" />
      <ion-item>
        <ion-label>Filter</ion-label>
        <ion-select v-model="filterType" interface="popover">
          <ion-select-option value="all">All</ion-select-option>
          <ion-select-option value="expense">Expenses</ion-select-option>
          <ion-select-option value="income">Income</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-label>Category</ion-label>
        <ion-select v-model="filterCategoryId" interface="popover">
          <ion-select-option value="">All</ion-select-option>
          <ion-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </ion-select-option>
        </ion-select>
      </ion-item>

      <ion-list>
        <TransactionListItem
          v-for="transaction in filteredTransactions"
          :key="transaction.id"
          :transaction="transaction"
          :categories="categories"
          :currency="settings.currency"
          @edit="openEditModal"
          @delete="confirmDelete"
        />
        <ion-item v-if="filteredTransactions.length === 0">
          <ion-label class="ion-text-center ion-padding">No transactions for this month</ion-label>
        </ion-item>
      </ion-list>

      <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal">
        <TransactionForm
          :transaction="editingTransaction"
          :categories="categories"
          @save="handleSave"
          @cancel="closeModal"
        />
      </ion-modal>

      <ion-alert
        :is-open="isAlertOpen"
        header="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
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
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonAlert,
} from "@ionic/vue";
import { add } from "ionicons/icons";
import { ref, computed, onMounted } from "vue";
import MonthPicker from "@/components/MonthPicker.vue";
import TransactionForm from "@/components/TransactionForm.vue";
import TransactionListItem from "@/components/TransactionListItem.vue";
import { useTransactionsStore } from "@/stores/transactions";
import { useCategoriesStore } from "@/stores/categories";
import { useSettingsStore } from "@/stores/settings";
import type { Transaction } from "@/repositories/types";
import { getCurrentMonth } from "@/utils/month";

const transactionsStore = useTransactionsStore();
const categoriesStore = useCategoriesStore();
const settingsStore = useSettingsStore();

const selectedMonth = ref(getCurrentMonth());
const filterType = ref<"all" | "expense" | "income">("all");
const filterCategoryId = ref("");
const isModalOpen = ref(false);
const editingTransaction = ref<Transaction | null>(null);
const isAlertOpen = ref(false);
const transactionToDelete = ref<Transaction | null>(null);

const categories = computed(() => categoriesStore.categories);
const settings = computed(() => settingsStore.settings);
const transactions = computed(() => transactionsStore.transactions);

const filteredTransactions = computed(() => {
  let result = transactions.value.filter((t: Transaction) =>
    t.date.startsWith(selectedMonth.value),
  );
  if (filterType.value !== "all") {
    result = result.filter((t: Transaction) => t.type === filterType.value);
  }
  if (filterCategoryId.value) {
    result = result.filter((t: Transaction) => t.categoryId === filterCategoryId.value);
  }
  return result.sort((a: Transaction, b: Transaction) =>
    a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date),
  );
});

const alertButtons = [
  { text: "Cancel", role: "cancel", handler: () => closeAlert() },
  { text: "Delete", role: "destructive", handler: () => deleteTransaction() },
];

onMounted(async () => {
  await Promise.all([transactionsStore.load(), categoriesStore.load(), settingsStore.load()]);
});

function openAddModal() {
  editingTransaction.value = null;
  isModalOpen.value = true;
}

function openEditModal(transaction: Transaction) {
  editingTransaction.value = transaction;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  editingTransaction.value = null;
}

async function handleSave(transactionData: Partial<Transaction>) {
  if (editingTransaction.value) {
    await transactionsStore.updateTransaction(editingTransaction.value.id, transactionData);
  } else {
    await transactionsStore.addTransaction(
      transactionData as Omit<Transaction, "id" | "createdAt" | "updatedAt">,
    );
  }
  closeModal();
}

function confirmDelete(transaction: Transaction) {
  transactionToDelete.value = transaction;
  isAlertOpen.value = true;
}

function closeAlert() {
  isAlertOpen.value = false;
  transactionToDelete.value = null;
}

async function deleteTransaction() {
  if (transactionToDelete.value) {
    await transactionsStore.deleteTransaction(transactionToDelete.value.id);
  }
  closeAlert();
}
</script>
