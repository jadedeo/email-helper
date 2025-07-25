<!-- src/pages/TemplateTab.vue -->
<template>
    <div class="flex justify-center bg-white">
        <div class="flex flex-col mb-6 max-w-[550px] bg-white">
            <section class="flex flex-col gap-2 px-6 mb-5">
                <!-- TODO: update with new greeting/sign-off designs -->
                <h2>Salutation</h2>
                <InfoBox
                    heading="Salutations are automatically applied"
                    body="Greetings and sign-off salutations are applied to all email
                    responses, regardless of which template is used."
                />

                <div
                    :class="
                        !greetingTemplate && !signOffTemplate
                            ? 'flex gap-3'
                            : ''
                    "
                >
                    <div>
                        <!-- TODO: make this into a component, substitute in draggable area too -->
                        <div
                            v-if="greetingTemplate"
                            class="flex justify-between items-center py-2"
                        >
                            <div class="flex gap-1 items-center font-semibold">
                                Greeting
                            </div>
                            <PencilOutlineIcon
                                :size="20"
                                @click="
                                    () =>
                                        openOrFocusCreateTemplateWindow(
                                            greetingTemplate
                                        )
                                "
                                class="cursor-pointer"
                            />
                        </div>
                        <hr v-if="greetingTemplate && signOffTemplate" />
                        <div
                            v-if="signOffTemplate"
                            class="flex justify-between items-center py-2"
                        >
                            <div class="flex gap-1 items-center font-semibold">
                                Sign-off
                            </div>
                            <PencilOutlineIcon
                                :size="20"
                                @click="
                                    () =>
                                        openOrFocusCreateTemplateWindow(
                                            signOffTemplate
                                        )
                                "
                                class="cursor-pointer"
                            />
                        </div>
                    </div>

                    <div
                        :class="
                            !greetingTemplate && !signOffTemplate
                                ? 'flex gap-3'
                                : ''
                        "
                    >
                        <Button
                            v-if="!greetingTemplate"
                            @button-click="() => addSalutation('greeting')"
                            variant="link"
                            label="Add greeting"
                        />
                        <Button
                            v-if="!signOffTemplate"
                            @button-click="() => addSalutation('sign-off')"
                            variant="link"
                            label="Add sign-off"
                        />
                    </div>
                </div>
            </section>
            <hr />

            <section
                v-if="
                    templates.filter(
                        (template) => template.section !== 'Salutations'
                    ).length == 0
                "
                class="px-6"
            >
                <!-- NO TEMPLATES YET -->
                <div class="flex flex-col gap-5 mt-5">
                    <div
                        class="w-fit border-solid border-1 border-lime-100 mx-auto rounded-full p-5"
                    >
                        <div
                            class="w-fit border-solid border-1 border-lime-200 mx-auto rounded-full p-3"
                        >
                            <div
                                class="bg-lime-100 w-fit text-lime-700 mx-auto rounded-full p-10"
                            >
                                <TextBoxMultipleIcon :size="50" />
                            </div>
                        </div>
                    </div>
                    <div class="text-center">
                        <h3>You don't have any templates yet!</h3>
                        <p>Upload template files or create a new document.</p>
                    </div>
                    <div class="flex gap-3">
                        <Button
                            class="file-upload-button"
                            variant="outlined"
                            label="Upload"
                            @button-click="triggerFileInput"
                        >
                            <CloudUploadIcon :size="18" />
                            <input
                                type="file"
                                ref="file"
                                @change="handleImportTemplates"
                                class="hidden-file-input"
                            />
                        </Button>
                        <Button
                            @button-click="
                                () => openOrFocusCreateTemplateWindow()
                            "
                            label="Create template"
                        >
                            <PlusIcon :size="20" />
                        </Button>
                    </div>
                    <hr />
                </div>
            </section>

            <section v-else>
                <!-- HAS TEMPLATES -->
                <div
                    v-for="sectionName in orderedSections"
                    :key="sectionName"
                    class="template-section hover:bg-gray-50"
                    @mouseover="handleSectionHover(sectionName)"
                    @mouseleave="clearHoveredSection"
                >
                    <div class="px-6 flex flex-col gap-2 py-5">
                        <div class="flex justify-between w-full">
                            <h3>{{ sectionName }}</h3>
                            <DeleteOutlineIcon
                                v-if="hoveredSection === sectionName"
                                @click="handleDeleteSection"
                                fillColor="#e7000b"
                                :size="18"
                            />
                        </div>

                        <InfoBox
                            v-if="sectionName === 'Uncategorized Templates'"
                            heading="These templates do not have a section"
                            body="You may want to add them to an existing section or create a new one."
                        />

                        <draggable
                            :list="sectionTemplates[sectionName] || []"
                            group="templates"
                            itemKey="id"
                            @change="(e) => onDragChange(e, sectionName)"
                        >
                            <template #item="{ element, index: templateIndex }">
                                <div>
                                    <div
                                        class="flex justify-between items-center cursor-grab py-2"
                                    >
                                        <div
                                            class="flex gap-1 items-center font-semibold"
                                        >
                                            <DragVerticalIcon :size="18" />
                                            {{ element.title }}
                                        </div>
                                        <PencilOutlineIcon
                                            :size="20"
                                            @click="
                                                () =>
                                                    openOrFocusCreateTemplateWindow(
                                                        element
                                                    )
                                            "
                                        />
                                    </div>

                                    <hr
                                        v-if="
                                            templateIndex <
                                            (sectionTemplates[sectionName]
                                                ?.length || 0) -
                                                1
                                        "
                                    />
                                </div>
                            </template>
                        </draggable>

                        <div class="w-full">
                            <Button
                                @button-click="
                                    () =>
                                        openOrFocusCreateTemplateWindow(
                                            null,
                                            sectionName
                                        )
                                "
                                label="Add template"
                                variant="link"
                            />
                        </div>
                    </div>
                    <hr class="" />
                </div>
            </section>

            <section class="px-6 flex flex-col gap-5 mt-5">
                <input
                    v-if="displaySectionField"
                    type="text"
                    v-model="newSection"
                    placeholder="New section name"
                    class="standard"
                />

                <div v-if="displaySectionField" class="flex gap-3">
                    <Button
                        label="Cancel"
                        variant="outlined"
                        @button-click="cancelAddSection"
                    />
                    <Button
                        label="Create section"
                        variant="filled"
                        :disabled="disableCreateSection"
                        @button-click="createSection"
                    />
                </div>

                <Button
                    v-if="!displaySectionField"
                    label="Add section"
                    variant="outlined"
                    @button-click="addSection"
                    ><PlusIcon :size="20"
                /></Button>
            </section>
        </div>
    </div>
    <Modal v-if="isModalOpen" @close="isModalOpen = false">
        <template #title>
            You are about to permanently delete the
            <strong>"{{ focusedSection }}"</strong> section
        </template>
        <template #body>
            You may either delete all templates within this section, or move
            them into the <strong>"Uncategorized"</strong> section.
        </template>
        <template #footer>
            <Button
                label="Delete section"
                variant="cancelFilled"
                @button-click="handleConfirmDeleteSection"
                ><DeleteOutlineIcon fillColor="#e7000b" :size="18"
            /></Button>
            <Button
                label="Delete section and templates"
                variant="cancelLink"
                class="w-full"
                @button-click="handleConfirmDeleteSectionWithTemplates"
            />
        </template>
    </Modal>
