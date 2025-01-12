<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>Color Palette Tool</v-card-title>
          <v-card-text>
            <div v-if="isSessionActive">
              <div v-if="functionCallOutput">
                <FunctionCallOutput :functionCallOutput="functionCallOutput" />
              </div>
              <div v-else>
                Ask for advice on a color palette...
              </div>
            </div>
            <div v-else>
              Start the session to use this tool...
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, watch } from "vue";
import FunctionCallOutput from "./FunctionCallOutput.vue";

const functionDescription = `
Call this function when a user asks for a color palette.
`;

const sessionUpdate = {
  type: "session.update",
  session: {
    tools: [
      {
        type: "function",
        name: "display_color_palette",
        description: functionDescription,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            theme: {
              type: "string",
              description: "Description of the theme for the color scheme.",
            },
            colors: {
              type: "array",
              description: "Array of five hex color codes based on the theme.",
              items: {
                type: "string",
                description: "Hex color code",
              },
            },
          },
          required: ["theme", "colors"],
        },
      },
    ],
    tool_choice: "auto",
  },
};

export default {
  name: "ToolPanel",
  components: {
    FunctionCallOutput,
  },
  props: {
    isSessionActive: {
      type: Boolean,
      required: true,
    },
    sendClientEvent: {
      type: Function,
      required: true,
    },
    events: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const functionAdded = ref(false);
    const functionCallOutput = ref(null);

    watch(
      () => props.events,
      (events) => {
        if (!events || events.length === 0) return;

        const firstEvent = events[events.length - 1];
        if (!functionAdded.value && firstEvent.type === "session.created") {
          props.sendClientEvent(sessionUpdate);
          functionAdded.value = true;
        }

        const mostRecentEvent = events[0];
        if (
          mostRecentEvent.type === "response.done" &&
          mostRecentEvent.response.output
        ) {
          mostRecentEvent.response.output.forEach((output) => {
            if (
              output.type === "function_call" &&
              output.name === "display_color_palette"
            ) {
              functionCallOutput.value = output;
              setTimeout(() => {
                props.sendClientEvent({
                  type: "response.create",
                  response: {
                    instructions: `
                    ask for feedback about the color palette - don't repeat 
                    the colors, just ask if they like the colors.
                  `,
                  },
                });
              }, 500);
            }
          });
        }
      }
    );

    watch(
      () => props.isSessionActive,
      (isSessionActive) => {
        if (!isSessionActive) {
          functionAdded.value = false;
          functionCallOutput.value = null;
        }
      }
    );

    return {
      functionAdded,
      functionCallOutput,
    };
  },
};
</script>

<style scoped>
.v-card {
  cursor: pointer;
}
</style>
