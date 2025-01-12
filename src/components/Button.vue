<template>
  <v-btn :class="buttonClass" @click="onClick">
    <template v-if="icon">
      <v-icon>{{ icon }}</v-icon>
    </template>
    {{ children }}
  </v-btn>
</template>

<script>
export default {
  name: "Button",
  props: {
    icon: {
      type: String,
      default: null,
    },
    children: {
      type: String,
      default: "",
    },
    onClick: {
      type: Function,
      required: true,
    },
    className: {
      type: String,
      default: "",
    },
  },
  computed: {
    buttonClass() {
      return `bg-gray-800 text-white rounded-full p-4 flex items-center gap-1 hover:opacity-90 ${this.className}`;
    },
  },
};
</script>

<style scoped>
</style>
