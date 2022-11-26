<template>
  <div id="app" class="flex flex-column">
    <Toast />

    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <router-link to="/" class="navbar-brand"></router-link>
      <div class="navbar-nav mr-auto w-100 justify-content-between">
        <li class="nav-item">
          <router-link to="/dashboard" class="nav-link">
            <span class="icon-home mr-1"></span>
            <span class="hidden lg:inline">{{ $t('menu.dashboard') }}</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/schedules" class="nav-link">
            <span class="icon-access_time mr-1"></span>
            <span class="hidden lg:inline">{{ $t('menu.schedules') }}</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/settings" class="nav-link">
            <span class="icon-settings mr-1"></span>
            <span class="hidden lg:inline">{{ $t('menu.settings') }}</span>
          </router-link>
        </li>
      </div>
    </nav>

    <div
      class="mt-3 flex-grow-1 d-flex justify-content-center sm:mx-1 xl:mx-3"
    >
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import bus from './services/EventBus';

import Toast from 'primevue/toast';

export default defineComponent({
  name: 'App',
  components: { Toast },
  data() {
    return {};
  },
  methods: {},
  mounted(): void {
    bus.on('toast', (msg) =>
      this.$toast.add({
        severity: msg.type,
        detail: msg.message,
        life: msg.type === 'error' ? 0 : 3000,
      }),
    );
  },
  unmounted(): void {
    bus.off('*');
  },
});
</script>
<style>
@import 'https://unpkg.com/primeflex@^3/primeflex.css';
@import 'primevue/resources/themes/saga-blue/theme.css';
@import 'primevue/resources/primevue.min.css';
@import 'primeicons/primeicons.css';

@import './assets/css/fonts.css';
@import './assets/css/spin.css';
@import './assets/css/toast.css';

.navbar {
  /* font-size: 5vh; */
}

.p-datepicker .p-datepicker-calendar-container table td > span {
    width: 1.25rem;
    height: 1.25rem;
}

#app {
  height: 100vh;
}

html {
  font-size: 48px;
}
</style>
