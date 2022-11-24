<template>
  <div v-if="status.temp">
    <div class="w-100 flex flex-column">
      <h1 class="temp-current text-success flex sm:py-1 xl:py-0">
        <div class="sm:hidden xl:inline flex-grow-1">
          {{ $t('dashboard.currentTemp') }}
        </div>
        <div>{{ status.temp }} °C</div>
      </h1>
      <h2
        class="temp-set text-center flex justify-content-around flex sm:py-1 xl:py-0 cursor-pointer"
        @click="createInstantSchedule()"
      >
        <div class="sm:hidden xl:inline flex-grow-1 text-start">
          {{ $t('dashboard.targetTemp') }}
        </div>
        <div>{{ status.schedule?.set }} °C</div>
        <div class="align-self-end ps-1">
          <img
            v-if="status.temp < (status.schedule?.set || 0)"
            class="turned-icon"
            src="../assets/images/turn-on-icon.svg"
          />
          <img
            v-if="status.temp >= (status.schedule?.set || 0)"
            class="turned-icon"
            src="../assets/images/turn-off-icon.svg"
          />
        </div>
      </h2>
      <h3 class="sched-set text-center py-1" v-if="status.schedule">
        <div v-if="status.schedule.recurring">
          <span class="sm:hidden xl:inline"
            >{{ $t('dashboard.scheduled') }}
          </span>
          <div>
            {{ recurringFormatter.getREveryText(status.schedule.recurring) }}
          </div>
          <div v-if="status.schedule.recurring.days">
            {{
              recurringFormatter.getRDaysText(
                status.schedule.recurring.unit,
                status.schedule.recurring.days,
              )
            }}
          </div>
          <div>
            {{ recurringFormatter.getRIntervalText(status.schedule.recurring) }}
          </div>
        </div>
        <div v-else>
          {{ status.schedule.from }} - {{ status.schedule.to }}
        </div>
        <div></div>
      </h3>
    </div>
  </div>

  <div v-else>
    <h1 class="icon icon-spinner spin whole-screen"></h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import router from '../router';
import bus from '../services/EventBus';
import IdService from '../services/IdService';
import { RecurringFormatterService } from '../services/RecurringFormatterService';
import StatusService from '../services/StatusService';
import { Status } from '../types/status';

export default defineComponent({
  name: 'dashboard',
  data() {
    return {
      recurringFormatter: new RecurringFormatterService(this.$t),
      status: {} as Status,
    };
  },
  methods: {
    createInstantSchedule() {
      router.push({ name: 'scheduleInstant', params: {} });
    },
    getStatus(id: string) {
      StatusService.getStatus(id)
        .then((status: Status) => {
          this.status = status;
        })
        .catch((e: Error) => {
          bus.emit('toast', {
            type: 'error',
            message: this.$t('dashboard.messages.error.status.message'),
          });
          console.log(e);
        });
    },
  },
  mounted() {
    const id = IdService.retrieveId();
    if (id) {
      this.getStatus(id);
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
.sched-set {
  /* font-size: 5vh; */
}
.temp-current {
  /* font-size: 15vh; */
}
.temp-set {
  /* font-size: 12vh; */
}
.turned-icon {
  height: 5vh;
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
