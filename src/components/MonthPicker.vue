<template>
  <ion-item>
    <ion-label>Month</ion-label>
    <ion-datetime-button datetime="month-picker"></ion-datetime-button>
    <ion-modal :keep-contents-mounted="true">
      <ion-datetime
        id="month-picker"
        presentation="month-year"
        :value="modelValue + '-01'"
        @ion-change="handleChange"
      ></ion-datetime>
    </ion-modal>
  </ion-item>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonDatetimeButton, IonModal, IonDatetime } from "@ionic/vue";

defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

function handleChange(event: CustomEvent) {
  const value = event.detail.value;
  if (typeof value === "string" && value.includes("-")) {
    const month = value.substring(0, 7);
    emit("update:modelValue", month);
  }
}
</script>
