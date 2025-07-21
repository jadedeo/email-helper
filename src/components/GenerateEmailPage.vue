<!-- src/components/GenerateEmailPage.vue -->

<template>
    <div class="flex justify-center bg-white">
        <div class="flex flex-col gap-5 mb-6 max-w-[550px]">
            <section v-if="!hasCoreTemplates" class="flex flex-col gap-2 px-6">
                <h2>You don't have any templates yet!</h2>
                <p>
                    Navigate to the templates tab to fill out your first
                    template.
                </p>
            </section>

            <section
                v-else-if="hasCoreTemplates && !hasSalutations"
                class="flex flex-col gap-2 px-6"
            >
                <h2>You haven't finished your salutations!</h2>
                <p>
                    Navigate to the templates tab to configure your default
                    greeting & sign-off.
                </p>
            </section>
            <section v-else class="flex flex-col gap-2 px-6">
                <h2>What's wrong?</h2>
                <p>
                    Please select all aspects of this permit that restrict
                    automatic approval. These selections will be used to
                    populate a template.
                </p>
            </section>
            <hr v-if="hasCoreTemplates && hasSalutations" />

            <section
                v-if="
                    orderedSections.length && hasCoreTemplates && hasSalutations
                "
                v-for="(section, index) in orderedSections"
                :key="section"
                class="px-6"
            >
                <!-- <section
                v-if="
                    populatedSections.length &&
                    hasCoreTemplates &&
                    hasSalutations
                "
                v-for="(section, index) in populatedSections"
                :key="section"
                class="px-6"
            > -->
                <h3 class="font-semibold mb-2">
                    {{ section }}
                </h3>
                <ul
                    class="flex flex-col gap-2"
                    :class="index < orderedSections.length - 1 ? 'mb-4' : ''"
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

                <hr
                    v-if="
                        index < populatedSections.length - 1 &&
                        templates.filter(
                            (template) => template.section !== 'Salutations'
                        ).length > 0 &&
                        hasCoreTemplates &&
                        hasSalutations
                    "
                />
            </section>
            <section
                v-if="
                    templates.filter(
                        (template) => template.section !== 'Salutations'
                    ).length > 0 &&
                    hasCoreTemplates &&
                    hasSalutations
                "
                class="px-6"
            >
                <Button
                    label="Next"
                    variant="outlined"
                    @button-click="proceedToGenerateEmail"
                    :disabled="disableNext"
                />
            </section>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import Button from "../components/Button.vue";
import GenerateEmail from "../windows/generate-email/GenerateEmail.vue";

export default {
    components: {
        Button,
        GenerateEmail,
    },
    emits: ["navigate", "generate"],
    setup(_, { emit }) {
        const templates = ref([]);
        const sections = ref([]);
        const selectedTemplates = ref([]);

        onMounted(() => {
            chrome.storage.local.get(["templates", "sections"], (result) => {
                console.log("GENERATE EMAIL PAGE:");
                console.log("TEMPLATES:", result.templates);
                console.log("SECTIONS:", result.sections);

                if (Array.isArray(result.templates)) {
                    templates.value = result.templates;
                }
                if (Array.isArray(result.sections)) {
                    sections.value = [...result.sections];
                } else if (result.sections !== undefined) {
                    // console.warn(
                    //     "⚠️ Invalid sections format:",
                    //     result.sections
                    // );
                }
                console.log("AGAIN:");

                console.log("TEMPLATES:", templates.value);
                console.log("SECTIONS:", sections.value);
            });
        });

        const orderedSections = computed(() => {
            return populatedSections.value
                .filter((s) => s !== "Uncategorized Templates")
                .concat(
                    populatedSections.value.includes("Uncategorized Templates")
                        ? ["Uncategorized Templates"]
                        : []
                );
        });

        const proceedToGenerateEmail = () => {
            const selected = templates.value.filter((t) =>
                selectedTemplates.value.includes(t.id)
            );

            if (greetingTemplate.value)
                selected.unshift(greetingTemplate.value);
            if (signOffTemplate.value) selected.push(signOffTemplate.value);

            emit("generate", selected);
            emit("navigate", "emailEditor");
        };

        const sectionTemplates = computed(() => {
            const grouped = {};
            for (const template of templates.value) {
                const key =
                    template.section?.trim() || "Uncategorized Templates";
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(template);
            }
            return grouped;
        });

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

        const hasCoreTemplates = computed(() => {
            return templates.value.some((t) => t.section !== "Salutations");
        });

        const hasSalutations = computed(() => {
            return !!greetingTemplate.value && !!signOffTemplate.value;
        });

        const populatedSections = computed(() => {
            const baseSections = new Set(sections.value);
            baseSections.add("Uncategorized Templates");

            return [...baseSections]
                .filter((s) => sectionTemplates.value[s]?.length)
                .filter((s) => s !== "Salutations");
        });

        const disableNext = computed(() => {
            return selectedTemplates.value.length == 0;
        });

        return {
            templates,
            sections,
            selectedTemplates,
            disableNext,
            populatedSections,
            sectionTemplates,
            greetingTemplate,
            signOffTemplate,
            hasCoreTemplates,
            hasSalutations,
            proceedToGenerateEmail,
            orderedSections,
        };
    },
};
</script>

<style scoped></style>
