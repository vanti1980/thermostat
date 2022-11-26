import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import en from './assets/i18n/en.json';
import hu from './assets/i18n/hu.json';
import router from './router';

const i18n = createI18n({
  locale: window.navigator.language,
  datetimeFormats: {
    hu: {
      date: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      },
      time: {
        hour: 'numeric',
        minute: 'numeric',
      },
      datetime: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
    en: {
      date: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      },
      time: {
        hour: 'numeric',
        minute: 'numeric',
      },
      datetime: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
  },
  fallbackLocale: 'en',
  messages: {
    hu,
    en,
  },
  numberFormats: {
    hu: {
      temp: {
        minimumFractionDigits: 1,
      },
    },
    en: {
      temp: {
        minimumFractionDigits: 1,
      },
    },
  },
});

const app = createApp(App);
app
  .use(router)
  .use(i18n)
  .use(PrimeVue)
  .use(ToastService)
  .use(ConfirmationService)
  .mount('#app');
