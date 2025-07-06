<!-- src/components/Button.vue -->

<template>
    <button
        v-if="variant == 'filled'"
        class="bg-lime-700 text-white font-bold w-full px-4 py-2 rounded-md"
        :class="
            disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer opacity-100'
        "
        @click="$emit('button-click')"
        :disabled="disabled"
    >
        {{ label }}
    </button>
    <button
        v-else-if="variant == 'outlined'"
        class="border-solid border-1 border-lime-700 bg-lime-50 font-bold text-lime-700 w-full px-4 py-2 rounded-md cursor-pointer"
        :class="
            disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer opacity-100'
        "
        @click="$emit('button-click')"
        :disabled="disabled"
    >
        {{ label }}
    </button>
    <button
        v-else-if="variant == 'link'"
        class="underline underline-offset-2 text-lime-700 cursor-pointer font-semibold"
        :class="
            disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer opacity-100'
        "
        @click="$emit('button-click')"
        :disabled="disabled"
    >
        {{ label }}
    </button>
    <button
        v-else-if="variant == 'activetab'"
        class="bg-lime-200 text-lime-800 font-bold w-full px-4 py-2 rounded-md"
        :class="
            disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer opacity-100'
        "
        @click="$emit('button-click')"
        :disabled="disabled"
    >
        {{ label }}
    </button>
    <button
        v-else-if="variant == 'inactivetab'"
        class="bg-gray-100 text-gray-500 font-bold w-full px-4 py-2 rounded-md"
        :class="
            disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer opacity-100'
        "
        @click="$emit('button-click')"
        :disabled="disabled"
    >
        {{ label }}
    </button>
</template>

<script>
export default {
    props: {
        label: {
            type: String,
            required: true,
        },
        variant: {
            type: String,
            required: false,
            default: "filled",
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    emits: ["button-click"],
    setup() {
        return {};
    },
};
</script>

<style scoped>
/* button:disabled {
    opacity: 50% !important;
    cursor: not-allowed !important;
} */
</style>
