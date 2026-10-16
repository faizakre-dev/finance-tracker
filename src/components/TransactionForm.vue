<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ isEdit ? "Edit Transaction" : "Add Transaction" }}</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="cancel">Cancel</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-item>
      <ion-label>Type</ion-label>
      <ion-select v-model="form.type" interface="popover">
        <ion-select-option value="expense">Expense</ion-select-option>
        <ion-select-option value="income">Income</ion-select-option>
      </ion-select>
    </ion-item>
    <ion-item>
      <ion-label position="floating">Amount</ion-label>
      <ion-input v-model.number="form.amount" type="number" min="0" step="0.01"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label>Category</ion-label>
      <ion-select v-model="form.categoryId" interface="popover">
        <ion-select-option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </ion-select-option>
      </ion-select>
    </ion-item>
    <ion-item>
      <ion-label position="floating">Date</ion-label>
      <ion-input v-model="form.date" type="date"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label position="floating">Note</ion-label>
      <ion-input v-model="form.note" type="text"></ion-input>
    </ion-item>
    <ion-button expand="block" class="ion-margin-top" :disabled="!isValid" @click="save">
      {{ isEdit ? "Update" : "Save" }}
    </ion-button>
  </ion-content>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
} from "@ionic/vue";
import { ref, computed, watch } from "vue";
import type { Transaction, Category } from "@/repositories/types";

const props = defineProps<{
  transaction?: Transaction | null;
  categories: Category[];
}>();
const emit = defineEmits<{
  (e: "save", transaction: Partial<Transaction>): void;
  (e: "cancel"): void;
}>();

const form = ref({
  type: "expense" as "expense" | "income",
  amount: 0,
  categoryId: "",
  date: new Date().toISOString().substring(0, 10),
  note: "",
});

const isEdit = computed(() => !!props.transaction);
const isValid = computed(() => form.value.amount > 0 && form.value.categoryId && form.value.date);

const filteredCategories = computed(() =>
  props.categories.filter((c) => c.type === form.value.type || c.type === "both"),
);

watch(
  () => props.transaction,
  (transaction) => {
    if (transaction) {
      form.value = {
        type: transaction.type,
        amount: transaction.amount,
        categoryId: transaction.categoryId,
        date: transaction.date,
        note: transaction.note || "",
      };
    } else {
      form.value = {
        type: "expense",
        amount: 0,
        categoryId: "",
        date: new Date().toISOString().substring(0, 10),
        note: "",
      };
    }
  },
  { immediate: true },
);

function save() {
  emit("save", {
    type: form.value.type,
    amount: form.value.amount,
    categoryId: form.value.categoryId,
    date: form.value.date,
    note: form.value.note || undefined,
  });
}

function cancel() {
  emit("cancel");
}
</script>
