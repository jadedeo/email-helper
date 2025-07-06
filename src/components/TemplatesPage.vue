<!-- src/components/TemplatePage.vue -->
<template>
    <section class="flex flex-col gap-5">
        <div class="flex flex-col gap-3">
            <h2>Salutation</h2>
            <InfoBox
                heading="Salutations are automatically applied"
                body="Greetings and sign-off salutations are applied to all email
                    reposnses, no matter which template is used."
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
        </div>
        <hr class="border-solid border-t-1 border-gray-100" />
        <div>
            <div v-if="templates.length === 0">
                <h2>You don't have any template yet!</h2>
                <p>Upload template files or create a new document.</p>
            </div>

            <div v-else>
                <h2>{{ templates.length }} templates</h2>
                <h2>{{ sections.length }} sections</h2>
                <li v-for="section in sections">
                    {{ section }}
                </li>

                <div
                    v-for="sectionName in [...sections, 'Uncategorized']"
                    :key="sectionName"
                    class="p-4 border rounded mb-4"
                >
                    <h3 class="font-bold text-lg mb-2">{{ sectionName }}</h3>
                    <draggable
                        :list="sectionTemplates[sectionName] || []"
                        group="templates"
                        itemKey="id"
                        @change="(e) => onDragChange(e, sectionName)"
                    >
                        <template #item="{ element }">
                            <div class="p-2 mb-1 bg-white border rounded">
                                {{ element.title }}
                            </div>
                        </template>
                    </draggable>
                </div>
            </div>

            <div class="flex gap-3">
                <Button
                    @button-click="uploadTemplates"
                    variant="outlined"
                    label="Upload templates"
                />
                <Button
                    @button-click="openOrFocusCreateTemplateWindow"
                    label="Create template"
                />
            </div>
        </div>
        <hr class="border-solid border-t-1 border-gray-100" />
        <div>
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
            />
        </div>
    </section>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import draggable from "vuedraggable";
import Button from "../components/Button.vue";
import InfoBox from "./InfoBox.vue";

export default {
    components: {
        Button,
        InfoBox,
        draggable,
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
                // Update section on added
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

                // Flatten updated sectionTemplates into one array
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
            console.log("UPLOAD TEMPLATES");
        };

        const addSection = () => {
            displaySectionField.value = !displaySectionField.value;
        };

        const createSection = () => {
            const cleanName = newSection.value.trim();

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
            console.log("cancelAddSection");
            newSection.value = "";
            displaySectionField.value = false;
        };
        const disableCreateSection = computed(function () {
            console.log("disableCreateSection");
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
