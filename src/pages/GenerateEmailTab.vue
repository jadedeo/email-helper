<!-- pages/GenerateEmailTab.vue -->
<template>
    <div
        class="flex justify-center bg-white min-h-[85%]"
        :class="!hasCoreTemplates || !hasSalutations ? 'pt-[100px]' : ''"
    >
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
                    <div class="flex gap-2">
                        <input
                            type="text"
                            v-model="searchQuery"
                            placeholder="Search for templates"
                            class="standard"
                        />
                        <!-- <Button label="Search" @click="handleSearch" /> -->
                    </div>
                </section>
                <hr v-if="hasCoreTemplates && hasSalutations" />

                <div class="flex flex-col gap-5">
                    <!--  v-if="
                            orderedSections.length &&
                            hasCoreTemplates &&
                            hasSalutations
                        "
                        v-for="(section, index) in orderedSections" -->
                    <section
                        v-if="
                            visibleSections.length &&
                            hasCoreTemplates &&
                            hasSalutations
                        "
                        v-for="(section, index) in visibleSections"
                        :key="section"
                        class="px-6"
                    >
                        <h3 class="font-semibold mb-2">
                            {{ section }}
                        </h3>
                        <!-- :class="
                                index < orderedSections.length - 1
                                    ? '!mb-4'
                                    : ''
                            " -->
                        <ul
                            class="flex flex-col gap-2 !m-0 !p-0"
                            :class="
                                index < visibleSections.length - 1
                                    ? '!mb-4'
                                    : ''
                            "
                        >
                            <!-- v-for="template in sectionTemplates[section] ||
                                []" -->
                            <li
                                v-for="template in filteredSectionTemplates[
                                    section
                                ] || []"
                                :key="template.id"
                                class="flex items-center gap-2 w-full"
                            >
                                <input
                                    type="checkbox"
                                    :id="template.id"
                                    :value="template.id"
                                    v-model="selectedTemplates"
                                />
                                <label :for="template.id" class="w-full">{{
                                    template.title
                                }}</label>
                            </li>
                        </ul>

                        <!-- v-if="
                                index < populatedSections.length - 1 &&
                                templates.filter(
                                    (template) =>
                                        template.section !== 'Salutations'
                                ).length > 0 &&
                                hasCoreTemplates &&
                                hasSalutations
                            " -->
                        <hr
                            v-if="
                                index < visibleSections.length - 1 &&
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
                <div class="mx-auto max-w-[550px] px-6 pt-3 pb-5">
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
import { ref, onMounted, computed, watch } from "vue";
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
const searchQuery = ref("");

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

watch(searchQuery, (oldSearchQuery, newSearchQuery) => {
    if (oldSearchQuery === newSearchQuery) {
        return;
    } else {
        handleSearch();
    }
});

const handleSearch = () => {
    console.log("search for", searchQuery.value);

    // if found in section, return entire section
    // from sections not already returned, search template titles
    // if found in template title(s), display section name & then found template(s)
    // uncategorized templates section should always be displayed last
};

// ---------------

// remove the watch() and handleSearch()
// add these helpers + computed:

const norm = (s) => (s || "").toString().toLowerCase().trim();

const visibleSections = computed(() => {
    // base: same ordering you already use
    const allOrdered = orderedSections.value.slice(); // e.g., ["Rules", "Fees", ..., "Uncategorized Templates"]
    const q = norm(searchQuery.value);

    if (!q) return allOrdered;

    const fullMatches = [];
    const partialMatches = [];
    const used = new Set();

    // 1) Section-name matches → whole section
    for (const section of allOrdered) {
        if (norm(section).includes(q)) {
            fullMatches.push(section);
            used.add(section);
        }
    }

    // 2) From remaining sections, match template titles
    for (const section of allOrdered) {
        if (used.has(section)) continue;
        const templatesInSection = (
            sectionTemplates.value[section] || []
        ).filter((t) => norm(t.title).includes(q));
        if (templatesInSection.length) {
            partialMatches.push(section);
        }
    }

    // 3) Combine; ensure "Uncategorized Templates" is last if present
    const combined = [...fullMatches, ...partialMatches];

    const U = "Uncategorized Templates";
    const withoutU = combined.filter((s) => s !== U);
    return combined.includes(U) ? [...withoutU, U] : withoutU;
});

// map of templates that should render for each visible section
const filteredSectionTemplates = computed(() => {
    const q = norm(searchQuery.value);
    if (!q) return sectionTemplates.value; // show all like today

    const out = {};
    const U = "Uncategorized Templates";
    const isSectionFullMatch = new Set();

    // mark sections that matched by name (to include all of their templates)
    for (const s of orderedSections.value) {
        if (norm(s).includes(q)) isSectionFullMatch.add(s);
    }

    for (const section of visibleSections.value) {
        const all = sectionTemplates.value[section] || [];
        out[section] = isSectionFullMatch.has(section)
            ? all // full section
            : all.filter((t) => norm(t.title).includes(q)); // only matching titles
    }

    // Always keep Uncategorized last if it exists in the result
    if (out[U]) {
        const { [U]: uncategorized, ...rest } = out;
        return { ...rest, [U]: uncategorized };
    }
    return out;
});
</script>

<style scoped></style>
