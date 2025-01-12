<template>
  <div class="flex gap-4 border-t-2 border-gray-200 h-full rounded-md">
    <SessionStopped
      v-if="!isSessionActive"
      :startSession="startSession"
    />
    <SessionActive
      v-else
      :stopSession="stopSession"
      :sendTextMessage="sendTextMessage"
    />
  </div>
</template>

<script>
import { ref } from "vue";
import SessionStopped from "./SessionStopped.vue";
import SessionActive from "./SessionActive.vue";

export default {
  name: "SessionControls",
  components: {
    SessionStopped,
    SessionActive,
  },
  props: {
    startSession: {
      type: Function,
      required: true,
    },
    stopSession: {
      type: Function,
      required: true,
    },
    sendClientEvent: {
      type: Function,
      required: true,
    },
    sendTextMessage: {
      type: Function,
      required: true,
    },
    events: {
      type: Array,
      required: true,
    },
    isSessionActive: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<style scoped>
.flex {
  display: flex;
}
.gap-4 {
  gap: 1rem;
}
.border-t-2 {
  border-top-width: 2px;
}
.border-gray-200 {
  --tw-border-opacity: 1;
  border-color: rgba(229, 231, 235, var(--tw-border-opacity));
}
.h-full {
  height: 100%;
}
.rounded-md {
  border-radius: 0.375rem;
}
</style>
