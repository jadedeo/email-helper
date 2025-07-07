<!-- src/components/TemplatePage.vue -->
<template>
    <div class="flex flex-col gap-5">
        <section class="flex flex-col gap-3 px-6">
            <h2>Salutation</h2>
            <InfoBox
                heading="Salutations are automatically applied"
                body="Greetings and sign-off salutations are applied to all email
                    responses, regardless of which template is used."
            />

            <div class="flex gap-3">
                <Button
                    @button-click="addSalutation"
                    variant="link"
                    label="Add a greeting"
                />
                <Button
                    @button-click="addSalutation"
                    variant="link"
                    label="Add a sign-off"
                />
            </div>
        </section>
        <hr />

        <!-- TODO: conditionally render sections -->
        <section class="px-6">
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
                    <Button
                        @button-click="uploadTemplates"
                        variant="outlined"
                        label="Upload templates"
                        ><CloudUploadIcon :size="20"
                    /></Button>
                    <Button
                        @button-click="openOrFocusCreateTemplateWindow"
                        label="Create template"
                        ><PlusIcon :size="20"
                    /></Button>
                </div>
            </div>
        </section>

        <!-- TODO: remove hr later -->
        <hr />

        <section class="">
            <!-- HAS TEMPLATES -->
            <div>
                <!-- <small>
                    <span>{{ templates.length }} templates</span>
                    <span>{{ sections.length }} sections</span>
                </small> -->

                <div
                    v-for="sectionName in [...sections, 'Miscellaneous']"
                    :key="sectionName"
                >
                    <div class="my-5 px-6">
                        <h3>
                            {{ sectionName }}
                        </h3>
                        <p
                            v-if="sectionName === 'Miscellaneous'"
                            class="mb-1 text-gray-500"
                        >
                            Uncategorized templates are placed here by default.
                        </p>
                        <draggable
                            :list="sectionTemplates[sectionName] || []"
                            group="templates"
                            itemKey="id"
                            @change="(e) => onDragChange(e, sectionName)"
                        >
                            <template #item="{ element, index: templateIndex }">
                                <div>
                                    <div
                                        class="flex justify-between items-center cursor-grab py-3"
                                    >
                                        <div class="flex gap-1 items-center">
                                            <DragVerticalIcon :size="20" />
                                            {{ element.title }}
                                        </div>
                                        <PencilOutlineIcon :size="20" />
                                    </div>

                                    <hr
                                        v-if="
                                            templateIndex <
                                            (sectionTemplates[sectionName]
                                                ?.length || 0) -
                                                1
                                        "
                                        class="border-gray-200"
                                    />
                                </div>
                            </template>
                        </draggable>
                        <Button
                            @button-click="openOrFocusCreateTemplateWindow"
                            label="Add template"
                            variant="link"
                        ></Button>
                    </div>
                    <hr />
                </div>
            </div>
        </section>

        <section class="px-6">
            <div v-if="displaySectionField">
                <input type="text" v-model="newSection" />
                <p>{{ newSection }}</p>
            </div>
            <div v-if="displaySectionField" class="flex gap-3">
                <Button
                    label="Cancel"
                    variant="outlined"
                    @button-click="cancelAddSection"
                />
                <Button
                    label="Create section"
                    variant="outlined"
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
                } else if (result.sections !== undefined) {
                    console.warn(
                        "⚠️ Invalid sections format:",
                        result.sections
                    );
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
                        match.section =
                            newSectionName === "Uncategorized"
                                ? null
                                : newSectionName;
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

        const sectionTemplates = computed(() => {
            const grouped = {};
            for (const template of templates.value) {
                const key = template.section || "Uncategorized";
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(template);
            }
            return grouped;
        });

        const openOrFocusCreateTemplateWindow = () => {
            chrome.runtime.sendMessage(
                "open-or-focus-create-template",
                (response) => {
                    console.log("Response:", response);
                }
            );
        };

        const uploadTemplates = () => {
            console.log("UPLOAD TEMPLATES");
        };

        const addSalutation = () => {
            console.log("ADD SALUTATION");
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
        };
    },
};
</script>

<style scoped></style>
