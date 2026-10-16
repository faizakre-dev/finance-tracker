<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ isEdit ? "Edit Category" : "Add Category" }}</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="emit('cancel')">Cancel</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-item>
      <ion-label position="floating">Name</ion-label>
      <ion-input v-model="form.name" type="text"></ion-input>
    </ion-item>
    <ion-item>
      <ion-label>Type</ion-label>
      <ion-select v-model="form.type" interface="popover">
        <ion-select-option value="expense">Expense</ion-select-option>
        <ion-select-option value="income">Income</ion-select-option>
        <ion-select-option value="both">Both</ion-select-option>
      </ion-select>
    </ion-item>
    <ion-item>
      <ion-label>Icon</ion-label>
      <ion-select v-model="form.icon" interface="popover">
        <ion-select-option v-for="iconName in iconOptions" :key="iconName" :value="iconName">
          {{ iconName }}
        </ion-select-option>
      </ion-select>
    </ion-item>
    <ion-item>
      <ion-label>Color</ion-label>
      <input v-model="form.color" type="color" class="color-input" />
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
import type { Category } from "@/repositories/types";

const props = defineProps<{ category?: Category | null }>();
const emit = defineEmits<{
  (e: "save", category: Omit<Category, "id">): void;
  (e: "cancel"): void;
}>();

const iconOptions = [
  "pricetag",
  "restaurant",
  "basket",
  "car",
  "receipt",
  "bag",
  "medkit",
  "film",
  "school",
  "cash",
  "wallet",
  "trending-up",
];

const form = ref({
  name: "",
  type: "expense" as Category["type"],
  icon: "pricetag",
  color: "#64748b",
});

const isEdit = computed(() => !!props.category);
const isValid = computed(() => form.value.name.trim().length > 0);

watch(
  () => props.category,
  (category) => {
    if (category) {
      form.value = {
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
      };
    } else {
      form.value = { name: "", type: "expense", icon: "pricetag", color: "#64748b" };
    }
  },
  { immediate: true },
);

function save() {
  emit("save", {
    name: form.value.name.trim(),
    type: form.value.type,
    icon: form.value.icon,
    color: form.value.color,
  });
}
</script>

<style scoped>
.color-input {
  width: 48px;
  height: 32px;
  border: none;
  background: transparent;
}
</style>
