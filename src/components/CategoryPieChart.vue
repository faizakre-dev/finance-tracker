<template>
  <div class="chart-container">
    <canvas ref="canvasEl"></canvas>
    <p v-if="isEmpty" class="ion-text-center ion-padding">No expenses for this month yet.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const props = defineProps<{
  labels: string[];
  values: number[];
  colors: string[];
}>();

const canvasEl = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const isEmpty = computed(() => props.values.length === 0 || props.values.every((v) => v === 0));

function renderChart() {
  if (!canvasEl.value || isEmpty.value) return;
  chart?.destroy();
  chart = new Chart(canvasEl.value, {
    type: "doughnut",
    data: {
      labels: props.labels,
      datasets: [
        {
          data: props.values,
          backgroundColor: props.colors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

onMounted(renderChart);
onBeforeUnmount(() => chart?.destroy());

watch(
  () => [props.labels, props.values, props.colors],
  () => {
    if (isEmpty.value) {
      chart?.destroy();
      chart = null;
      return;
    }
    renderChart();
  },
  { deep: true },
);
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 260px;
  padding: 0 8px;
}
</style>
