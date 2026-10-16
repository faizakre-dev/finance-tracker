import { defineStore } from "pinia";
import { ref } from "vue";
import type { Category } from "../repositories/types";
import { categoryRepository } from "../repositories/repository";

export const useCategoriesStore = defineStore("categories", () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const loaded = ref(false);

  async function load() {
    if (loaded.value) return;
    loading.value = true;
    try {
      categories.value = await categoryRepository.getAll();
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function refresh() {
    loading.value = true;
    try {
      categories.value = await categoryRepository.getAll();
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function addCategory(data: Omit<Category, "id">) {
    const category = await categoryRepository.create(data);
    categories.value.push(category);
    return category;
  }

  async function updateCategory(id: string, updates: Partial<Omit<Category, "id">>) {
    const category = await categoryRepository.update(id, updates);
    if (category) {
      const index = categories.value.findIndex((c: Category) => c.id === id);
      if (index !== -1) categories.value[index] = category;
    }
    return category;
  }

  async function deleteCategory(id: string) {
    const success = await categoryRepository.delete(id);
    if (success) {
      categories.value = categories.value.filter((c: Category) => c.id !== id);
    }
    return success;
  }

  return {
    categories,
    loading,
    loaded,
    load,
    refresh,
    addCategory,
    updateCategory,
    deleteCategory,
  };
});
