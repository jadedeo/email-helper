<!--  src/components/Component.vue -->

<!-- TODO: don't allow user to "apply" empty custom input -->
<template>
    <node-view-wrapper class="custom-input">
        <!-- <label contenteditable="false">Vue Component</label> -->
        <template v-if="isEditing">
            <div
                class="flex items-center gap-1 bg-white drop-shadow-sm rounded-md p-2"
            >
                <div
                    class="flex items-center gap-2 h-fit rounded-full border-lime-500 border-1 border-solid px-2"
                >
                    <TextIcon fillColor="#000000" :size="16" />
                    <input
                        v-model="inputValue"
                        class="input focus:outline-none"
                        placeholder="Custom input field"
                    />
                </div>
                <Button
                    @click="apply"
                    label="Apply"
                    class="!bg-transparent !text-lime-700"
                ></Button>
            </div>
        </template>
        <template v-else>
            <div
                class="bg-lime-50 border-solid border-1 border-lime-500 py-1 px-2 rounded-full"
            >
                <span class="label" contenteditable="false">{{
                    node.attrs.label
                }}</span>
            </div>
        </template>
        <!-- <node-view-content class="content is-editable" /> -->
    </node-view-wrapper>
</template>

<script>
import {
    /*NodeViewContent,*/ nodeViewProps,
    NodeViewWrapper,
} from "@tiptap/vue-3";
import TextIcon from "vue-material-design-icons/Text.vue";

import Button from "../components/Button.vue";

export default {
    components: {
        NodeViewWrapper,
        // NodeViewContent,
        Button,
        TextIcon,
    },

    props: nodeViewProps,

    data() {
        return {
            inputValue: this.node.attrs.label,
            isEditing: !this.node.attrs.label,
        };
    },
    methods: {
        apply() {
            this.updateAttributes({
                label: this.inputValue.trim(),
            });
            this.isEditing = false;
        },
    },
};
</script>

<style scoped>
.custom-input {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.2rem 0.5rem;
    /* border: 1px solid #aaa;
    border-radius: 0.25rem; */
    /* background-color: #f3f3f3; */
}

.input {
    border: none;
    padding: 0.25rem;
    font-size: 0.875rem;
}

.label {
    font-weight: bold;
    /* color: #333; */
}

/* .tiptap .custom-input {
    background-color: lightgray;
    border: 2px solid gray;
    border-radius: 0.5rem;
    margin: 2rem 0;
    position: relative;
}

.tiptap .custom-input label {
    background-color: gray;
    border-radius: 0 0 0.5rem 0;
    color: white;
    font-size: 0.75rem;
    font-weight: bold;
    padding: 0.25rem 0.5rem;
    position: absolute;
    top: 0;
}

.tiptap .custom-input .content {
    margin-top: 1.5rem;
    padding: 1rem;
}

.tiptap .custom-input .content &.is-editable {
    border: 2px dashed darkgray;
    border-radius: 0.5rem;
    margin: 2.5rem 1rem 1rem;
    padding: 0.5rem;
} */
</style>
