<template>
    <h1>GENERATE EMAILLLL</h1>
    <p>do all the stuff here</p>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
export default {
    setup() {
        const templates = ref([]);

        onMounted(() => {
            chrome.storage.session.get(["templatesToFill"], (data) => {
                if (data.templatesToFill) {
                    templates.value = data.templatesToFill;
                    console.log("templates.value: ", templates.value);
                    // extractPlaceholdersFromTemplates(data.templatesToFill);
                }
            });
        });

        return {};
    },
};
</script>

<style scoped></style>
