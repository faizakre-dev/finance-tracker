<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ isEdit ? "Edit Budget" : "Add Budget" }}</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="emit('cancel')">Cancel</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-item>
      <ion-label>Category</ion-label>
      <ion-select v-model="form.categoryId" interface="popover" :disabled="isEdit">
        <ion-select-option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </ion-select-option>
      </ion-select>
    </ion-item>
    <ion-item>
      <ion-label position="floating">Monthly limit</ion-label>
      <ion-input v-model.number="form.limit" type="number" min="0" step="0.01"></ion-input>
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
import type { Budget, Category } from "@/repositories/types";

const props = defineProps<{
  budget?: Budget | null;
  month: string;
  categories: Category[];
}>();
const emit = defineEmits<{
  (e: "save", budget: Omit<Budget, "id">): void;
  (e: "cancel"): void;
}>();

const form = ref({
  categoryId: "",
  limit: 0,
});

const isEdit = computed(() => !!props.budget);
const isValid = computed(() => form.value.categoryId && form.value.limit > 0);

const expenseCategories = computed(() =>
  props.categories.filter((c) => c.type === "expense" || c.type === "both"),
);

watch(
  () => props.budget,
  (budget) => {
    if (budget) {
      form.value = { categoryId: budget.categoryId, limit: budget.limit };
    } else {
      form.value = { categoryId: "", limit: 0 };
    }
  },
  { immediate: true },
);

function save() {
  emit("save", {
    categoryId: form.value.categoryId,
    month: props.month,
    limit: form.value.limit,
  });
}
</script>
