<template>
    <div class="w-full bg-gray-100 p-10 flex flex-col gap-5 h-dvh">
        <h3>Email Response Writer</h3>
        <div class="flex gap-3 flex-1">
            <!-- LEFT PANEL -->
            <div class="bg-white rounded-md h-full w-full">
                <!-- SELECTIONS -->
                <section>
                    <h3>Selections</h3>
                    <!-- TODO: ask jyaleen what this is supposed to look like when clicked -->
                    <Button disabled="true" label="Add More" />
                </section>

                <!-- ADD INPUTS -->
                <section>
                    <h3>Add Inputs</h3>
                    <p>Please complete the missing inputs in this email.</p>
                </section>
            </div>

            <!-- RIGHT PANEL -->
            <div class="bg-white rounded-md h-full w-full">
                <section><input type="text" placeholder="Subject" /></section>
            </div>
        </div>

        <div class="flex justify-end gap-2 w-fill">
            <Button
                @button-click="closeGenerateEmail"
                label="Cancel"
                variant="outlined"
                class="!w-fit !px-10"
            />

            <!-- TODO: update copy/run by jyaleen -->
            <Button
                @button-click="launchInbox"
                label="Launch Inbox"
                class="!w-fit !px-10"
            />
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
import Button from "../../components/Button.vue";
import "../../../src/style.css";

export default {
    components: {
        Button,
    },

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

        const closeGenerateEmail = () => {
            console.log("CLOSE CREATE TEMPLATE WINDOW");
            window.close();
        };

        const launchInbox = () => {
            console.log("LAUNCH INBOX");
            window.close();
        };
        return { templates, closeGenerateEmail, launchInbox };
    },
};
</script>

<style scoped></style>
