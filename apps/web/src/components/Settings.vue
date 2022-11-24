<template>
  <div>
    <div class="control">
      <label for="id" class="form-label me-2">{{
        $t('settings.id.label')
      }}</label>
      <input
        id="id"
        v-model="id"
        class="form-control control"
        :placeholder="$t('settings.id.placeholder')"
      />
    </div>
    <div class="mt-4">
      <div class="flex justify-content-between">
        <span
          class="icon-btn icon-cancel text-danger"
          @click="retrieveId()"
        ></span>
        <span
          class="icon-btn icon-check_circle text-success"
          @click="storeId()"
        ></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IdService from '../services/IdService';

export default defineComponent({
  name: 'settings',
  data() {
    return {
      id: undefined as string | null | undefined,
    };
  },
  methods: {
    retrieveId(): void {
      this.id = IdService.retrieveId();
    },
    storeId(): void {
      if (this.id) {
        IdService.storeId(this.id);
      }
    },
  },
  beforeMount() {
    this.retrieveId();
  },
});
</script>

<style>
.control {
  font-size: 3vh;
}
.icon-btn {
  font-size: 8vh;
}
</style>
