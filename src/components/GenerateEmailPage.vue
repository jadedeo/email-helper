<!-- src/components/GenerateEmailPage.vue -->

<template>
    <div class="flex flex-col gap-5 mb-6">
        <!-- TODO: turn this condition into computed property; used 4 times here -->
        <section
            v-if="
                templates.filter(
                    (template) => template.section !== 'Salutations'
                ).length == 0 &&
                greetingTemplate &&
                signOffTemplate
            "
            class="flex flex-col gap-2 px-6"
        >
            <h2>You don't have any templates yet!</h2>
            <p>
                Navigate to the templates tab to fill out your first template.
            </p>
        </section>
        <section
            v-else-if="
                templates.filter(
                    (template) => template.section !== 'Salutations'
                ).length > 0 &&
                (!greetingTemplate || !signOffTemplate)
            "
            class="flex flex-col gap-2 px-6"
        >
            <h2>You haven't finished your salutations!</h2>
            <p>
                Navigate to the templates tab to configure your default greeting
                & sign-off.
            </p>
        </section>
        <section v-else class="flex flex-col gap-2 px-6">
            <h2>What's wrong?</h2>
            <p>
                Please select all aspects of this permit that restrict automatic
                approval. These selections will be used to populate a template.
            </p>
        </section>
        <hr
            v-if="
                templates.filter(
                    (template) => template.section !== 'Salutations'
                ).length > 0 &&
                greetingTemplate &&
                signOffTemplate
            "
        />

        <section
            v-if="
                templates.filter(
                    (template) => template.section !== 'Salutations'
                ).length > 0 &&
                greetingTemplate &&
                signOffTemplate
            "
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

            <hr
                v-if="
                    index < populatedSections.length - 1 &&
                    templates.filter(
                        (template) => template.section !== 'Salutations'
                    ).length > 0 &&
                    greetingTemplate &&
                    signOffTemplate
                "
            />
        </section>
        <section
            v-if="
                templates.filter(
                    (template) => template.section !== 'Salutations'
                ).length > 0 &&
                greetingTemplate &&
                signOffTemplate
            "
            class="px-6"
        >
            <!-- <p>disableNext:{{ disableNext }}</p> -->
            <Button
                label="Next"
                variant="outlined"
                @button-click="() => openOrFocusGenerateEmailWindow()"
                :disabled="disableNext"
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
                    // console.warn(
                    //     "⚠️ Invalid sections format:",
                    //     result.sections
                    // );
                }
            });
            // console.log(sections.value);
            // console.log(templates.value);
        });

        const sectionTemplates = computed(() => {
            const grouped = {};
            for (const template of templates.value) {
                const key =
                    template.section?.trim() || "Uncategorized Templates";
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(template);
            }
            // console.log("HERE", sectionTemplates.value);
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

        const populatedSections = computed(() =>
            [...sections.value, "Uncategorized Templates"].filter(
                (s) => sectionTemplates.value[s]?.length
            )
        );

        const disableNext = computed(() => {
            return selectedTemplates.value.length == 0;
        });

        const openOrFocusGenerateEmailWindow = () => {
            const selected = templates.value.filter((t) =>
                selectedTemplates.value.includes(t.id)
            );

            if (greetingTemplate.value)
                selected.unshift(greetingTemplate.value);
            if (signOffTemplate.value) selected.push(signOffTemplate.value);

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
            disableNext,
            populatedSections,
            sectionTemplates,
            openOrFocusGenerateEmailWindow,
        };
    },
};
</script>

<style scoped></style>
