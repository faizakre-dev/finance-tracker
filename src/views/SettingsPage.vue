<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Settings</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Preferences</ion-card-title>
        </ion-card-header>
        <ion-item>
          <ion-label>Currency</ion-label>
          <ion-select :value="settings.currency" interface="popover" @ion-change="changeCurrency">
            <ion-select-option v-for="code in currencies" :key="code" :value="code">
              {{ code }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Categories</ion-card-title>
          <ion-button fill="clear" size="small" @click="openAddModal">
            <ion-icon slot="start" :icon="add"></ion-icon>
            Add
          </ion-button>
        </ion-card-header>
        <ion-list>
          <ion-item v-for="category in categories" :key="category.id">
            <ion-icon
              slot="start"
              :icon="iconFor(category)"
              :style="{ color: category.color }"
            ></ion-icon>
            <ion-label>
              <h3>{{ category.name }}</h3>
              <p>{{ category.type }}</p>
            </ion-label>
            <ion-button fill="clear" size="small" @click="openEditModal(category)">Edit</ion-button>
            <ion-button fill="clear" size="small" color="danger" @click="confirmDelete(category)">
              Delete
            </ion-button>
          </ion-item>
        </ion-list>
      </ion-card>

      <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal">
        <CategoryForm :category="editingCategory" @save="handleSave" @cancel="closeModal" />
      </ion-modal>

      <ion-alert
        :is-open="isAlertOpen"
        header="Delete Category"
        message="Deleting a category does not delete its transactions. Continue?"
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonList,
  IonButton,
  IonIcon,
  IonModal,
  IonAlert,
} from "@ionic/vue";
import { add } from "ionicons/icons";
import {
  pricetag,
  restaurant,
  basket,
  car,
  receipt,
  bag,
  medkit,
  film,
  school,
  cash,
  wallet,
  trendingUp,
} from "ionicons/icons";
import { ref, computed, onMounted } from "vue";
import CategoryForm from "@/components/CategoryForm.vue";
import { useCategoriesStore } from "@/stores/categories";
import { useSettingsStore } from "@/stores/settings";
import type { Category } from "@/repositories/types";

const iconMap: Record<string, string> = {
  pricetag,
  restaurant,
  basket,
  car,
  receipt,
  bag,
  medkit,
  film,
  school,
  cash,
  wallet,
  "trending-up": trendingUp,
};

const categoriesStore = useCategoriesStore();
const settingsStore = useSettingsStore();

const currencies = ["USD", "EUR", "GBP", "MYR", "IDR", "SGD", "JPY", "INR", "AUD", "CAD"];

const isModalOpen = ref(false);
const editingCategory = ref<Category | null>(null);
const isAlertOpen = ref(false);
const categoryToDelete = ref<Category | null>(null);

const categories = computed(() => categoriesStore.categories);
const settings = computed(() => settingsStore.settings);

const alertButtons = [
  { text: "Cancel", role: "cancel", handler: () => closeAlert() },
  { text: "Delete", role: "destructive", handler: () => deleteCategory() },
];

onMounted(async () => {
  await Promise.all([categoriesStore.load(), settingsStore.load()]);
});

function iconFor(category: Category): string {
  return iconMap[category.icon] || pricetag;
}

async function changeCurrency(event: CustomEvent) {
  const currency = event.detail.value as string;
  await settingsStore.update({ currency });
}

function openAddModal() {
  editingCategory.value = null;
  isModalOpen.value = true;
}

function openEditModal(category: Category) {
  editingCategory.value = category;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  editingCategory.value = null;
}

async function handleSave(data: Omit<Category, "id">) {
  if (editingCategory.value) {
    await categoriesStore.updateCategory(editingCategory.value.id, data);
  } else {
    await categoriesStore.addCategory(data);
  }
  closeModal();
}

function confirmDelete(category: Category) {
  categoryToDelete.value = category;
  isAlertOpen.value = true;
}

function closeAlert() {
  isAlertOpen.value = false;
  categoryToDelete.value = null;
}

async function deleteCategory() {
  if (categoryToDelete.value) {
    await categoriesStore.deleteCategory(categoryToDelete.value.id);
  }
  closeAlert();
}
</script>
