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
                <h2>You have {{ templates.length }} templates</h2>
                <!-- Unsorted templates -->
                <!-- <div class="mb-4">
                    <h3 class="font-bold">Unsorted</h3>
                    <ul
                        id="section-unsorted"
                        class="template-list"
                        data-section=""
                    >
                        <li
                            v-for="t in templates.filter((t) => !t.section)"
                            :key="t.id"
                            :data-id="t.id"
                            class="template-item"
                        >
                            {{ t.title }}
                        </li>
                    </ul>
                </div> -->

                <!-- Sections -->
                <!-- <div v-for="section in sections" :key="section" class="mb-4">
                    <h3 class="font-bold">{{ section }}</h3>
                    <ul
                        :id="`section-${section}`"
                        class="template-list"
                        :data-section="section"
                    >
                        <li
                            v-for="t in templates.filter(
                                (t) => t.section === section
                            )"
                            :key="t.id"
                            :data-id="t.id"
                            class="template-item"
                        >
                            {{ t.title }}
                        </li>
                    </ul>
                </div> -->
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
        <Button
            label="Add section"
            variant="outlined"
            @button-click="addSection"
        />
    </section>
</template>

<script>
import { ref, onMounted } from "vue";
import Sortable from "sortablejs";
import Sortable from "sortablejs/modular/sortable.complete.esm.js";
import Button from "../components/Button.vue";
import InfoBox from "./InfoBox.vue";

export default {
    components: {
        Button,
        InfoBox,
    },

    setup() {
        const templates = ref([]);
        const sections = ref([]);

        onMounted(() => {
            chrome.storage.local.get(["templates", "sections"], (result) => {
                templates.value = result.templates || [];
                sections.value = result.sections || [];

                // After setting `sections`, mount Sortable
                const sectionNames = ["", ...sections.value];
                sectionNames.forEach((sectionName) => {
                    Sortable.create(
                        document.getElementById(`section-${sectionName}`),
                        {
                            group: "templates",
                            animation: 150,
                            onEnd: (evt) => {
                                const movedId = evt.item.dataset.id;
                                const newSection =
                                    evt.to.dataset.section || null;
                                const templateToMove = templates.value.find(
                                    (t) => t.id === movedId
                                );

                                if (templateToMove) {
                                    templateToMove.section = newSection;
                                    chrome.storage.local.set({
                                        templates: templates.value,
                                    });
                                }
                            },
                        }
                    );
                });
            });
        });

        // onMounted(() => {
        //     chrome.storage.local.get(["templates", "sections"], (result) => {
        //         templates.value = result.templates || [];
        //         sections.value = result.sections || [];
        //     });
        // });

        // onMounted(() => {
        //     const sectionsList = ["", ...sections.value]; // "" = unsorted
        //     sectionsList.forEach((sectionName) => {
        //         Sortable.create(
        //             document.getElementById(`section-${sectionName}`),
        //             {
        //                 group: "templates",
        //                 animation: 150,
        //                 onEnd: (evt) => {
        //                     const movedId = evt.item.dataset.id;
        //                     const newSection = evt.to.dataset.section || null;

        //                     const templateToMove = templates.value.find(
        //                         (t) => t.id === movedId
        //                     );
        //                     if (templateToMove) {
        //                         templateToMove.section = newSection;
        //                         chrome.storage.local.set({
        //                             templates: templates.value,
        //                         });
        //                     }
        //                 },
        //             }
        //         );
        //     });
        // });

        // onMounted(() => {
        //     chrome.storage.local.get(["templates"], (result) => {
        //         templates.value = result.templates;
        //         console.log("Templates:", templates.value);
        //     });
        // });

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
            const newSection = prompt("Enter section name:");
            if (!newSection) return;

            const cleanName = newSection.trim();
            if (sections.value.includes(cleanName)) {
                alert("That section already exists.");
                return;
            }

            // sections.value.push(cleanName);
            // chrome.storage.local.set({ sections: sections.value });

            sections.value.push(cleanName);
            chrome.storage.local.set({ sections: sections.value }, () => {
                initSortables(); // add sortable to the new section
            });
        };

        const initSortables = () => {
            const sectionNames = ["", ...sections.value];
            sectionNames.forEach((sectionName) => {
                const el = document.getElementById(`section-${sectionName}`);
                if (el && !el._sortableInitialized) {
                    Sortable.create(el, {
                        group: "templates",
                        animation: 150,
                        onEnd: (evt) => {
                            const movedId = evt.item.dataset.id;
                            const newSection = evt.to.dataset.section || null;
                            const templateToMove = templates.value.find(
                                (t) => t.id === movedId
                            );

                            if (templateToMove) {
                                templateToMove.section = newSection;
                                chrome.storage.local.set({
                                    templates: templates.value,
                                });
                            }
                        },
                    });
                    el._sortableInitialized = true;
                }
            });
        };

        return {
            templates,
            openOrFocusCreateTemplateWindow,
            uploadTemplates,
            addSalutation,
            addSection,
            initSortables,
        };
    },
};
</script>

<style scoped>
.template-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0;
    list-style: none;
}

.template-item {
    padding: 0.5rem 1rem;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 6px;
    cursor: grab;
}
</style>
