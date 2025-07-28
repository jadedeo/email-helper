<!-- pages/TemplateEditorPage.vue -->
<template>
    <div class="w-full bg-gray-100 py-3 px-6 flex flex-col gap-3 h-dvh">
        <transition name="fade">
            <InfoBox
                v-if="showInfoBox && isEditingTemplate"
                heading="Your changes will be local"
                body="Changes made to this template will not update anyone else's, only yours, and will not be recorded unless explicitly saved."
                colored-bg
                dismissable
                @dismiss="showInfoBox = false"
            />
        </transition>

        <input
            type="text"
            v-model="templateTitle"
            placeholder="Template Title"
            class="standard font-bold !bg-white max-w-1/3"
        />

        <editor v-model="templateBody" />

        <div
            class="flex items-center"
            :class="isEditingTemplate ? 'justify-between' : 'justify-end'"
        >
            <Button
                v-if="isEditingTemplate"
                @button-click="handleDeleteTemplate"
                label="Delete template"
                variant="cancelLink"
            />

            <div class="flex justify-end gap-2 w-fill">
                <Button
                    label="Cancel"
                    variant="outlined"
                    class="!w-fit !px-10"
                    @button-click="handleCancelEditing"
                />
                <Button
                    v-if="!isEditingTemplate"
                    @button-click="createTemplate"
                    :disabled="disableCreateTemplate"
                    label="Create template"
                    class="!w-fit !px-10"
                />
                <Button
                    v-if="isEditingTemplate"
                    @button-click="saveTemplate"
                    :disabled="!hasUnsavedChanges"
                    label="Save"
                    class="!w-fit !px-10"
                />
            </div>
        </div>
    </div>
    <Modal v-if="isModalOpen" @close="isModalOpen = false">
        <template #title>
            <template v-if="modalType === 'delete'">
                You are about to permanently delete the
                <strong>"{{ templateTitle }}"</strong> template.
            </template>
            <template v-else-if="modalType === 'exitWithoutSaving'">
                You're about to lose all unsaved changes.
            </template>
        </template>

        <template #footer>
            <template v-if="modalType === 'delete'">
                <Button
                    label="Delete template"
                    variant="cancelFilled"
                    @button-click="handleConfirmDeleteTemplate"
                >
                    <DeleteOutlineIcon fillColor="#e7000b" :size="18" />
                </Button>
            </template>
            <template v-else-if="modalType === 'exitWithoutSaving'">
                <Button
                    label="Discard changes"
                    variant="cancelFilled"
                    @button-click="handleDiscardChanges"
                >
                    <DeleteOutlineIcon fillColor="#e7000b" :size="18" />
                </Button>
            </template>
        </template>
    </Modal>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { removeEmptyCustomInputs } from "../lib/utils.js";
import DeleteOutlineIcon from "vue-material-design-icons/DeleteOutline.vue";
import "../style.css";
import Editor from "../components/Editor.vue";
import Button from "../components/Button.vue";
import InfoBox from "../components/InfoBox.vue";
import Modal from "../components/Modal.vue";

const emit = defineEmits(["close"]);
const props = defineProps({
    templateToEdit: {
        type: Object,
        default: null,
    },
});

const templateTitle = ref("");
const templateBody = ref("");
const isEditingTemplate = ref(false);
const originalTemplate = ref(null);
const section = ref("Uncategorized Templates");
const showInfoBox = ref(true);
const isModalOpen = ref(false);
const modalType = ref("");

onMounted(() => {
    if (props.templateToEdit) {
        originalTemplate.value = props.templateToEdit;
        templateTitle.value = props.templateToEdit.title || "";
        templateBody.value = props.templateToEdit.body || "";
        section.value =
            props.templateToEdit.section || "Uncategorized Templates";
        isEditingTemplate.value = !!(
            props.templateToEdit.title && props.templateToEdit.body
        );
    }
});

const saveTemplate = () => {
    if (
        !originalTemplate.value ||
        !originalTemplate.value.id ||
        typeof chrome === "undefined" ||
        !chrome.storage
    ) {
        console.error("Invalid original template or missing Chrome APIs.");
        return;
    }

    // before saving template, remove any empty <custom-input>'s aka. inputs that don't have a label
    templateBody.value = removeEmptyCustomInputs(templateBody.value.trim());

    const updatedTemplate = {
        id: originalTemplate.value.id,
        title: templateTitle.value.trim(),
        body: templateBody.value.trim(),
        section: section.value,
    };

    chrome.storage.local.get(["templates"], (result) => {
        const existing = result.templates || [];

        const updatedTemplates = existing.map((t) =>
            t.id === updatedTemplate.id ? updatedTemplate : t
        );

        chrome.storage.local.set({ templates: updatedTemplates });
    });

    emit("navigate-to-templates-tab");
};

const createTemplate = () => {
    if (typeof chrome === "undefined" || !chrome.storage) {
        console.error("Chrome storage is not available.");
        return;
    }

    templateBody.value = removeEmptyCustomInputs(templateBody.value.trim());

    const newTemplate = {
        id: crypto.randomUUID(),
        title: templateTitle.value.trim(),
        body: templateBody.value.trim(),
        section: section.value || "Uncategorized Templates",
    };

    chrome.storage.local.get(["templates", "sections"], (result) => {
        const existingTemplates = result.templates || [];
        const existingSections = result.sections || [];

        existingTemplates.push(newTemplate);

        const cleanedSection =
            newTemplate.section.trim() || "Uncategorized Templates";

        // Only add if it doesn't exist already
        if (!existingSections.includes(cleanedSection)) {
            existingSections.push(cleanedSection);
        }

        chrome.storage.local.set({
            templates: existingTemplates,
            sections: existingSections,
        });
    });

    emit("navigate-to-templates-tab");
    // emit("close");
};

const disableCreateTemplate = computed(function () {
    return (
        templateTitle.value.trim() === "" || templateBody.value.trim() === ""
    );
});

const handleDeleteTemplate = () => {
    modalType.value = "delete";
    isModalOpen.value = true;
};

const hasUnsavedChanges = computed(() => {
    if (!originalTemplate.value) return false;

    const titleChanged =
        originalTemplate.value.title !== templateTitle.value.trim();
    const bodyChanged =
        originalTemplate.value.body !== templateBody.value.trim();

    return titleChanged || bodyChanged;
});

const handleCancelEditing = () => {
    if (!hasUnsavedChanges.value) {
        emit("navigate-to-templates-tab");

        // emit("close");
    } else {
        modalType.value = "exitWithoutSaving";
        isModalOpen.value = true;
    }
};

const handleDiscardChanges = () => {
    modalType.value = "";
    emit("navigate-to-templates-tab");

    // emit("close");
};

const handleConfirmDeleteTemplate = () => {
    if (!props.templateToEdit?.id) {
        console.error("No template to delete.");
        return;
    }

    const templateToDelete = props.templateToEdit.id;

    chrome.storage.local.get(["templates"], (result) => {
        const existingTemplates = result.templates || [];

        const updatedTemplates = existingTemplates.filter(
            (template) => template.id !== templateToDelete
        );

        chrome.storage.local.set({ templates: updatedTemplates }, () => {
            console.log("Template deleted.");
        });
    });

    isModalOpen.value = false;
    modalType.value = "";
    emit("navigate-to-templates-tab");
    // emit("close");
};
</script>
