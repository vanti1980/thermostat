import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import PrimeVue from 'primevue/config';
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
      short: {
        year: 'numeric', month: 'numeric', day: 'numeric'
      },
    },
    en: {
      short: {
        year: 'numeric', month: 'numeric', day: 'numeric'
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
app.use(router).use(i18n).use(PrimeVue).use(ToastService).mount('#app');
