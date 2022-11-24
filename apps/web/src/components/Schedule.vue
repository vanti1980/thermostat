<template>
  <div v-if="schedule" class="h-100 w-100">
    <div v-if="step === 1">
      <h2 class="text-6xl text-center flex align-items-center">
        <span>{{ $n(schedule?.set, 'temp') }}</span>
        <span> °C</span>
        <div class="flex flex-column mx-1 text-md" style="font-size: 5vh">
          <button class="push-btn px-2 pb-1 m-1" @click="changeTemp(+0.5)">
            +
          </button>
          <button class="push-btn px-2 pb-1 m-1" @click="changeTemp(-0.5)">
            -
          </button>
        </div>
      </h2>
      <div v-if="!recurring" class="flex justify-content-between gap-3">
        <div>
          <label for="from" class="block font-4xl">{{
            $t('schedule.from')
          }}</label>
          <Calendar
            id="from"
            v-model="from"
            :showTime="true"
            :timeOnly="true"
          ></Calendar>
        </div>
        <div>
          <label for="to" class="block font-4xl">{{ $t('schedule.to') }}</label>
          <Calendar
            id="to"
            v-model="to"
            :showTime="true"
            :timeOnly="true"
          ></Calendar>
        </div>
      </div>
      <div v-if="recurring" class="flex justify-content-between gap-3">
        <div>
          <label for="rFrom" class="block font-4xl">{{
            $t('schedule.from')
          }}</label>
          <Calendar
            id="rFrom"
            v-model="rFrom"
            :showTime="true"
            :timeOnly="true"
          ></Calendar>
        </div>
        <div>
          <label for="rTo" class="block font-4xl">{{
            $t('schedule.to')
          }}</label>
          <Calendar
            id="rTo"
            v-model="rTo"
            :showTime="true"
            :timeOnly="true"
          ></Calendar>
        </div>
      </div>
      <div class="flex my-3 gap-3">
        <InputSwitch v-model="recurring" />
        <span>{{ $t(`schedule.isRecurring.${recurring}`) }}</span>
      </div>

      <Button v-if="!recurring" @click="save()">
        {{ $t('common.button.save') }}
      </Button>
      <Button v-if="recurring" @click="step = 2">
        {{ $t('common.button.next') }}
      </Button>
    </div>

    <div v-if="step === 2">
      <div
        class="flex gap-3 align-items-center p-fluid justify-content-between"
      >
        <div class="my-3">{{ $t('schedule.every') }}</div>
        <div class="w-4">
          <InputNumber
            v-if="schedule.recurring?.unit !== 'd'"
            v-model="schedule.recurring!.count"
            :min="1"
            :max="4"
            showButtons
            suffix="."
          />
        </div>
      </div>
      <div class="my-3">
        <SelectButton
          v-model="rUnit"
          :options="unitOptions"
          optionLabel="label"
          optionValue="value"
        />
      </div>
      <div class="my-3">
        <AutoComplete
          v-if="schedule.recurring!.unit === 'w'"
          append-to="body"
          :dropdown="true"
          :multiple="true"
          v-model="rDays"
          :suggestions="filteredWeekdays"
          @complete="searchWeekdays($event)"
          optionLabel="label"
          optionValue="key"
          panel-class="autocomplete-panel"
        />
        <AutoComplete
          v-if="schedule.recurring!.unit === 'm'"
          append-to="body"
          :dropdown="true"
          :multiple="true"
          v-model="rDays"
          :suggestions="filteredDaysOfMonth"
          @complete="searchDaysOfMonth($event)"
          optionLabel="label"
          optionValue="key"
          panel-class="autocomplete-panel"
        />
      </div>
      <div class="flex my-3">
        <InputSwitch v-model="limitRecurring" />
        <span class="ml-2">{{
          $t(`schedule.limitRecurring.${limitRecurring}`)
        }}</span>
      </div>
      <div
        v-if="limitRecurring"
        class="flex justify-content-between gap-3 my-3"
      >
        <Calendar
          id="until"
          v-model="to"
          :showTime="false"
          :dateOnly="true"
          :touchUI="true"
        ></Calendar>
      </div>
      <div class="flex gap-3">
        <Button class="p-button-secondary" @click="step = 1">
          {{ $t('common.button.back') }}
        </Button>
        <Button @click="save()">
          {{ $t('common.button.save') }}
        </Button>
      </div>
    </div>
  </div>
  <div v-else>
    <h1 class="icon icon-spinner spin whole-screen"></h1>
  </div>
