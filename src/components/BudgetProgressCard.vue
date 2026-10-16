<template>
  <ion-card>
    <ion-card-header>
      <ion-card-subtitle>
        {{ category?.name || "Unknown category" }}
        <ion-note :color="progressColor" v-if="progress >= 1">over budget</ion-note>
      </ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
      <ion-progress-bar :value="Math.min(progress, 1)" :color="progressColor"></ion-progress-bar>
      <p class="ion-margin-top">
        <strong>{{ formatCurrency(budgetSpent, currency) }}</strong>
        of {{ formatCurrency(budget.limit, currency) }}
        <span v-if="remaining >= 0"> • {{ formatCurrency(remaining, currency) }} left</span>
        <span v-else> • {{ formatCurrency(-remaining, currency) }} over</span>
      </p>
      <ion-button fill="clear" size="small" @click="emit('edit', budget)">Edit</ion-button>
      <ion-button fill="clear" size="small" color="danger" @click="emit('delete', budget)">
        Delete
      </ion-button>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonProgressBar,
  IonNote,
  IonButton,
} from "@ionic/vue";
import { computed } from "vue";
import type { Budget, Category } from "@/repositories/types";
import { formatCurrency } from "@/utils/currency";
import { computeBudgetStatus } from "@/utils/budget";

const props = defineProps<{
  budget: Budget;
  spent: number;
  currency: string;
  categories: Category[];
}>();

const emit = defineEmits<{
  (e: "edit", budget: Budget): void;
  (e: "delete", budget: Budget): void;
}>();

const category = computed(() => props.categories.find((c) => c.id === props.budget.categoryId));
const status = computed(() => computeBudgetStatus(props.spent, props.budget.limit));
const budgetSpent = computed(() => status.value.spent);
const progress = computed(() => status.value.progress);
const remaining = computed(() => status.value.remaining);
const progressColor = computed(() => status.value.color);
</script>
