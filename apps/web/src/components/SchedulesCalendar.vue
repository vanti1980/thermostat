<template>
  <div v-if="schedules" class="w-100 flex flex-column fc-container">
    <FullCalendar ref="fullCalendar" :options="options" class="flex-grow-1"></FullCalendar>
  </div>

  <div v-else class="flex justify-content-center align-items-center mt-8 pt-8">
    <ProgressSpinner />
  </div>
</template>

<script lang="ts">
import '@fullcalendar/core';

import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar, { CalendarApi, CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/vue3';
import { formatISO, parseISO } from 'date-fns';
import ProgressSpinner from 'primevue/progressspinner';
import { defineComponent } from 'vue';
import { schedulesAsEvents } from '../functions/schedules-as-events';
import router from '../router';
import bus from '../services/EventBus';
import IdService from '../services/IdService';
import { RecurringFormatterService } from '../services/RecurringFormatterService';
import ScheduleService from '../services/ScheduleService';
import { Schedule } from '../types';

export default defineComponent({
  name: 'schedules',
  components: { FullCalendar, ProgressSpinner },
  data() {
    return {
      _id: null as string | null,
      options: {
        allDaySlot: false,
        plugins: [timeGridPlugin, interactionPlugin],
        initialDate: formatISO(new Date()),
        initialView: 'timeGridDay',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: '',
        },
        editable: true,
        eventClick: (evt) => this.clickEvent(evt),
        eventTimeFormat: {
          hour: '2-digit',
          hour12: false,
          minute: '2-digit',
          meridiem: false,
        },
        events: [],
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        slotLabelFormat: {
          hour: '2-digit',
          hour12: false,
          minute: '2-digit',
          meridiem: false,
        },
        titleFormat: {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        },
      } as CalendarOptions,
      recurringFormatter: new RecurringFormatterService(this.$t),
      schedules: undefined as Schedule[] | undefined,
    };
  },
  methods: {
    clickEvent(evt: EventClickArg) {
      router.push({ name: 'schedule', params: { scheduleId: evt.event.id } });
    },
    getEvents(date?: Date): EventInput[] {
      date = date || parseISO(this.options.initialDate!);
      const events = schedulesAsEvents(this.schedules || [], date);
      return events;
    },
    async getSchedules(id: string) {
      try {
        const schedules = await ScheduleService.getSchedules(id, 'all');
        this.schedules = schedules;
      } catch (e: any) {
        bus.emit('toast', {
          type: 'error',
          message: this.$t('schedules.messages.error.schedules.message'),
        });
        console.log(e);
      }
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
  async mounted() {
    this._id = IdService.retrieveId();
    if (this._id) {
      await this.getSchedules(this._id);
      this.options.events = this.getEvents();
      let calendarApi: CalendarApi = (this.$refs.fullCalendar as any).getApi();
      const oldNextFn = calendarApi.next.bind(calendarApi);
      calendarApi.next = () => {
        oldNextFn();
        this.options.events = this.getEvents(calendarApi.getCurrentData().currentDate);
      }
      const oldPrevFn = calendarApi.prev.bind(calendarApi);
      calendarApi.prev = () => {
        oldPrevFn();
        this.options.events = this.getEvents(calendarApi.getCurrentData().currentDate);
      }
    }
  },
});
</script>

<style>
.fc-container {
  height: calc(100% - 5rem);
}
</style>
