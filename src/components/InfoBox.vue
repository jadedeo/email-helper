<template>
    <div
        class="bg-gray-50 p-3 flex flex-col gap-2 rounded-md border-1 border-solid border-gray-100"
    >
        <h5 class="font-bold flex gap-2">
            <InformationIcon :size="18" fillColor="#4d7c0f" />{{ heading }}
        </h5>
        <p class="text-gray-500">
            {{ body }}
        </p>
    </div>
</template>

<script>
import InformationIcon from "vue-material-design-icons/Information.vue";

export default {
    components: {
        InformationIcon,
    },
    props: {
        heading: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: false,
        },
    },
    setup() {
        return {};
    },
};
</script>

<style scoped></style>
