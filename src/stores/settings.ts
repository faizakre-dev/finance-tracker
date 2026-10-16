import { defineStore } from "pinia";
import { ref } from "vue";
import type { Settings } from "@/repositories/types";
import { settingsRepository } from "@/repositories/repository";

export const useSettingsStore = defineStore("settings", () => {
  const settings = ref<Settings>({ currency: "USD" });
  const loading = ref(false);
  const loaded = ref(false);

  async function load() {
    if (loaded.value) return;
    loading.value = true;
    try {
      settings.value = await settingsRepository.get();
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function refresh() {
    loading.value = true;
    try {
      settings.value = await settingsRepository.get();
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function update(updates: Partial<Settings>) {
    const updated = await settingsRepository.update(updates);
    settings.value = updated;
    return updated;
  }

  return {
    settings,
    loading,
    loaded,
    load,
    refresh,
    update,
  };
});
