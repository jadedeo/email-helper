<!-- App.vue -->
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
        @navigate="currentView = $event"
        @generate="handleGenerate"
    />
</template>

<script>
// TODO: switch over all components to <script setup>
import { h, ref, computed } from "vue";
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

        const handleGenerate = (templates) => {
            selectedTemplates.value = templates;
        };

        const viewMap = {
            home: GenerateEmailPage,
            templates: TemplatesPage,
            emailEditor: {
                render() {
                    return h(GenerateEmail, {
                        templates: selectedTemplates.value,
                    });
                },
            },
            templateEditor: CreateTemplate,
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
        };
    },
};
</script>

<style scoped></style>
