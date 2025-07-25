<!-- /components/Modal.vue -->
<template>
    <Teleport to="body">
        <div
            class="modal fixed inset-0 flex items-center justify-center z-50"
            @click="closeModal"
        >
            <div
                class="modal-content max-w-[400px] w-full py-5 mx-3 bg-white rounded-md flex flex-col gap-5 text-center"
                @click.stop
            >
                <div class="w-full flex justify-end px-4">
                    <CloseIcon
                        :size="18"
                        @click="closeModal"
                        fillColor="#6a7282"
                        class="cursor-pointer"
                    />
                </div>

                <h2 v-if="$slots.title" class="text-lg font-medium px-8">
                    <slot name="title" />
                </h2>

                <p v-if="$slots.body" class="text-gray-500 px-8">
                    <slot name="body">
                        {{ body }}
                    </slot>
                </p>

                <hr />

                <div class="flex flex-col gap-3 px-4" v-if="$slots.footer">
                    <slot name="footer" />
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script>
import CloseIcon from "vue-material-design-icons/Close.vue";
import Button from "../components/Button.vue";
import DeleteOutlineIcon from "vue-material-design-icons/DeleteOutline.vue";

export default {
    components: { CloseIcon, DeleteOutlineIcon, Button },
    props: {
        title: { type: String, default: "Modal Title", required: true },
        body: {
            type: String,
        },
    },
    emits: ["close"],
    setup(_, { emit }) {
        const closeModal = () => emit("close");
        return { closeModal };
    },
};
</script>

<style scoped>
.modal {
    background-color: rgba(85, 97, 108, 0.25);
}
</style>
