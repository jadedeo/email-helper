<!-- src/components/TextInput.vue -->

<!-- TODO: finish this component & replace inputs throughout -->
<template>
    <div>
        <label class="text-bold">{{ label }}</label
        ><input type="text" />
    </div>
</template>

<script>
export default {
    props: {
        label: {
            type: String,
            required: false,
        },
        variant: {
            type: String,
            default: "default",
        },
        layout: {
            type: String,
            default: "vertical",
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const computedClass = computed(() => {
            const base = " font-bold";
            const cursor = props.disabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer opacity-100";

            const variants = {
                outlined: "border-1 border-solid border-gray-200 rounded-md",
            };

            return `${base} ${cursor} ${
                variants[props.variant] || variants.filled
            }`;
        });

        return { computedClass };
    },
};
</script>

<styles scoped>
</styles>