</template>

<script>
import { ref, onMounted, computed, watch } from "vue";
import { saveAs } from "file-saver";

import CloudUploadIcon from "vue-material-design-icons/CloudUploadOutline.vue";
import PlusIcon from "vue-material-design-icons/Plus.vue";
import TextBoxMultipleIcon from "vue-material-design-icons/TextBoxMultiple.vue";
import DragVerticalIcon from "vue-material-design-icons/DragVertical.vue";
import PencilOutlineIcon from "vue-material-design-icons/PencilOutline.vue";
import DeleteOutlineIcon from "vue-material-design-icons/DeleteOutline.vue";
import draggable from "vuedraggable";
import Button from "../components/Button.vue";
import InfoBox from "../components/InfoBox.vue";
import Modal from "../components/Modal.vue";

export default {
    components: {
        Button,
        InfoBox,
        draggable,
        CloudUploadIcon,
        PlusIcon,
        TextBoxMultipleIcon,
        DragVerticalIcon,
        PencilOutlineIcon,
        DeleteOutlineIcon,
        Modal,
    },

    props: {
        templateToEdit: {
            type: Object,
            default: null,
        },
        currentView: {
            type: String,
            default: null,
        },
    },
    emits: ["edit-template"],
    setup(props, { emit }) {
        const templates = ref([]);
        const sections = ref([]);
        const newSection = ref("");
        const displaySectionField = ref(false);
        const hoveredSection = ref(null);
        const focusedSection = ref(null);
        let displayDeleteSection = ref(false);
        let templatesJSON = ref(null);
        let file = ref(null);
        const isModalOpen = ref(false);
        // const file = (ref < HTMLInputElement) | (null > null);

        const modalActions = [
            {
                label: "Delete eection",
                onClick: () => {
                    console.log("delete this section");
                    isModalOpen.value = false;
                },
                variant: "link",
            },
            {
                label: "Delete section and templates",
                onClick: () => {
                    console.log("delete this section AND templates");
                    isModalOpen.value = false;
                },
                variant: "filled",
            },
        ];

        const triggerFileInput = () => {
            file.value?.click();
        };

        onMounted(() => {
            loadTemplates();
        });

        watch(
            () => props.currentView,
            (newVal) => {
                if (newVal === "templates") loadTemplates();
            }
        );

        const loadTemplates = () => {
            chrome.storage.local.get(["templates", "sections"], (result) => {
                templates.value = Array.isArray(result.templates)
                    ? result.templates
                    : [];

                if (Array.isArray(result.sections)) {
                    sections.value = result.sections;
                } else {
                    const sectionNames = new Set(
                        templates.value.map(
                            (t) =>
                                t.section?.trim() || "Uncategorized Templates"
                        )
                    );
                    sections.value = [...sectionNames];
                }
            });
        };

        const onDragChange = (event, newSectionName) => {
            const { added, moved } = event;
            if (added || moved) {
                if (added) {
                    const movedTemplate = added.element;
                    const match = templates.value.find(
                        (t) => t.id === movedTemplate.id
                    );
                    if (match) {
                        match.section = newSectionName;
                    }
                }

                const updated = [];
                for (const [section, templateList] of Object.entries(
                    sectionTemplates.value
                )) {
                    for (const template of templateList) {
                        updated.push({ ...template });
                    }
                }

                templates.value = updated;
                chrome.storage.local.set({ templates: updated });
            }
        };

        const greetingTemplate = computed(() =>
            templates.value.find(
                (template) =>
                    template.title === "Greeting" &&
                    template.section === "Salutations"
            )
        );

        const signOffTemplate = computed(() =>
            templates.value.find(
                (template) =>
                    template.title === "Sign-off" &&
                    template.section === "Salutations"
            )
        );

        const sectionTemplates = computed(() => {
            const grouped = {};

            for (const section of sections.value) {
                grouped[section] = [];
            }

            for (const template of templates.value) {
                const key =
                    template.section?.trim() || "Uncategorized Templates";
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(template);
            }

            return grouped;
        });

        const orderedSections = computed(() => {
            return sections.value
                .filter(
                    (s) =>
                        s !== "Salutations" && s !== "Uncategorized Templates"
                )
                .concat(
                    sections.value.includes("Uncategorized Templates")
                        ? ["Uncategorized Templates"]
                        : []
                );
        });

        const openOrFocusCreateTemplateWindow = (
            template = null,
            section = null
        ) => {
            emit("edit-template", {
                id: template?.id || null,
                title: template?.title || "",
                body: template?.body || "",
                section:
                    template?.section || section || "Uncategorized Templates",
            });
        };

        // TODO: URGENT UPDATE THIS
        const addSalutation = (type) => {
            console.log("add salutation");
            const title = type === "greeting" ? "Greeting" : "Sign-off";

            chrome.runtime.sendMessage(
                {
                    type: "open-or-focus-create-template",
                    payload: {
                        id: null,
                        title,
                        body: "",
                        section: "Salutations",
                    },
                },
                (response) => {
                    console.log("Response:", response);
                }
            );
        };

        const addSection = () => {
            displaySectionField.value = !displaySectionField.value;
        };

        const createSection = () => {
            const cleanName = newSection.value.trim();

            // TODO: replace alerts with error messaging at field
            if (!Array.isArray(sections.value)) {
                console.error(
                    "sections.value is not an array:",
                    sections.value
                );
                alert(
                    "There was an error saving the section. Please try again."
                );
                return;
            }

            if (sections.value.includes(cleanName)) {
                alert("That section already exists.");
                return;
            }

            const updatedSections = [...sections.value, cleanName];
            sections.value = updatedSections;
            chrome.storage.local.set({ sections: updatedSections });

            newSection.value = "";
            displaySectionField.value = false;
        };

        const cancelAddSection = () => {
            newSection.value = "";
            displaySectionField.value = false;
        };
        const disableCreateSection = computed(function () {
            return displaySectionField && newSection.value.trim() === "";
        });

        const handleExportTemplates = () => {
            console.log("received array:");
            console.log(templates.value);
            templatesJSON = JSON.stringify(templates.value);
            console.log("created JSON:");
            console.log(templatesJSON);

            const blob = new Blob([templatesJSON], {
                type: "application/json",
            });

            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");

            saveAs(
                blob,
                `mytemplates-${year}-${month}-${day}_${hours}-${minutes}-${seconds}.json`
            );
        };

        // TODO: add error checking for invalid formats/contents
        const handleImportTemplates = () => {
            const selectedFile = file.value?.files?.[0];
            if (!selectedFile) return;

            const reader = new FileReader();

            try {
                reader.readAsText(selectedFile);

                reader.onload = (res) => {
                    const parsed = JSON.parse(res.target.result);
                    const importedTemplates = Array.isArray(parsed)
                        ? parsed
                        : [];

                    const templatesWithNewIds = importedTemplates.map(
                        (template) => ({
                            ...template,
                            id: crypto.randomUUID(),
                        })
                    );

                    chrome.storage.local.get(["templates"], (result) => {
                        const existingTemplates = result.templates || [];

                        const filteredTemplates = existingTemplates.filter(
                            (t) =>
                                !(
                                    t.section === "Salutations" &&
                                    (t.title === "Greeting" ||
                                        t.title === "Sign-off")
                                )
                        );

                        const mergedTemplates = [
                            ...filteredTemplates,
                            ...templatesWithNewIds,
                        ];

                        chrome.storage.local.set(
                            { templates: mergedTemplates },
                            () => {
                                console.log("Templates successfully imported.");
                                templates.value = mergedTemplates;
                            }
                        );

                        const newSections = new Set(
                            mergedTemplates.map(
                                (t) =>
                                    t.section?.trim() ||
                                    "Uncategorized Templates"
                            )
                        );

                        const sectionsArray = [...newSections];
                        sections.value = sectionsArray;
                        chrome.storage.local.set({ sections: sectionsArray });
                    });
                };
            } catch (error) {
                console.error("failed to import templates:", error);
            }
        };

        const handleSectionHover = (sectionName) => {
            hoveredSection.value = sectionName;
            focusedSection.value = sectionName;
        };

        const clearHoveredSection = () => {
            hoveredSection.value = null;
        };

        const handleDeleteSection = () => {
            console.log("fire delete modal", isModalOpen.value);
            isModalOpen.value = !isModalOpen.value;
            console.log("fire delete modal", isModalOpen.value);
        };

        const handleConfirmDeleteSectionWithTemplates = () => {
            const sectionToDelete = focusedSection.value;

            chrome.storage.local.get(["templates"], (result) => {
                const existingTemplates = result.templates || [];

                const updatedTemplates = existingTemplates.filter(
                    (t) => t.section !== sectionToDelete
                );

                chrome.storage.local.set(
                    { templates: updatedTemplates },
                    () => {
                        chrome.storage.local.get(["sections"], (result) => {
                            const existingSections = result.sections || [];

                            const updatedSections = existingSections.filter(
                                (s) => s !== sectionToDelete
                            );

                            chrome.storage.local.set(
                                { sections: updatedSections },
                                () => {
                                    isModalOpen.value = false;
                                    focusedSection.value = null;
                                    loadTemplates();
                                    emit("close");
                                }
                            );
                        });
                    }
                );
            });
        };

        const handleConfirmDeleteSection = () => {
            const sectionToDelete = focusedSection.value;

            chrome.storage.local.get(["templates"], (result) => {
                const existingTemplates = result.templates || [];

                const updatedTemplates = existingTemplates.map((t) =>
                    t.section === sectionToDelete
                        ? { ...t, section: "Uncategorized Templates" }
                        : t
                );

                chrome.storage.local.set(
                    { templates: updatedTemplates },
                    () => {
                        chrome.storage.local.get(["sections"], (result) => {
                            const existingSections = result.sections || [];

                            const updatedSections = existingSections.filter(
                                (s) => s !== sectionToDelete
                            );

                            chrome.storage.local.set(
                                { sections: updatedSections },
                                () => {
                                    isModalOpen.value = false;
                                    focusedSection.value = null;
                                    loadTemplates();
                                    emit("close");
                                }
                            );
                        });
                    }
                );
            });
        };

        return {
            templates,
            sections,
            newSection,
            addSection,
            createSection,
            disableCreateSection,
            displaySectionField,
            cancelAddSection,
            openOrFocusCreateTemplateWindow,
            addSalutation,
            sectionTemplates,
            onDragChange,
            greetingTemplate,
            signOffTemplate,
            handleExportTemplates,
            handleImportTemplates,
            templatesJSON,
            file,
            orderedSections,
            displayDeleteSection,
            handleSectionHover,
            clearHoveredSection,
            hoveredSection,
            handleDeleteSection,
            isModalOpen,
            modalActions,
            handleConfirmDeleteSectionWithTemplates,
            handleConfirmDeleteSection,
            focusedSection,
            triggerFileInput,
        };
    },
};
</script>

<style scoped></style>
