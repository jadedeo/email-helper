<!-- src/components/GenerateEmailPage.vue -->

<template>
    <div class="flex flex-col gap-5 mb-6">
        <section class="flex flex-col gap-3 px-6">
            <h2>What's wrong?</h2>
            <p>
                Please select all aspects of this permit that restrict automatic
                approval. These selections will be used to populate a template.
            </p>
        </section>
        <hr />

        <section
            class="px-6"
            v-for="(section, index) in populatedSections"
            :key="section"
        >
            <h3 class="font-semibold mb-2">
                {{ section }}
            </h3>
            <ul
                class="flex flex-col gap-2"
                :class="index < populatedSections.length - 1 ? 'mb-4' : ''"
            >
                <li
                    v-for="template in sectionTemplates[section] || []"
                    :key="template.id"
                    class="flex items-center gap-2"
                >
                    <input
                        type="checkbox"
                        :id="template.id"
                        :value="template.id"
                        v-model="selectedTemplates"
                    />
                    <label :for="template.id">{{ template.title }}</label>
                </li>
            </ul>

            <hr v-if="index < populatedSections.length - 1" />
        </section>
        <section class="px-6">
            <Button
                label="Next"
                variant="outlined"
                @button-click="() => openOrFocusGenerateEmailWindow()"
            />
        </section>
    </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import Button from "../components/Button.vue";

export default {
    components: {
        Button,
    },
    setup() {
        const templates = ref([]);
        const sections = ref([]);
        const selectedTemplates = ref([]);

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
            // console.log(sections.value);
            // console.log(templates.value);
        });

        const sectionTemplates = computed(() => {
            const grouped = {};
            for (const template of templates.value) {
                const key = template.section?.trim() || "Miscellaneous";
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(template);
            }
            console.log("HERE", sectionTemplates.value);
            return grouped;
        });

        const populatedSections = computed(() =>
            [...sections.value, "Miscellaneous"].filter(
                (s) => sectionTemplates.value[s]?.length
            )
        );

        const openOrFocusGenerateEmailWindow = () => {
            const selected = templates.value.filter((t) =>
                selectedTemplates.value.includes(t.id)
            );

            chrome.runtime.sendMessage(
                {
                    type: "open-or-focus-generate-email",
                    payload: selected,
                },
                (response) => {
                    console.log("Response:", response);
                }
            );
        };

        return {
            templates,
            sections,
            selectedTemplates,
            populatedSections,
            sectionTemplates,
            openOrFocusGenerateEmailWindow,
        };
    },
};
</script>

<style scoped></style>
