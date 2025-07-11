<!-- src/windows/create-template/CreateTemplate.vue -->
<template>
    <div class="w-full bg-gray-100 p-10 flex flex-col gap-5 h-dvh">
        <!-- <p>isEditingTemplate: {{ isEditingTemplate }}</p>
        <p>disableSaveTemplate: {{ disableSaveTemplate }}</p> -->
        <!-- <div class="flex gap-2"> -->
        <input
            type="text"
            v-model="templateTitle"
            placeholder="Untitled Template"
            class="text-lg font-bold !border-none !p-0 placeholder-gray-600"
        />

        <editor v-model="templateBody" />

        <!-- FOR TESTING PURPOSES -->
        <div class="output-group text-gray-500">
            <!-- <label>Content:</label> -->
            <code>{{ templateTitle }}</code>
            <code>{{ templateBody }}</code>
        </div>
        <div class="flex justify-between items-center">
            <Button
                @button-click="handleDeleteTemplate"
                label="Delete template"
                variant="link"
                class="!text-red-500"
            />
            <div class="flex justify-end gap-2 w-fill">
                <Button
                    @button-click="closeCreateTemplate"
                    label="Cancel"
                    variant="outlined"
                    class="!w-fit !px-10"
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
                    :disabled="disableSaveTemplate"
                    label="Save template"
                    class="!w-fit !px-10"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
import DeleteIcon from "vue-material-design-icons/Delete.vue";
import "../../../src/style.css";
import Editor from "../../components/Editor.vue";
import Button from "../../components/Button.vue";
// import CustomInputComponent from "../../components/CustomInputComponent.vue";

export default {
    components: {
        Editor,
        Button,
        DeleteIcon,
    },
    setup() {
        const templateTitle = ref("");
        const templateBody = ref("");
        const isEditingTemplate = ref(false);
        const originalTemplate = ref(null);
        const section = ref("Uncategorized Templates");

        onMounted(() => {
            chrome.storage.session.get(["templateToEdit"], (result) => {
                if (result.templateToEdit) {
                    originalTemplate.value = result.templateToEdit;

                    templateTitle.value = result.templateToEdit.title || "";
                    templateBody.value = result.templateToEdit.body || "";
                    section.value =
                        result.templateToEdit.section ||
                        "Uncategorized Templates";
                    if (
                        result.templateToEdit.title &&
                        result.templateToEdit.body
                    ) {
                        isEditingTemplate.value = true;
                    }
                }
            });

            window.addEventListener("beforeunload", clearTemplateToEdit);
        });

        onUnmounted(() => {
            window.removeEventListener("beforeunload", clearTemplateToEdit);
        });

        const clearTemplateToEdit = () => {
            chrome.storage.session.remove("templateToEdit");
        };

        const saveTemplate = () => {
            if (
                !originalTemplate.value ||
                !originalTemplate.value.id ||
                typeof chrome === "undefined" ||
                !chrome.storage
            ) {
                console.error(
                    "Invalid original template or missing Chrome APIs."
                );
                return;
            }

            const updatedTemplate = {
                id: originalTemplate.value.id,
                title: templateTitle.value.trim(),
                body: templateBody.value.trim(),
                section: section.value,
                // section: originalTemplate.value.section,
            };

            chrome.storage.local.get(["templates"], (result) => {
                const existing = result.templates || [];

                const updatedTemplates = existing.map((t) =>
                    t.id === updatedTemplate.id ? updatedTemplate : t
                );

                chrome.storage.local.set(
                    { templates: updatedTemplates },
                    () => {
                        window.close();
                    }
                );
            });
        };

        const disableSaveTemplate = computed(() => {
            if (isEditingTemplate) {
                if (!originalTemplate.value) return true;

                const titleUnchanged =
                    originalTemplate.value.title === templateTitle.value.trim();
                const bodyUnchanged =
                    originalTemplate.value.body === templateBody.value.trim();

                return titleUnchanged && bodyUnchanged;
            }
            return true;
        });

        const createTemplate = () => {
            if (typeof chrome === "undefined" || !chrome.storage) {
                console.error("Chrome storage is not available.");
                return;
            }

            const newTemplate = {
                id: crypto.randomUUID(),
                title: templateTitle.value.trim(),
                body: templateBody.value.trim(),
                section: section.value,
                // section: "Uncategorized Templates",
            };

            chrome.storage.local.get(["templates"], (result) => {
                const existing = result.templates || [];
                existing.push(newTemplate);
                chrome.storage.local.set({ templates: existing }, () => {
                    window.close();
                });
            });
        };

        const disableCreateTemplate = computed(function () {
            return (
                templateTitle.value.trim() === "" ||
                templateBody.value.trim() === ""
            );
        });

        const closeCreateTemplate = () => {
            // console.log("CLOSE CREATE TEMPLATE WINDOW");
            window.close();
        };

        const handleDeleteTemplate = () => {
            console.log("handleDeleteTemplate");
        };

        return {
            section,
            templateTitle,
            templateBody,
            isEditingTemplate,
            clearTemplateToEdit,
            handleDeleteTemplate,
            disableCreateTemplate,
            saveTemplate,
            disableSaveTemplate,
            closeCreateTemplate,
            createTemplate,
        };
    },
};
</script>
