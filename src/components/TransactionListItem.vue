<template>
  <ion-item-sliding>
    <ion-item>
      <ion-label>
        <h2>{{ category?.name || "Uncategorized" }}</h2>
        <p>{{ transaction.date }} {{ transaction.note ? " • " + transaction.note : "" }}</p>
      </ion-label>
      <ion-note slot="end" :color="transaction.type === 'income' ? 'success' : 'danger'">
        {{ transaction.type === "income" ? "+" : "-"
        }}{{ formatCurrency(transaction.amount, currency) }}
      </ion-note>
    </ion-item>

    <ion-item-options side="end">
      <ion-item-option color="primary" @click="emit('edit', transaction)">Edit</ion-item-option>
      <ion-item-option color="danger" @click="emit('delete', transaction)">Delete</ion-item-option>
    </ion-item-options>
  </ion-item-sliding>
</template>

<script setup lang="ts">
import {
  IonItemSliding,
  IonItem,
  IonLabel,
  IonNote,
  IonItemOptions,
  IonItemOption,
} from "@ionic/vue";
import { computed } from "vue";
import type { Transaction, Category } from "@/repositories/types";
import { formatCurrency } from "@/utils/currency";

const props = defineProps<{
  transaction: Transaction;
  categories: Category[];
  currency: string;
}>();

const emit = defineEmits<{
  (e: "edit", transaction: Transaction): void;
  (e: "delete", transaction: Transaction): void;
}>();

const category = computed(() =>
  props.categories.find((c) => c.id === props.transaction.categoryId),
);
</script>
