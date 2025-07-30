<!-- pages/GenerateEmailTab.vue -->
<template>
    <div
        class="flex justify-center bg-white min-h-[85%]"
        :class="!hasCoreTemplates || !hasSalutations ? 'pt-[100px]' : ''"
    >
        <!-- :class="!hasCoreTemplates || !hasSalutations ? 'items-center' : ''" -->
        <div
            class="flex flex-col gap-5 mb-6 max-w-[550px] w-full relative"
            :class="hasCoreTemplates && hasSalutations ? 'justify-between' : ''"
        >
            <IconCircle v-if="!hasCoreTemplates || !hasSalutations">
                <TextBoxMultipleIcon :size="50" />
            </IconCircle>

            <section
                v-if="!hasCoreTemplates"
                class="flex flex-col px-6 text-center"
            >
                <h2>You don't have any templates yet!</h2>
                <p>
                    Navigate to the templates tab to fill out your first
                    template.
                </p>
            </section>

            <section
                v-else-if="hasCoreTemplates && !hasSalutations"
                class="flex flex-col px-6 text-center"
            >
                <h2>You haven't finished your salutations!</h2>
                <p>
                    Navigate to the templates tab to configure your default
                    greeting & sign-off.
                </p>
            </section>

            <div v-else class="flex flex-col gap-5">
                <section class="flex flex-col gap-2 px-6">
                    <h2>What's wrong?</h2>
                    <p>
                        Please select all issues you wish to address in your
                        email. These selections will be used to populate a
                        template.
                    </p>
                </section>
                <hr
                    class="thisone-2"
                    v-if="hasCoreTemplates && hasSalutations"
                />

                <div class="flex flex-col gap-5">
                    <section
                        v-if="
                            orderedSections.length &&
                            hasCoreTemplates &&
                            hasSalutations
                        "
                        v-for="(section, index) in orderedSections"
                        :key="section"
                        class="px-6"
                    >
                        <h3 class="font-semibold mb-2">
                            {{ section }}
                        </h3>
                        <ul
                            class="flex flex-col gap-2 !m-0 !p-0"
                            :class="
                                index < orderedSections.length - 1
                                    ? '!mb-4'
                                    : ''
                            "
                        >
                            <li
                                v-for="template in sectionTemplates[section] ||
                                []"
                                :key="template.id"
                                class="flex items-center gap-2"
                            >
                                <input
                                    type="checkbox"
                                    :id="template.id"
                                    :value="template.id"
                                    v-model="selectedTemplates"
                                />
                                <label :for="template.id">{{
                                    template.title
                                }}</label>
                            </li>
                        </ul>

                        <hr
                            class="thisone-1"
                            v-if="
                                index < populatedSections.length - 1 &&
                                templates.filter(
                                    (template) =>
                                        template.section !== 'Salutations'
                                ).length > 0 &&
                                hasCoreTemplates &&
                                hasSalutations
                            "
                        />
                    </section>
                </div>
            </div>

            <section
                v-if="hasCoreTemplates && hasSalutations"
                class="fixed bottom-0 inset-x-0 z-10 bg-white"
            >
                <div class="mx-auto max-w-[550px] px-6 py-3">
                    <Button
                        class="w-full"
                        label="Next"
                        variant="outlined"
                        @button-click="proceedToGenerateEmail"
                        :disabled="disableNext"
                    />
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import {
    loadTemplatesAndSections,
    getNonSalutations,
    getGreeting,
    getSignOff,
} from "../lib/utils.js";
import Button from "../components/Button.vue";
import TextBoxMultipleIcon from "vue-material-design-icons/TextBoxMultiple.vue";
import IconCircle from "../components/IconCircle.vue";

const emit = defineEmits(["navigate", "generate"]);

const templates = ref([]);
const sections = ref([]);
const selectedTemplates = ref([]);

onMounted(async () => {
    const { templates: t, sections: s } = await loadTemplatesAndSections();
    templates.value = t;
    sections.value = s;
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

    if (greetingTemplate.value) selected.unshift(greetingTemplate.value);
    if (signOffTemplate.value) selected.push(signOffTemplate.value);

    emit("generate", selected);
    emit("navigate", "emailEditor");
};

const sectionTemplates = computed(() => {
    const grouped = {};
    for (const template of templates.value) {
        const key = template.section?.trim() || "Uncategorized Templates";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(template);
    }
    return grouped;
});

const greetingTemplate = computed(() => {
    return getGreeting(templates.value);
});

const signOffTemplate = computed(() => {
    return getSignOff(templates.value);
});

const hasCoreTemplates = computed(() => {
    return getNonSalutations(templates.value);
});

const hasSalutations = computed(() => {
    return !!greetingTemplate.value && !!signOffTemplate.value;
});

const populatedSections = computed(() => {
    const grouped = {};

    for (const t of templates.value) {
        const key = t.section?.trim() || "Uncategorized Templates";
        if (key === "Salutations") continue;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(t);
    }

    return Object.keys(grouped);
});

const disableNext = computed(() => {
    return selectedTemplates.value.length == 0;
});
</script>

<style scoped></style>
