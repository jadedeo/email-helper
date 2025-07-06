<!-- App.vue -->

<template>
    <div
        class="bg-gray-100 flex w-full rounded-md p-[1px] border-1 border-gray-100 border-solid"
    >
        <Button
            @button-click="displayPage('generateemail')"
            label="Generate Email"
            :variant="
                currentPage === 'generateemail' ? 'activetab' : 'inactivetab'
            "
        />

        <Button
            @button-click="displayPage('templates')"
            label="Templates"
            :variant="currentPage === 'templates' ? 'activetab' : 'inactivetab'"
        />

        <!-- <button @click="openOrFocusCreateTemplateWindow">
            Manage Templates
        </button> -->
    </div>

    <GenerateEmailPage v-if="currentPage == 'generateemail'" />
    <TemplatesPage v-else />
</template>

<script>
import { ref } from "vue";
import GenerateEmailPage from "./components/GenerateEmailPage.vue";
import TemplatesPage from "./components/TemplatesPage.vue";
import Button from "./components/Button.vue";

export default {
    components: {
        GenerateEmailPage,
        TemplatesPage,
        Button,
    },
    setup() {
        const currentPage = ref("generateemail");
        const displayPage = (page) => {
            console.log("display ", page);
            currentPage.value = page;
        };

        return { currentPage, displayPage };
    },
};
</script>

<style scoped></style>
