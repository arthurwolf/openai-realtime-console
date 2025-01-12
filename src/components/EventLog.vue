<template>
  <v-container>
    <v-row v-for="event in events" :key="event.event_id" class="mb-2">
      <v-col>
        <v-card @click="toggleExpand(event.event_id)">
          <v-card-title>
            <v-icon v-if="isClientEvent(event)">mdi-arrow-down</v-icon>
            <v-icon v-else>mdi-arrow-up</v-icon>
            <span class="ml-2">{{ event.type }} | {{ timestamp }}</span>
          </v-card-title>
          <v-card-text v-if="expandedEvent === event.event_id">
            <pre>{{ JSON.stringify(event, null, 2) }}</pre>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from "vue";
import { mdiArrowDown, mdiArrowUp } from "@mdi/js";

export default {
  name: "EventLog",
  props: {
    events: {
      type: Array,
      required: true,
    },
  },
  setup() {
    const expandedEvent = ref(null);

    function toggleExpand(eventId) {
      expandedEvent.value = expandedEvent.value === eventId ? null : eventId;
    }

    function isClientEvent(event) {
      return event.event_id && !event.event_id.startsWith("event_");
    }

    return {
      expandedEvent,
      toggleExpand,
      isClientEvent,
      timestamp: new Date().toLocaleTimeString(),
    };
  },
};
</script>

<style scoped>
.v-card {
  cursor: pointer;
}
</style>
