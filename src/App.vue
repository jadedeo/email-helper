<!-- App.vue -->
<template>
    <div v-if="showTabs" class="flex justify-center">
        <section v-if="showTabs" class="px-6 mt-6 w-full max-w-[550px]">
            <div
                class="bg-gray-100 flex w-full rounded-md p-[1px] border-1 border-gray-100 border-solid"
            >
                <Button
                    @button-click="currentView = 'generate'"
                    label="Generate Email"
                    :variant="
                        currentView === 'generate' ? 'activetab' : 'inactivetab'
                    "
                    ><FlashIcon :size="18"
                /></Button>

                <Button
                    @button-click="currentView = 'templates'"
                    label="Templates"
                    :variant="
                        currentView === 'templates'
                            ? 'activetab'
                            : 'inactivetab'
                    "
                    ><TextBoxMultipleIcon :size="18"
                /></Button>
            </div>
        </section>
    </div>
    <component
        :is="currentComponent"
        :key="componentKey"
        @navigate="currentView = $event"
        @generate="handleGenerate"
        @edit-template="handleEditTemplate"
        @close="() => (currentView = 'templates')"
        @navigate-to-templates-tab="() => (currentView = 'templates')"
        @navigate-to-generate-tab="() => (currentView = 'generate')"
    ></component>
</template>

<script setup>
import { h, ref, computed, watch, onMounted } from "vue";
import {
    initializeDefaultInputOptions,
    loadTemplatesAndSections,
    updateDefaultInputsFromUploadedTemplates,
} from "./lib/utils.js";
import GenerateEmailTab from "./pages/GenerateEmailTab.vue";
import TemplatesTab from "./pages/TemplatesTab.vue";
import TemplateEditorPage from "./pages/TemplateEditorPage.vue";
import GenerateEmailPage from "./pages/GenerateEmailPage.vue";
import Button from "./components/Button.vue";
import FlashIcon from "vue-material-design-icons/Flash.vue";
import TextBoxMultipleIcon from "vue-material-design-icons/TextBoxMultiple.vue";
import defaultInputOptions from "../src/lib/defaultCustomInputOptions.json";

const currentView = ref("generate");
const selectedTemplates = ref([]);
const templateToEdit = ref(null);

const componentKey = ref(0);

onMounted(async () => {
    await initializeDefaultInputOptions(defaultInputOptions);
    const { templates } = await loadTemplatesAndSections();
    updateDefaultInputsFromUploadedTemplates(templates);
});

watch(currentView, (newVal) => {
    if (newVal === "templates") {
        // give time for onClose to finish storage update
        setTimeout(() => {
            componentKey.value += 1;
        }, 100);
    } else {
        componentKey.value += 1;
    }
});

const handleGenerate = (templates) => {
    selectedTemplates.value = templates;
};

const handleEditTemplate = (template) => {
    templateToEdit.value = template;
    currentView.value = "templateEditor";
};

const viewMap = {
    generate: GenerateEmailTab,
    templates: {
        render() {
            return h(TemplatesTab, {
                currentView: currentView.value,
            });
        },
    },
    emailEditor: {
        render() {
            return h(GenerateEmailPage, {
                templates: selectedTemplates.value,
            });
        },
    },
    templateEditor: {
        render() {
            return h(TemplateEditorPage, {
                templateToEdit: templateToEdit.value,
                onClose: () => {
                    // force chrome.storage.set to complete before navigating
                    chrome.storage.local.get("templates", (result) => {
                        currentView.value = "templates";
                        templateToEdit.value = null;
                    });
                },
            });
        },
    },
};

const currentComponent = computed(() => viewMap[currentView.value]);

const showTabs = computed(() => {
    return ["generate", "templates"].includes(currentView.value);
});
</script>

<style scoped></style>
