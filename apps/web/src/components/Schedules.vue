<template>
  <div class="w-100 position-relative">
    <SelectButton
      v-model="viewOption"
      :options="schedulesViewOptions"
      optionLabel="label"
      optionValue="id"
      class="mb-3 text-center"
    />
    <SchedulesRules v-if="viewOption === 'rules'"></SchedulesRules>
    <SchedulesCalendar v-if="viewOption === 'calendar'"></SchedulesCalendar>
  </div>
</template>

<script lang="ts">
import SelectButton from 'primevue/selectbutton';
import { defineComponent } from 'vue';
import SchedulesCalendar from './SchedulesCalendar.vue';
import SchedulesRules from './SchedulesRules.vue';

export default defineComponent({
  name: 'schedules',
  components: { SelectButton, SchedulesCalendar, SchedulesRules },
  data() {
    return {
      schedulesViewOptions: [
        {
          id: 'rules',
          label: this.$t('schedules.viewOptions.rules'),
        },
        {
          id: 'calendar',
          label: this.$t('schedules.viewOptions.calendar'),
        },
      ],
      viewOption: 'rules',
    };
  },
  methods: {},
});
</script>

<style></style>
