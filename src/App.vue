<!-- App.vue -->
<!-- TODO: switch over all components to <script setup> -->
<template>
    <section v-if="showTabs" class="px-6 mt-6">
        <div
            class="bg-gray-100 flex w-full rounded-md p-[1px] border-1 border-gray-100 border-solid"
        >
            <Button
                @button-click="currentView = 'home'"
                label="Generate Email"
                :variant="currentView === 'home' ? 'activetab' : 'inactivetab'"
                ><FlashIcon :size="18"
            /></Button>

            <Button
                @button-click="currentView = 'templates'"
                label="Templates"
                :variant="
                    currentView === 'templates' ? 'activetab' : 'inactivetab'
                "
                ><TextBoxMultipleIcon :size="18"
            /></Button>
        </div>
    </section>

    <component
        :is="currentComponent"
        :key="componentKey"
        @navigate="currentView = $event"
        @generate="handleGenerate"
        @edit-template="handleEditTemplate"
        @close="() => (currentView = 'templates')"
        @load-templates="() => (currentView = 'templates')"
    ></component>
</template>

<script>
import { h, ref, computed, watch } from "vue";
import GenerateEmailPage from "./components/GenerateEmailPage.vue";
import TemplatesPage from "./components/TemplatesPage.vue";
import CreateTemplate from "./windows/create-template/CreateTemplate.vue";
import GenerateEmail from "./windows/generate-email/GenerateEmail.vue";
import Button from "./components/Button.vue";
import FlashIcon from "vue-material-design-icons/Flash.vue";
import TextBoxMultipleIcon from "vue-material-design-icons/TextBoxMultiple.vue";

export default {
    components: {
        GenerateEmailPage,
        TemplatesPage,
        GenerateEmail,
        CreateTemplate,
        Button,
        FlashIcon,
        TextBoxMultipleIcon,
    },
    setup() {
        const currentView = ref("home");
        const selectedTemplates = ref([]);
        const templateToEdit = ref(null);

        const componentKey = ref(0);

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
            home: GenerateEmailPage,
            templates: {
                render() {
                    return h(TemplatesPage, {
                        currentView: currentView.value,
                    });
                },
            },
            emailEditor: {
                render() {
                    return h(GenerateEmail, {
                        templates: selectedTemplates.value,
                    });
                },
            },
            templateEditor: {
                render() {
                    return h(CreateTemplate, {
                        templateToEdit: templateToEdit.value,
                        onClose: () => {
                            // force chrome.storage.set to complete before navigating
                            chrome.storage.local.get("templates", (result) => {
                                console.log(
                                    "latest templates",
                                    result.templates
                                ); // optional
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
            return ["home", "templates"].includes(currentView.value);
        });

        const displayPage = (page) => {
            console.log("display ", page);
            currentView.value = page;
        };

        return {
            currentView,
            currentComponent,
            displayPage,
            showTabs,
            handleGenerate,
            handleEditTemplate,
            templateToEdit,
            componentKey,
        };
    },
};
</script>

<style scoped></style>

<!-- Button-CqOcMjlG.js:14  TypeError: Cannot create property 'value' on string 'templateEditor' -->
