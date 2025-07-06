<!-- src/windows/create-template/CreateTemplate.vue -->
<template>
    <div class="h-full w-full bg-gray-100 p-10 flex flex-col gap-5">
        <input
            type="text"
            v-model="templateTitle"
            placeholder="Untitled Template"
            class="text-lg font-bold"
        />
        <editor v-model="templateBody" />

        <div class="output-group">
            <label>Content</label>
            <code>{{ templateTitle }}</code>
            <code>{{ templateBody }}</code>
        </div>

        <div class="flex justify-end gap-10">
            <Button @button-click="closeCreateTemplate" label="Cancel" />
            <Button
                @button-click="createTemplate"
                :disabled="disableCreateTemplate"
                label="Create template"
            />
        </div>
    </div>
</template>

<script>
import { ref, computed } from "vue";

import "../../../src/style.css";
import Editor from "../../components/Editor.vue";
import Button from "../../components/Button.vue";

export default {
    components: {
        Editor,
        Button,
    },
    setup() {
        // console.log("chrome.storage?", chrome?.storage);
        // console.log("typeof chrome", typeof chrome);

        const templateTitle = ref("");
        const templateBody = ref("");

        const disableCreateTemplate = computed(function () {
            return (
                templateTitle.value.trim() === "" ||
                templateBody.value.trim() === ""
            );
        });

        const closeCreateTemplate = () => {
            console.log("CLOSE CREATE TEMPLATE WINDOW");
        };

        const createTemplate = () => {
            if (typeof chrome === "undefined" || !chrome.storage) {
                console.error("Chrome storage is not available.");
                return;
            }

            const newTemplate = {
                id: crypto.randomUUID(),
                title: templateTitle.value.trim(),
                body: templateBody.value.trim(),
                section: null, // <- Unsorted by default
            };

            chrome.storage.local.get(["templates"], (result) => {
                const existing = result.templates || [];
                existing.push(newTemplate);
                chrome.storage.local.set({ templates: existing });
            });

            // chrome.storage.local.get(["templates"], (result) => {
            //     const existing = result.templates || [];
            //     const newTemplate = {
            //         id: Date.now(),
            //         title: templateTitle.value.trim(),
            //         body: templateBody.value.trim(),
            //     };

            //     existing.push(newTemplate);
            //     chrome.storage.local.set({ templates: existing }, () => {
            //         console.log("Saved:", newTemplate);
            //     });
            // });
        };

        return {
            templateTitle,
            templateBody,
            disableCreateTemplate,
            closeCreateTemplate,
            createTemplate,
        };
    },
};
</script>
