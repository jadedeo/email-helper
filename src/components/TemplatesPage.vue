<!-- src/components/TemplatePage.vue -->
<template>
    <div class="flex flex-col gap-5 mb-6">
        <section class="flex flex-col gap-2 px-6">
            <h2>Salutation</h2>
            <InfoBox
                heading="Salutations are automatically applied"
                body="Greetings and sign-off salutations are applied to all email
                    responses, regardless of which template is used."
            />

            <div
                :class="
                    !greetingTemplate && !signOffTemplate ? 'flex gap-3' : ''
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
                        @button-click="() => openOrFocusCreateTemplateWindow()"
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
            <div
                v-for="sectionName in [
                    ...sections.filter((s) => s !== 'Salutations'),
                    'Uncategorized Templates',
                ]"
                :key="sectionName"
            >
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
</template>

<script>
import { ref, onMounted, computed } from "vue";
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

    setup() {
        const templates = ref([]);
        const sections = ref([]);
        const newSection = ref("");
        const displaySectionField = ref(false);

        onMounted(() => {
            chrome.storage.local.get(["templates", "sections"], (result) => {
                if (Array.isArray(result.templates)) {
                    templates.value = result.templates;
                }

                if (Array.isArray(result.sections)) {
                    sections.value = result.sections;
                } else {
                    sections.value = [];
                }

                if (!sections.value.includes("Salutations")) {
                    sections.value.push("Salutations");

                    chrome.storage.local.set(
                        { sections: sections.value },
                        () => {
                            chrome.storage.local.get("sections", (res) => {
                                console.log("✅ Saved sections:", res.sections);
                            });
                        }
                    );
                } else {
                    console.log("sections", sections.value);
                }
            });
        });

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
            for (const template of templates.value) {
                const key = template.section;

                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(template);
            }
            return grouped;
        });

        const openOrFocusCreateTemplateWindow = (
            template = null,
            section = null
        ) => {
            chrome.runtime.sendMessage(
                {
                    type: "open-or-focus-create-template",
                    payload: template
                        ? {
                              id: template.id,
                              title: template.title,
                              body: template.body,
                              section: template.section,
                          }
                        : {
                              id: null,
                              title: "",
                              body: "",
                              section: section || "",
                          },
                },
                (response) => {
                    console.log("Response:", response);
                }
            );
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

            sections.value.push(cleanName);
            chrome.storage.local.set({ sections: [...sections.value] });

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
        };
    },
};
</script>

<style scoped></style>
