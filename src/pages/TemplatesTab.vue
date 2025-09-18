<!-- pages/TemplateTab.vue -->
<template>
    <div
        class="flex justify-center bg-white mt-[82px]"
        :class="isLoading ? 'h-[80%] items-center' : ''"
    >
        <div class="flex flex-col mb-6 max-w-[550px] w-full">
            <div v-if="isLoading" class="px-6 py-10 text-center text-gray-500">
                Loading...
            </div>
            <template v-else>
                <section class="flex flex-col gap-2 px-6 mb-5">
                    <h2>Salutation</h2>
                    <InfoBox
                        heading="Salutations are automatically applied to all emails"
                    />

                    <div>
                        <div
                            class="flex justify-between items-center cursor-grab py-2"
                        >
                            <div class="flex gap-1 items-center font-semibold">
                                Greeting
                            </div>
                            <PencilOutlineIcon
                                v-if="greetingTemplate"
                                :size="20"
                                @click="
                                    () =>
                                        openTemplateEditorPage(greetingTemplate)
                                "
                            />
                            <Button
                                v-if="!greetingTemplate"
                                variant="link"
                                label="Add greeting"
                                @button-click="
                                    () =>
                                        openTemplateEditorPage({
                                            title: 'Greeting',
                                            body: '',
                                            section: 'Salutations',
                                        })
                                "
                            />
                        </div>

                        <hr />
                        <div
                            class="flex justify-between items-center cursor-grab py-2"
                        >
                            <div class="flex gap-1 items-center font-semibold">
                                Sign-off
                            </div>
                            <PencilOutlineIcon
                                v-if="signOffTemplate"
                                :size="20"
                                @click="
                                    () =>
                                        openTemplateEditorPage(signOffTemplate)
                                "
                            />
                            <Button
                                v-if="!signOffTemplate"
                                variant="link"
                                label="Add sign-off"
                                @button-click="
                                    () =>
                                        openTemplateEditorPage({
                                            title: 'Sign-off',
                                            body: '',
                                            section: 'Salutations',
                                        })
                                "
                            />
                        </div>
                    </div>
                </section>
                <hr />

                <!-- NO TEMPLATES YET -->
                <section v-if="!hasCoreTemplates" class="px-6 mt-[100px]">
                    <div class="flex flex-col gap-5">
                        <div class="text-center">
                            <h3>You don't have any templates yet!</h3>
                            <p>
                                Upload a template file or create a new document.
                            </p>
                        </div>
                        <div class="flex gap-3 justify-center">
                            <Button
                                class="file-upload-button !w-fit !px-3"
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
                                class="!w-fit !px-3"
                                @button-click="() => openTemplateEditorPage()"
                                label="Create template"
                            >
                                <PlusIcon :size="20" />
                            </Button>
                        </div>
                        <!-- <hr /> -->
                    </div>
                </section>

                <!-- HAS TEMPLATES -->
                <section v-else>
                    <div
                        v-for="sectionName in orderedSections"
                        :key="sectionName"
                        class="template-section hover:bg-gray-50"
                        :class="`${sectionNameNoSpaces(sectionName)}-section`"
                        @mouseover="handleSectionHover(sectionName)"
                        @mouseleave="clearHoveredSection"
                    >
                        <div class="px-6 flex flex-col gap-2 py-5">
                            <div class="flex justify-between w-full">
                                <h3>{{ sectionName }}</h3>
                                <DeleteOutlineIcon
                                    v-if="hoveredSection === sectionName"
                                    @click="handleDeleteSection(sectionName)"
                                    fillColor="#e7000b"
                                    :size="18"
                                    class="hover:cursor-pointer"
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
                                <template
                                    #item="{ element, index: templateIndex }"
                                >
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
                                                        openTemplateEditorPage(
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
                                            openTemplateEditorPage(
                                                null,
                                                null,
                                                sectionName
                                            )
                                    "
                                    label="Add template"
                                    variant="link"
                                />
                            </div>
                        </div>
                        <hr />
                    </div>
                </section>

                <section
                    v-if="hasCoreTemplates"
                    class="px-6 flex flex-col gap-5 mt-5"
                >
                    <div v-if="displaySectionField" class="flex flex-col gap-2">
                        <input
                            type="text"
                            v-model="newSection"
                            placeholder="New section name"
                            class="standard"
                        />

                        <p v-if="addSectionErrorMessage" class="text-red-600">
                            {{ addSectionErrorMessage }}
                        </p>
                    </div>

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
                        v-if="!displaySectionField && hasCoreTemplates"
                        label="Add section"
                        variant="outlined"
                        @button-click="addSection"
                        ><PlusIcon :size="20"
                    /></Button>
                </section>

                <section v-if="hasCoreTemplates" class="mt-5">
                    <hr />
                    <div class="px-6 flex gap-5 mt-5 justify-between">
                        <Button
                            label="Delete all templates"
                            variant="redLink"
                            @button-click="handleDeleteAllTemplates"
                        />
                        <Button
                            label="Export all templates"
                            variant="link"
                            @button-click="handleExportTemplates"
                        />
                    </div>
                </section>
            </template>
        </div>
    </div>
    <Modal v-if="isModalOpen" @close="handleCloseModal">
        <template #title>
            <template v-if="modalMode === 'importError'">
                {{ importErrorMessage[0] }}
            </template>
            <template v-else-if="modalMode === 'deleteSection'">
                You are about to permanently delete the
                <strong>"{{ focusedSection }}"</strong> section
            </template>
            <template v-else-if="modalMode === 'deleteAllTemplates'">
                {{ deleteAllTemplatesErrorMessage[0] }}
            </template>
        </template>

        <template #body>
            <template v-if="modalMode === 'importError'">
                {{ importErrorMessage[1] }}
            </template>
            <template v-else-if="modalMode === 'deleteSection'">
                You may either delete all templates within this section, or move
                them into the <strong>"Uncategorized"</strong> section.
            </template>
            <template v-else-if="modalMode === 'deleteAllTemplates'">
                {{ deleteAllTemplatesErrorMessage[1] }}
            </template>
        </template>

        <template #footer>
            <template v-if="modalMode === 'importError'">
                <Button
                    label="OK"
                    variant="grayFilled"
                    class="!text-gray-700"
                    @button-click="handleCloseModal"
                />
            </template>
            <template v-else-if="modalMode === 'deleteSection'">
                <Button
                    label="Delete section"
                    variant="grayFilled"
                    @button-click="handleConfirmDeleteSection"
                    ><DeleteOutlineIcon fillColor="#e7000b" :size="18"
                /></Button>
                <Button
                    label="Delete section and templates"
                    variant="redLink"
                    class="w-full"
                    @button-click="handleConfirmDeleteSectionWithTemplates"
                />
            </template>
            <template v-else-if="modalMode === 'deleteAllTemplates'"
                ><Button
                    label="Delete all templates"
                    variant="grayFilled"
                    @button-click="handleConfirmDeleteAllTemplates"
                    ><DeleteOutlineIcon
                        fillColor="#e7000b"
                        :size="18" /></Button
            ></template>
        </template>
    </Modal>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { saveAs } from "file-saver";
import {
    loadTemplatesAndSections,
    updateDefaultInputsFromUploadedTemplates,
    getNonSalutations,
    getGreeting,
    getSignOff,
} from "../lib/utils.js";
import { Templates } from "../lib/template-validator.mjs";

import CloudUploadIcon from "vue-material-design-icons/CloudUploadOutline.vue";
import PlusIcon from "vue-material-design-icons/Plus.vue";
import DragVerticalIcon from "vue-material-design-icons/DragVertical.vue";
import PencilOutlineIcon from "vue-material-design-icons/PencilOutline.vue";
import DeleteOutlineIcon from "vue-material-design-icons/DeleteOutline.vue";

import draggable from "vuedraggable";
import Button from "../components/Button.vue";
import InfoBox from "../components/InfoBox.vue";
import Modal from "../components/Modal.vue";

const props = defineProps({
    templateToEdit: {
        type: Object,
        default: null,
    },
    currentView: {
        type: String,
        default: null,
    },
});

const emit = defineEmits(["edit-template"]);

const templates = ref([]);
const sections = ref([]);
const newSection = ref("");
const displaySectionField = ref(false);
const hoveredSection = ref(null);
const focusedSection = ref(null);
let templatesJSON = ref(null);
let file = ref(null);
const isModalOpen = ref(false);
const isLoading = ref(true);
const addSectionErrorMessage = ref("");
const importErrorMessage = ref([]);
const deleteAllTemplatesErrorMessage = ref([]);
let validateTemplates = Templates;

const loadTemplates = async () => {
    isLoading.value = true;

    const [{ templates: t, sections: s }] = await Promise.all([
        loadTemplatesAndSections(),
        new Promise((resolve) => setTimeout(resolve, 300)), // forced delay to prevent flashing
    ]);

    templates.value = t;
    sections.value = s;
    isLoading.value = false;
};

onMounted(async () => {
    loadTemplates();
});

watch(
    () => props.currentView,
    (newVal) => {
        if (newVal === "templates") loadTemplates();
    }
);

const triggerFileInput = () => {
    file.value?.click();
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

const greetingTemplate = computed(() => {
    return getGreeting(templates.value);
});

const signOffTemplate = computed(() => {
    return getSignOff(templates.value);
});

const hasCoreTemplates = computed(() => {
    return getNonSalutations(templates.value);
});

const sectionTemplates = computed(() => {
    const grouped = {};

    for (const section of sections.value) {
        grouped[section] = [];
    }

    for (const template of templates.value) {
        const key = template.section?.trim() || "Uncategorized Templates";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(template);
    }

    return grouped;
});

const orderedSections = computed(() => {
    return sections.value
        .filter((s) => s !== "Salutations" && s !== "Uncategorized Templates")
        .concat(
            sections.value.includes("Uncategorized Templates")
                ? ["Uncategorized Templates"]
                : []
        );
});

const modalMode = computed(() => {
    if (importErrorMessage.value.length > 0) return "importError";
    if (focusedSection.value) return "deleteSection";
    if (deleteAllTemplatesErrorMessage.value.length > 0)
        return "deleteAllTemplates";
    return null;
});

const sectionNameNoSpaces = (originalName) => {
    return originalName.toLowerCase().split(" ").join("");
};

const openTemplateEditorPage = (
    template = null,
    title = null,
    section = null
) => {
    emit("edit-template", {
        id: template?.id || null,
        title: template?.title || title || "",
        body: template?.body || "",
        section: template?.section || section || "Uncategorized Templates",
    });
};

const addSection = () => {
    displaySectionField.value = !displaySectionField.value;
};

const createSection = () => {
    const cleanName = newSection.value.trim();

    // sections is not an array
    if (!Array.isArray(sections.value)) {
        addSectionErrorMessage.value =
            "There was an error saving the section. Please try again.";
        return;
    }

    if (sections.value.includes(cleanName)) {
        addSectionErrorMessage.value = "That section already exists.";
        return;
    }

    const updatedSections = [...sections.value, cleanName];
    sections.value = updatedSections;
    chrome.storage.local.set({ sections: updatedSections });

    newSection.value = "";
    addSectionErrorMessage.value = "";
    displaySectionField.value = false;
};

const cancelAddSection = () => {
    newSection.value = "";
    addSectionErrorMessage.value = "";
    displaySectionField.value = false;
};
const disableCreateSection = computed(function () {
    return displaySectionField && newSection.value.trim() === "";
});

const handleExportTemplates = () => {
    templatesJSON = JSON.stringify(templates.value);

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

const handleImportTemplates = () => {
    const selectedFile = file.value?.files?.[0];
    if (!selectedFile) return;

    // check that file is JSON
    if (selectedFile.type !== "application/json") {
        importErrorMessage.value = [
            "Incorrect file format",
            "You may only upload JSON files",
        ];
        isModalOpen.value = true;
        return;
    }

    const reader = new FileReader();

    try {
        reader.readAsText(selectedFile);

        reader.onload = (res) => {
            const parsed = JSON.parse(res.target.result);
            const importedTemplates = Array.isArray(parsed) ? parsed : [];

            // file content validation
            for (const template of importedTemplates) {
                if (!validateTemplates(template)) {
                    importErrorMessage.value = [
                        "Invalid file contents",
                        "Please ensure uploaded templates contain the appropriate attributes (body, id, section & title)",
                    ];
                    isModalOpen.value = true;
                    return;
                }
            }

            // continue if successful
            const templatesWithNewIds = importedTemplates.map((template) => ({
                ...template,
                id: crypto.randomUUID(),
            }));

            chrome.storage.local.get(["templates"], (result) => {
                const existingTemplates = result.templates || [];

                const filteredTemplates = existingTemplates.filter(
                    (t) =>
                        !(
                            t.section === "Salutations" &&
                            (t.title === "Greeting" || t.title === "Sign-off")
                        )
                );

                const mergedTemplates = [
                    ...filteredTemplates,
                    ...templatesWithNewIds,
                ];

                const newSections = [
                    ...new Set(
                        mergedTemplates.map(
                            (t) =>
                                t.section?.trim() || "Uncategorized Templates"
                        )
                    ),
                ];

                if (!newSections.includes("Uncategorized Templates")) {
                    newSections.push("Uncategorized Templates");
                }

                chrome.storage.local.set({ templates: mergedTemplates }, () => {
                    chrome.storage.local.set({ sections: newSections }, () => {
                        templates.value = mergedTemplates;
                        sections.value = newSections;

                        updateDefaultInputsFromUploadedTemplates(
                            templatesWithNewIds
                        );
                        loadTemplates();
                    });
                });
            });
        };
    } catch (error) {
        importErrorMessage.value = ["Error importing templates", error];
        isModalOpen.value = true;
    }
};

const handleCloseModal = () => {
    isModalOpen.value = false;
    importErrorMessage.value = [];
    deleteAllTemplatesErrorMessage.value = [];
    clearHoveredSection();
    focusedSection.value = null;
};

const handleSectionHover = (sectionName) => {
    if (sectionName == "Uncategorized Templates") return;
    hoveredSection.value = sectionName;
};

const clearHoveredSection = () => {
    hoveredSection.value = null;
};

const handleDeleteSection = (sectionName) => {
    focusedSection.value = sectionName;
    isModalOpen.value = true;
};

const handleConfirmDeleteSectionWithTemplates = () => {
    const sectionToDelete = focusedSection.value;

    chrome.storage.local.get(["templates"], (result) => {
        const existingTemplates = result.templates || [];

        const updatedTemplates = existingTemplates.filter(
            (t) => t.section !== sectionToDelete
        );

        chrome.storage.local.set({ templates: updatedTemplates }, () => {
            chrome.storage.local.get(["sections"], (result) => {
                const existingSections = result.sections || [];

                const updatedSections = existingSections.filter(
                    (s) => s !== sectionToDelete
                );

                chrome.storage.local.set({ sections: updatedSections }, () => {
                    isModalOpen.value = false;
                    focusedSection.value = null;
                    loadTemplates();
                });
            });
        });
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

        chrome.storage.local.set({ templates: updatedTemplates }, () => {
            chrome.storage.local.get(["sections"], (result) => {
                const existingSections = result.sections || [];

                const updatedSections = existingSections.filter(
                    (s) => s !== sectionToDelete
                );

                chrome.storage.local.set({ sections: updatedSections }, () => {
                    isModalOpen.value = false;
                    focusedSection.value = null;
                    loadTemplates();
                });
            });
        });
    });
};

const handleDeleteAllTemplates = () => {
    deleteAllTemplatesErrorMessage.value = [
        "You're about to delete all of your templates",
        "This action is irreversible - are you sure?",
    ];
    isModalOpen.value = true;
};

const handleConfirmDeleteAllTemplates = () => {
    chrome.storage.local.set({ templates: [] }, () => {
        const defaultSections = ["Salutations", "Uncategorized Templates"];
        chrome.storage.local.set({ sections: defaultSections }, () => {
            isModalOpen.value = false;
            deleteAllTemplatesErrorMessage.value = [];
            loadTemplates();
        });
    });
};
</script>

<style scoped></style>
