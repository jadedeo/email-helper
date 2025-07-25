<!-- components/Button.vue -->

<template>
    <button
        :class="computedClass"
        class="flex justify-center items-center gap-1 min-w-fit"
        @click="$emit('button-click')"
        :disabled="disabled"
    >
        <slot></slot>
        {{ label }}
    </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    label: {
        type: String,
        required: false,
    },
    variant: {
        type: String,
        default: "filled",
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["button-click"]);

const computedClass = computed(() => {
    const base = "font-semibold";
    const cursor = props.disabled
        ? "opacity-25 cursor-not-allowed"
        : "cursor-pointer opacity-100";

    const variants = {
        filled: "w-full px-2 py-2 rounded-md bg-lime-700 text-white",
        cancelFilled:
            "w-full p-2 rounded-md bg-gray-50 text-red-600 border-1 border-gray-200",
        outlined:
            "w-full p-2 rounded-md border border-lime-700 bg-lime-50 text-lime-700",
        link: "underline underline-offset-2 text-lime-700 bg-transparent p-0",
        cancelLink:
            "underline underline-offset-2 text-red-600 bg-transparent px-0",
        activetab: "w-full px-2 py-2 rounded-md bg-lime-200 text-lime-800",
        inactivetab: "w-full px-2 py-2 rounded-md bg-gray-100 text-gray-500",
        editormenuitem: "rounded-full text-black hover:bg-gray-100 p-2",
    };

    return `${base} ${cursor} ${variants[props.variant] || variants.filled}`;
});
</script>

<style scoped></style>
