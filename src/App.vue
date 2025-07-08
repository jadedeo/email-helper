<!-- App.vue -->

<template>
    <section class="px-6 mt-6">
        <div
            class="bg-gray-100 flex w-full rounded-md p-[1px] border-1 border-gray-100 border-solid"
        >
            <Button
                @button-click="displayPage('generateemail')"
                label="Generate Email"
                :variant="
                    currentPage === 'generateemail'
                        ? 'activetab'
                        : 'inactivetab'
                "
                ><FlashIcon :size="18"
            /></Button>

            <Button
                @button-click="displayPage('templates')"
                label="Templates"
                :variant="
                    currentPage === 'templates' ? 'activetab' : 'inactivetab'
                "
                ><TextBoxMultipleIcon :size="18"
            /></Button>
        </div>
    </section>

    <GenerateEmailPage v-if="currentPage == 'generateemail'" />
    <TemplatesPage v-else />
</template>

<script>
import { ref } from "vue";
import GenerateEmailPage from "./components/GenerateEmailPage.vue";
import TemplatesPage from "./components/TemplatesPage.vue";
import Button from "./components/Button.vue";
import FlashIcon from "vue-material-design-icons/Flash.vue";
import TextBoxMultipleIcon from "vue-material-design-icons/TextBoxMultiple.vue";

export default {
    components: {
        GenerateEmailPage,
        TemplatesPage,
        Button,
        FlashIcon,
        TextBoxMultipleIcon,
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