</template>

<script lang="ts">
import { endOfDay, format, formatISO, parse, parseISO } from 'date-fns';
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import SelectButton from 'primevue/selectbutton';
import router from '../router';
import { defineComponent } from 'vue';
import bus from '../services/EventBus';
import IdService from '../services/IdService';
import ScheduleService from '../services/ScheduleService';
import { Recurring, Schedule, ScheduleRequest } from '../types';

export type DayOption = {
  key: number;
  label: string;
};

export default defineComponent({
  name: 'schedule',
  components: {
    AutoComplete,
    Button,
    Calendar,
    InputNumber,
    InputSwitch,
    SelectButton,
  },
  data() {
    return {
      _daysOfMonth: [...Array(30).keys()].map(
        (key) =>
          ({
            key,
            label: '' + key,
          } as DayOption),
      ),
      _id: null as string | null,
      _recurring: false as boolean,
      _weekdays: [...Array(7).keys()].map(
        (key) =>
          ({
            key,
            label: this.$t(`schedule.weekDays.${key}`),
          } as DayOption),
      ),
      filteredDaysOfMonth: [] as DayOption[],
      filteredWeekdays: [] as DayOption[],
      limitRecurring: false as boolean,
      schedule: undefined as Schedule | ScheduleRequest | undefined,
      step: 1,
      unitOptions: [
        { label: this.$t('schedule.unit.d'), value: 'd' },
        { label: this.$t('schedule.unit.w'), value: 'w' },
        { label: this.$t('schedule.unit.m'), value: 'm' },
      ],
      get from() {
        return this.schedule?.from ? parseISO(this.schedule!.from) : undefined;
      },
      set from(val: Date | undefined) {
        this.schedule!.from = val ? formatISO(val) : undefined;
      },
      get recurring() {
        return this._recurring;
      },
      set recurring(val: boolean) {
        if (val !== this._recurring) {
          this._recurring = val;
          if (val) {
            this.schedule!.recurring = {
              unit: 'd',
              count: 1,
            };
            this.rFrom = this.from;
            this.rTo = this.to;
            this.from = undefined;
            this.to = undefined;
          } else {
            this.from = this.rFrom;
            this.to = this.rTo;
            this.rFrom = undefined;
            this.rTo = undefined;
            this.schedule!.recurring = undefined;
          }
        }
      },
      get rDays() {
        return (
          this.schedule!.recurring!.days?.map((key) => ({
            key,
            label:
              this.rUnit === 'w'
                ? this._weekdays.find((day) => day.key === key)?.label || ''
                : '' + key,
          })) || []
        );
      },
      set rDays(val: DayOption[]) {
        this.schedule!.recurring!.days = val.map((entry) => entry.key);
      },
      get rFrom() {
        return this.schedule?.recurring?.from
          ? parse(this.schedule.recurring.from, 'HHmm', new Date())
          : undefined;
      },
      set rFrom(val: Date | undefined) {
        this.schedule!.recurring!.from = val ? format(val, 'HHmm') : undefined;
      },
      get rUnit() {
        return this.schedule?.recurring?.unit || 'd';
      },
      set rUnit(val: Recurring['unit']) {
        if (val !== this.schedule!.recurring!.unit) {
          this.schedule!.recurring!.days = [];
        }
        this.schedule!.recurring!.unit = val;
      },
      get to() {
        return this.schedule?.to ? parseISO(this.schedule!.to) : undefined;
      },
      set to(val: Date | undefined) {
        this.schedule!.to = val ? format(val, 'HHmm') : undefined;
      },
      get rTo() {
        return this.schedule?.recurring?.to
          ? parse(this.schedule.recurring.to, 'HHmm', new Date())
          : undefined;
      },
      set rTo(val: Date | undefined) {
        this.schedule!.recurring!.to = val ? format(val, 'HHmm') : undefined;
      },
    };
  },
  methods: {
    _searchDays(
      event: { query: string },
      allDays: DayOption[],
      filterFn: (days: DayOption[]) => void,
    ) {
      setTimeout(() => {
        if (!event.query.trim().length) {
          filterFn([...allDays]);
        } else {
          filterFn(
            allDays.filter((day) => {
              return day.label
                .toLowerCase()
                .startsWith(event.query.toLowerCase());
            }),
          );
        }
      }, 250);
    },
    changeTemp(delta: number): void {
      this.schedule!.set += delta;
    },
    async getSchedule(
      id: string,
      scheduleId: string,
    ): Promise<Schedule | undefined> {
      return ScheduleService.getSchedule(id, scheduleId).catch((e: Error) => {
        console.log(e);
        bus.emit('toast', {
          type: 'error',
          message: this.$t('schedule.messages.error.schedule.message'),
        });
        return undefined;
      });
    },
    getId(): string | null {
      const id = IdService.retrieveId();
      if (!id) {
        bus.emit('toast', {
          type: 'error',
          message: this.$t('schedule.messages.error.id.message'),
        });
      }
      return id;
    },
    save(): void {
      if (!this._id) {
        bus.emit('toast', {
          type: 'error',
          message: this.$t('schedule.messages.error.id.message'),
        });
        return;
      }
      const save$ =
        'id' in this.schedule!
          ? ScheduleService.updateSchedule(
              this._id,
              this.schedule.id!,
              this.schedule,
            )
          : ScheduleService.createSchedule(this._id, this.schedule!);
      save$
      .then(schedule => {
        bus.emit('toast', {
          type: 'success',
          message: this.$t(`schedule.messages.success.${'id' in this.schedule! ? 'update': 'create'}`),
        });
        router.push({ name: 'schedules', params: {} });
      })
      .catch((e: Error) => {
        console.log(e);
        bus.emit('toast', {
          type: 'error',
          message: this.$t('schedule.messages.error.schedule.message'),
        });
        return undefined;
      });
    },
    searchDaysOfMonth(event: { query: string }) {
      this._searchDays(
        event,
        this._daysOfMonth,
        (filteredDays) => (this.filteredDaysOfMonth = filteredDays),
      );
    },
    searchWeekdays(event: { query: string }) {
      this._searchDays(
        event,
        this._weekdays,
        (filteredDays) => (this.filteredWeekdays = filteredDays),
      );
    },
  },
  async beforeMount(): Promise<void> {
    this._id = this.getId();
    if (this._id) {
      if (this.$route.params.scheduleId) {
        this.schedule = await this.getSchedule(
          this._id,
          this.$route.params.scheduleId as string,
        );
        this._recurring = !!this.schedule?.recurring;
      } else if (
        this.$route.name === 'scheduleInstant' &&
        this.$route.query.scheduleId
      ) {
        const schedule = await this.getSchedule(
          this._id,
          this.$route.query.scheduleId as string,
        );
        this.schedule = {
          set: schedule?.set || 22,
          from: formatISO(new Date(), { representation: 'complete' }),
          to:
            schedule?.to ||
            formatISO(endOfDay(new Date()), { representation: 'complete' }),
        };
      } else {
        this.schedule = {
          set: 21,
        };
      }
    }
  },
});
</script>

<style>
button {
  position: relative;
  overflow: hidden;
  transition: background 400ms;
  outline: 0;
  border: 0;
  border-radius: 25%;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.3);
  cursor: pointer;
}
.autocomplete-panel {
  max-height: 600px !important;
}
.font-largest {
  font-size: 15vh;
}
.font-larger {
  font-size: 12vh;
}
.v-input.font-larger {
  flex: 0 0 auto;
  transform: scale(2) translate(25%);
}
.turned-icon {
  height: 7vh;
  margin-top: -1rem;
}
span.ripple {
  position: absolute; /* The absolute position we mentioned earlier */
  border-radius: 50%;
  transform: scale(0);
  animation: ripple 600ms linear;
  background-color: rgba(255, 255, 255, 0.7);
}
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
</style>
