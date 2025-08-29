<!-- components/SelectionsModal.vue -->
<template>
    <Teleport to="body">
        <div
            class="modal fixed inset-0 flex items-center justify-center z-50"
            @click=""
        >
            <div
                class="modal-content max-w-[400px] max-h-[400px] w-full py-5 mx-3 bg-white rounded-md flex flex-col gap-5 text-left"
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

                <div class="mx-5">
                    <h2>Update selections</h2>
                </div>
                <hr />

                <!-- scrollable, if necessary -->
                <div class="mx-5 overflow-y-auto flex-1">
                    <div
                        v-for="(group, sectionName) in groupedTemplates"
                        :key="sectionName"
                        class="mb-4"
                    >
                        <h3 class="font-semibold mb-2">{{ sectionName }}</h3>

                        <div class="flex flex-col gap-1">
                            <label
                                v-for="tpl in group"
                                :key="tpl.id"
                                class="flex items-center gap-2"
                            >
                                <input
                                    type="checkbox"
                                    :value="tpl.id"
                                    v-model="localSelectedIds"
                                />
                                {{ tpl.title }}
                            </label>
                        </div>
                    </div>
                </div>

                <div class="px-5 pt-5 border-t-1 border-solid border-gray-200">
                    <Button
                        variant="outlined"
                        label="Next"
                        @click="applyChanges"
                    />
                </div>
            </div></div
    ></Teleport>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { loadTemplatesAndSections } from "../lib/utils.js";

import Button from "../components/Button.vue";
import CloseIcon from "vue-material-design-icons/Close.vue";

import "../style.css";

const emit = defineEmits(["close"]);

const props = defineProps({
    selected: {
        type: Array,
        required: true,
    },
});

const templates = ref([]);
const sections = ref([]);

// create local array of selected template ids (excluding salutations)
const localSelectedIds = ref([]);

onMounted(async () => {
    const { templates: t, sections: s } = await loadTemplatesAndSections();
    templates.value = t;
    sections.value = s;

    localSelectedIds.value = props.selected
        .filter((tpl) => tpl.section !== "Salutations")
        .map((tpl) => tpl.id);
});

// group templates by section (excluding salutations)
const groupedTemplates = computed(() => {
    const groups = {};
    templates.value
        .filter((tpl) => tpl.section !== "Salutations")
        .forEach((tpl) => {
            if (!groups[tpl.section]) groups[tpl.section] = [];
            groups[tpl.section].push(tpl);
        });
    return groups;
});

// emit changes to parent (for now just close)
const applyChanges = () => {
    emit("close");
};

const closeModal = () => {
    emit("close");
};
</script>
