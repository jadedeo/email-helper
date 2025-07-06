<template>
    <section class="flex flex-col gap-5">
        <div class="flex flex-col gap-3">
            <h2>What is wrong?</h2>
            <p>
                Please select all aspects of this permit that restrict automatic
                approval. THese selections will automatically populate a
                template.
            </p>
        </div>
    </section>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
    setup() {
        onMounted(() => {
            chrome.storage.local.get(["templates"], (result) => {
                console.log("Templates:", result.templates);
            });
        });
        return {};
    },
};
</script>

<style scoped></style>
