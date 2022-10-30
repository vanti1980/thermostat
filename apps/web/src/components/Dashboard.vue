<template>
  <div v-if="status.temp">
    <p>Current temperature: {{ status.temp }}</p>
  </div>

  <div v-else>
    <br />
    <p>Loading...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import StatusService from '../services/StatusService';
import { Status } from '../types/status';

export default defineComponent({
  name: 'dashboard',
  data() {
    return {
      status: {} as Status,
    };
  },
  methods: {
    getStatus(id: string) {
      StatusService.getStatus(id)
        .then((status: Status) => {
          this.status = status;
          console.warn(status);
        })
        .catch((e: Error) => {
          console.log(e);
        });
    },
  },
  mounted() {
    const id = 'nwTKGCZVEMJCq_TIjlvjf8zJ7yFOAOEga3xnPeitsVc';
    this.getStatus(id);
  },
});
</script>

<style></style>
