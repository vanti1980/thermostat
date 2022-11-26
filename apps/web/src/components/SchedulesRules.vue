<template>
  <div v-if="schedules" class="w-100">
    <OrderList
      v-model="schedules"
      listStyle="height:auto"
      dataKey="id"
      @reorder="reorder()"
    >
      <template #header> {{ $t('schedules.header') }} </template>
      <template #item="slotProps">
        <div class="p-scheduleitem flex">
          <div class="flex-grow-1">
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
            <div v-else>
              {{ $d(slotProps.item.from, 'datetime') }} -
              {{ $d(slotProps.item.to, 'datetime') }}
            </div>
          </div>
          <div class="flex flex-column justify-content-around">
            <Button
              class="bg-white text-black"
              icon="pi pi-pencil"
              @click="open(slotProps.item.id)"
            />
            <ConfirmPopup></ConfirmPopup>
            <Button
              class="bg-red-600"
              icon="pi pi-trash"
              @click="remove($event, slotProps.item.id)"
            />
          </div>
        </div>
      </template>
    </OrderList>
    <div class="flex justify-content-end mt-2 mx-3">
      <Button icon="pi pi-plus" @click="openNew()" />
    </div>
  </div>

  <div v-else class="flex justify-content-center align-items-center mt-8 pt-8">
    <ProgressSpinner />
  </div>
</template>

<script lang="ts">
import Button from 'primevue/button';
import ConfirmPopup from 'primevue/confirmpopup';
import OrderList from 'primevue/orderlist';
import ProgressSpinner from 'primevue/progressspinner';
import { defineComponent } from 'vue';
import router from '../router';
import bus from '../services/EventBus';
import IdService from '../services/IdService';
import { RecurringFormatterService } from '../services/RecurringFormatterService';
import ScheduleService from '../services/ScheduleService';
import { Schedule } from '../types';

export default defineComponent({
  name: 'schedules',
  components: { Button, ConfirmPopup, OrderList, ProgressSpinner },
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
    openNew() {
      router.push({ name: 'scheduleNew' });
    },
    remove($event: Event, scheduleId: string) {
      this.$confirm.require({
        target: $event!.currentTarget as HTMLElement | undefined,
        message: this.$t('schedules.messages.confirm.delete'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          ScheduleService.deleteSchedule(this._id!, scheduleId)
            .then(() => {
              bus.emit('toast', {
                type: 'success',
                message: this.$t('schedules.messages.success.delete'),
              });
              this.getSchedules(this._id!);
            })
            .catch((e: Error) => {
              bus.emit('toast', {
                type: 'error',
                message: this.$t('schedules.messages.error.delete'),
              });
              console.log(e);
            });
        },
        reject: () => {
          //callback to execute when user rejects the action
        },
      });
    },
    reorder() {
      ScheduleService.reorder(this._id!, this.schedules || []).catch(
        (e: Error) => {
          bus.emit('toast', {
            type: 'error',
            message: this.$t('schedules.messages.error.schedules.message'),
          });
          console.log(e);
        },
      );
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

<style>
.p-orderlist .p-orderlist-header {
  padding: 0 1rem;
}
</style>
