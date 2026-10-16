<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import { useRouter } from "vue-router";

const router = useRouter();
let backButtonHandle: PluginListenerHandle | undefined;

onMounted(async () => {
  if (Capacitor.getPlatform() !== "android") return;
  backButtonHandle = await CapacitorApp.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) {
      router.back();
    } else {
      void CapacitorApp.exitApp();
    }
  });
});

onUnmounted(async () => {
  await backButtonHandle?.remove();
});
</script>
