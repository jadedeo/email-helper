<!-- components/CustomInputComponent.vue -->
<template>
    <node-view-wrapper class="custom-input">
        <template v-if="isEditing">
            <div
                class="flex flex-col gap-1 bg-white drop-shadow-sm rounded-t-md p-2 items-center"
            >
                <div class="flex items-center">
                    <div
                        class="flex items-center gap-2 h-fit rounded-full border-lime-500 border-1 border-solid px-2"
                    >
                        <TextIcon fillColor="#000000" :size="16" />
                        <input
                            v-model="inputValue"
                            class="input focus:outline-none capitalize"
                            placeholder="Custom input field"
                            autofocus
                        />
                    </div>

                    <div class="flex justify-end">
                        <Button
                            @click="apply"
                            label="Apply"
                            class="!bg-transparent !text-lime-700"
                        />
                    </div>
                </div>
                <ul
                    class="suggestions bg-white rounded-b-md max-h-20 overflow-y-auto !list-none !m-0 !p-0"
                >
                    <li
                        v-for="option in filteredOptions"
                        :key="option"
                        @click="selectOption(option)"
                        class="cursor-pointer px-3 py-1 hover:bg-lime-100"
                    >
                        {{ option }}
                    </li>
                </ul>
            </div>
        </template>

        <template v-else>
            <div
                class="bg-lime-50 border-solid border-1 border-lime-500 py-1 px-2 rounded-full"
                @click="isEditing = true"
            >
                <span class="label" contenteditable="false">
                    {{ node.attrs.label }}
                </span>
            </div>
        </template>
    </node-view-wrapper>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3";

import TextIcon from "vue-material-design-icons/Text.vue";
import Button from "./Button.vue";

const props = defineProps({ nodeViewProps });
const { deleteNode } = props;

const inputValue = ref(props.node.attrs.label || "");
const isEditing = ref(!props.node.attrs.label);
const defaultInputOptions = ref([]);

onMounted(() => {
    chrome.storage.local.get(["defaultInputOptions"], (result) => {
        defaultInputOptions.value = Array.isArray(result.defaultInputOptions)
            ? result.defaultInputOptions
            : [];
    });
});

const filteredOptions = computed(() => {
    const query = inputValue.value.trim().toLowerCase();
    if (!query) return defaultInputOptions.value;
    return defaultInputOptions.value.filter((opt) =>
        opt.toLowerCase().includes(query)
    );
});

const selectOption = (name) => {
    inputValue.value = name;
};

const apply = () => {
    const trimmed = inputValue.value.trim();

    if (!trimmed) {
        // remove custom input node if empty
        deleteNode();
        return;
    }

    props.updateAttributes({ label: trimmed });
    updateDefaultCustomInputs(trimmed);
    isEditing.value = false;
};

const updateDefaultCustomInputs = (newInput) => {
    chrome.storage.local.get(["defaultInputOptions"], (result) => {
        const options = Array.isArray(result.defaultInputOptions)
            ? result.defaultInputOptions
            : [];

        // dont add newinput if already present in defaults list
        if (options.includes(newInput)) {
            // console.log("input already exists.");
            return;
        }

        const updated = [...options, newInput];
        chrome.storage.local.set({ defaultInputOptions: updated });
    });
};
</script>

<style scoped>
.custom-input {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
}

.input {
    border: none;
    padding: 0.25rem;
}

.label {
    font-weight: bold;
}

.suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    z-index: 50;
    max-height: 5rem;
    overflow-y: auto;
}
</style>
