<template>
  <div v-if="schedules" class="w-100">
    <OrderList v-model="schedules" listStyle="height:auto" dataKey="id">
      <template #header> {{ $t('schedules.header') }} </template>
      <template #item="slotProps">
        <div class="p-scheduleitem" @click="open(slotProps.item.id)">
          <div class="p-scheduleset">{{ slotProps.item.set }} °C</div>
          <div v-if="slotProps.item.recurring">
            <span class="sm:hidden xl:inline"
              >{{ $t('dashboard.scheduled') }}
            </span>
            <div>
              {{ recurringFormatter.getREveryText(slotProps.item.recurring) }}
            </div>
            <div v-if="slotProps.item.recurring.days">
              {{
                recurringFormatter.getRDaysText(
                  slotProps.item.recurring.unit,
                  slotProps.item.recurring.days,
                )
              }}
            </div>
            <div>
              {{
                recurringFormatter.getRIntervalText(slotProps.item.recurring)
              }}
            </div>
          </div>
          <div v-else>{{ slotProps.item.from }} - {{ slotProps.item.to }}</div>
        </div>
      </template>
    </OrderList>
  </div>

  <div v-else>
    <h1 class="icon icon-spinner spin whole-screen"></h1>
  </div>
</template>

<script lang="ts">
import OrderList from 'primevue/orderlist';
import { defineComponent } from 'vue';
import router from '../router';
import bus from '../services/EventBus';
import IdService from '../services/IdService';
import { RecurringFormatterService } from '../services/RecurringFormatterService';
import ScheduleService from '../services/ScheduleService';
import { Schedule } from '../types';

export default defineComponent({
  name: 'schedules',
  components: { OrderList },
  data() {
    return {
      _id: null as string | null,
      recurringFormatter: new RecurringFormatterService(this.$t),
      schedules: undefined as Schedule[] | undefined,
    };
  },
  methods: {
    getSchedules(id: string) {
      ScheduleService.getSchedules(id, 'all')
        .then((schedules: Schedule[]) => {
          this.schedules = schedules;
        })
        .catch((e: Error) => {
          bus.emit('toast', {
            type: 'error',
            message: this.$t('schedules.messages.error.schedules.message'),
          });
          console.log(e);
        });
    },
    open(scheduleId: string) {
      router.push({ name: 'schedule', params: { scheduleId } });
    },
  },
  mounted() {
    this._id = IdService.retrieveId();
    if (this._id) {
      this.getSchedules(this._id);
    }
  },
});
</script>

<style></style>
