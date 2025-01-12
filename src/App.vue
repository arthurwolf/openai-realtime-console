<template>
  <v-app>
    <v-navigation-drawer app>
      <v-list>
        <v-list-item>
          <v-img src="/assets/openai-logomark.svg" width="24" />
          <v-list-item-title>realtime console</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container>
        <EventLog :events="events" />
        <SessionControls
          :startSession="startSession"
          :stopSession="stopSession"
          :sendClientEvent="sendClientEvent"
          :sendTextMessage="sendTextMessage"
          :events="events"
          :isSessionActive="isSessionActive"
        />
        <ToolPanel
          :sendClientEvent="sendClientEvent"
          :sendTextMessage="sendTextMessage"
          :events="events"
          :isSessionActive="isSessionActive"
        />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ref, onMounted } from "vue";
import EventLog from "./EventLog.vue";
import SessionControls from "./SessionControls.vue";
import ToolPanel from "./ToolPanel.vue";

export default {
  name: "App",
  components: {
    EventLog,
    SessionControls,
    ToolPanel,
  },
  setup() {
    const isSessionActive = ref(false);
    const events = ref([]);
    const dataChannel = ref(null);
    const peerConnection = ref(null);
    const audioElement = ref(null);

    async function startSession() {
      const tokenResponse = await fetch("/token");
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      const pc = new RTCPeerConnection();

      audioElement.value = document.createElement("audio");
      audioElement.value.autoplay = true;
      pc.ontrack = (e) => (audioElement.value.srcObject = e.streams[0]);

      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      pc.addTrack(ms.getTracks()[0]);

      const dc = pc.createDataChannel("oai-events");
      dataChannel.value = dc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

      peerConnection.value = pc;
    }

    function stopSession() {
      if (dataChannel.value) {
        dataChannel.value.close();
      }
      if (peerConnection.value) {
        peerConnection.value.close();
      }

      isSessionActive.value = false;
      dataChannel.value = null;
      peerConnection.value = null;
    }

    function sendClientEvent(message) {
      if (dataChannel.value) {
        message.event_id = message.event_id || crypto.randomUUID();
        dataChannel.value.send(JSON.stringify(message));
        events.value = [message, ...events.value];
      } else {
        console.error(
          "Failed to send message - no data channel available",
          message
        );
      }
    }

    function sendTextMessage(message) {
      const event = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: message,
            },
          ],
        },
      };

      sendClientEvent(event);
      sendClientEvent({ type: "response.create" });
    }

    onMounted(() => {
      if (dataChannel.value) {
        dataChannel.value.addEventListener("message", (e) => {
          events.value = [JSON.parse(e.data), ...events.value];
        });

        dataChannel.value.addEventListener("open", () => {
          isSessionActive.value = true;
          events.value = [];
        });
      }
    });

    return {
      isSessionActive,
      events,
      startSession,
      stopSession,
      sendClientEvent,
      sendTextMessage,
    };
  },
};
</script>

<style scoped>
.v-navigation-drawer {
  width: 300px;
}
</style>
