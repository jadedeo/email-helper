<!-- src/components/TemplatePage.vue -->
<template>
    <div class="flex justify-center bg-white">
        <div class="flex flex-col gap-5 mb-6 max-w-[550px] bg-white">
            <section class="flex flex-col gap-2 px-6">
                <!-- <Button
                @button-click="handleExportTemplates"
                label="Export all templates"
            />
            <input type="file" ref="file" @change="handleImportTemplates" /> -->

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

            <!-- TODO: conditionally render sections -->
            <section
                v-if="
                    templates.filter(
                        (template) => template.section !== 'Salutations'
                    ).length == 0
                "
                class="px-6"
            >
                <!-- NO TEMPLATES YET -->
                <div class="flex flex-col gap-5">
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
                        <!-- TODO: add file upload option -->
                        <Button
                            @button-click="uploadTemplates"
                            variant="outlined"
                            label="Upload templates"
                            disabled="true"
                            ><CloudUploadIcon :size="20"
                        /></Button>
                        <Button
                            @button-click="
                                () => openOrFocusCreateTemplateWindow()
                            "
                            label="Create template"
                        >
                            <PlusIcon :size="20" />
                        </Button>
                    </div>
                </div>
            </section>

            <section v-else>
                <!-- HAS TEMPLATES -->
                <!-- <div> -->
                <div v-for="sectionName in orderedSections" :key="sectionName">
                    <div class="px-6 flex flex-col gap-2">
                        <h3>
                            {{ sectionName }}
                        </h3>
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
                    <hr class="my-5" />
                </div>
                <!-- </div> -->
            </section>

            <!-- <hr /> -->

            <section class="px-6 flex flex-col gap-5">
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
</template>

<script>
import { ref, onMounted, computed, watch } from "vue";
import { saveAs } from "file-saver";

import CloudUploadIcon from "vue-material-design-icons/CloudUploadOutline.vue";
import PlusIcon from "vue-material-design-icons/Plus.vue";
import TextBoxMultipleIcon from "vue-material-design-icons/TextBoxMultiple.vue";
import DragVerticalIcon from "vue-material-design-icons/DragVertical.vue";
import PencilOutlineIcon from "vue-material-design-icons/PencilOutline.vue";
import draggable from "vuedraggable";
import Button from "../components/Button.vue";
import InfoBox from "./InfoBox.vue";

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
        let templatesJSON = ref(null);
        let file = ref(null);

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

        const uploadTemplates = () => {
            console.log("UPLOAD TEMPLATES");
        };

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
            uploadTemplates,
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
        };
    },
};
</script>

<style scoped></style>
