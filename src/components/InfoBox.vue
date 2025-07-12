<template>
    <div
        class="bg-gray-50 p-3 flex flex-col gap-2 rounded-md border-1 border-solid border-gray-100"
        :class="
            coloredBg
                ? 'bg-lime-50 border-gray-200'
                : 'bg-gray-5 border-gray-100'
        "
    >
        <div class="flex justify-between">
            <h5 class="font-bold flex gap-2">
                <InformationIcon :size="18" fillColor="#4d7c0f" />{{ heading }}
            </h5>
            <CloseIcon
                v-if="dismissable"
                :size="18"
                fillColor="#6a7282"
                @click="handleDismiss"
            />
        </div>

        <p class="text-gray-500">
            {{ body }}
        </p>
    </div>
</template>

<script>
import { defineEmits } from "vue";
import InformationIcon from "vue-material-design-icons/Information.vue";
import CloseIcon from "vue-material-design-icons/Close.vue";

export default {
    components: {
        InformationIcon,
        CloseIcon,
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
        coloredBg: {
            type: Boolean,
            require: false,
            default: false,
        },
        dismissable: {
            type: Boolean,
            require: false,
            default: false,
        },
    },
    setup(_, { emit }) {
        const handleDismiss = () => {
            emit("dismiss");
        };
        return { handleDismiss };
    },
};
</script>

<style scoped></style>
