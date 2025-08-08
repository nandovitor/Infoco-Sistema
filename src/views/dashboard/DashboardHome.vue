
<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '@/stores/data';
import Card from '@/components/ui/Card.vue';
import { Users, ListChecks, Landmark, DollarSign } from 'lucide-vue-next';

const dataStore = useDataStore();

const totalEmployees = computed(() => dataStore.employees.length);
const pendingTasks = computed(() => dataStore.tasks.filter(t => t.status === 'Pendente').length);
const totalMunicipalities = computed(() => dataStore.financeData.length);

const totalPendingValue = computed(() => {
    const total = dataStore.financeData.reduce((acc, curr) => acc + curr.pending, 0);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total);
});

// TODO: Integrar uma biblioteca de gráficos para Vue (ex: vue-chartjs, ECharts)
const chartData = [
  { name: 'Jan', value: 4000 },
  { name: 'Fev', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Abr', value: 2780 },
  { name: 'Mai', value: 1890 },
  { name: 'Jun', value: 2390 },
];
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
    
    <!-- Cards de Métricas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card class="flex items-center p-6">
        <div class="p-4 bg-blue-100 rounded-full">
          <Users class="text-blue-600" :size="32" />
        </div>
        <div class="ml-4">
          <p class="text-sm text-gray-500">Total de Funcionários</p>
          <p class="text-2xl font-bold text-gray-800">{{ totalEmployees }}</p>
        </div>
      </Card>
      <Card class="flex items-center p-6">
        <div class="p-4 bg-orange-100 rounded-full">
          <ListChecks class="text-orange-600" :size="32" />
        </div>
        <div class="ml-4">
          <p class="text-sm text-gray-500">Tarefas Pendentes</p>
          <p class="text-2xl font-bold text-gray-800">{{ pendingTasks }}</p>
        </div>
      </Card>
      <Card class="flex items-center p-6">
        <div class="p-4 bg-green-100 rounded-full">
          <Landmark class="text-green-600" :size="32" />
        </div>
        <div class="ml-4">
          <p class="text-sm text-gray-500">Total de Municípios</p>
          <p class="text-2xl font-bold text-gray-800">{{ totalMunicipalities }}</p>
        </div>
      </Card>
      <Card class="flex items-center p-6">
        <div class="p-4 bg-red-100 rounded-full">
          <DollarSign class="text-red-600" :size="32" />
        </div>
        <div class="ml-4">
          <p class="text-sm text-gray-500">Valor Pendente</p>
          <p class="text-2xl font-bold text-gray-800">{{ totalPendingValue }}</p>
        </div>
      </Card>
    </div>

    <!-- Seção de Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h3 class="text-lg font-semibold p-6 border-b">Receita Mensal (Exemplo)</h3>
        <div class="p-6 h-80 flex items-center justify-center text-gray-400">
          <!-- Placeholder para o gráfico -->
          <p>[Placeholder para Gráfico de Barras]</p>
          <p class="text-xs mt-2">Adicionar biblioteca como vue-chartjs</p>
        </div>
      </Card>
      <Card>
        <h3 class="text-lg font-semibold p-6 border-b">Distribuição de Tarefas (Exemplo)</h3>
        <div class="p-6 h-80 flex items-center justify-center text-gray-400">
          <!-- Placeholder para o gráfico -->
          <p>[Placeholder para Gráfico de Pizza]</p>
        </div>
      </Card>
    </div>
  </div>
</template>
