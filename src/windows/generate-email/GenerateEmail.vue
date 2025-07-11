<!-- src/windows/generate-email/GenerateEmail.vue -->
<template>
    <div class="w-full bg-gray-100 p-10 flex flex-col gap-5 h-dvh">
        <h3>Email Response Writer</h3>
        <div class="flex gap-3 flex-1">
            <!-- LEFT PANEL -->
            <div
                class="bg-white rounded-md h-full w-full p-5 flex flex-col gap-5"
            >
                <!-- SELECTIONS -->
                <section class="flex flex-col gap-2">
                    <h3>Selections</h3>
                    <div class="flex gap-1">
                        <span
                            class="bg-lime-50 border-1 border-solid border-lime-500 rounded-md px-2 py-1"
                            v-for="template in templates"
                        >
                            {{ template.title }}
                        </span>
                    </div>
                    <!-- TODO: add later/make selections editable -->
                    <!-- <Button label="Add More" variant="link" /> -->
                </section>

                <hr />

                <!-- ADD INPUTS -->
                <section class="flex flex-col gap-3">
                    <div>
                        <h3>Add Inputs</h3>
                        <p>Please complete the missing inputs in this email.</p>
                    </div>

                    <div
                        v-for="(val, label) in inputValues"
                        :key="label"
                        class="flex flex-col"
                    >
                        <label :for="label" class="font-bold">{{
                            label
                        }}</label>
                        <input
                            type="text"
                            class=""
                            v-model="inputValues[label]"
                            :id="label"
                            :placeholder="`Enter ${label.toLowerCase()}`"
                        />
                    </div>
                </section>
            </div>

            <!-- RIGHT PANEL -->
            <div class="bg-white rounded-md h-full w-full">
                <section class="flex flex-col p-5 gap-3">
                    <label for="input-subject"></label>
                    <input
                        v-model="subject"
                        id="input-subject"
                        type="text"
                        placeholder="Subject"
                        class="!border-none !p-0"
                    />
                    <!-- <small>{{ subject }}</small> -->
                    <hr />
                    <!-- TODO: make preview editable -->
                    <div v-html="filledHTML"></div>
                </section>
            </div>
        </div>

        <div class="flex justify-end gap-5 w-fill">
            <Button
                @button-click="closeGenerateEmail"
                label="Cancel"
                variant="outlined"
                class="!w-fit !px-10"
            />

            <Button
                @button-click="copyFormattedEmail"
                label="Copy with Formatting"
                variant="outlined"
                class="!w-fit !px-10"
            />

            <Button
                @button-click="launchPlaintextEmail"
                label="Create Draft in Mail Client"
                class="!w-fit !px-10"
                :disabled="disableLaunchInbox"
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
        const subject = ref("");
        const templates = ref([]);

        let extractedHTML = ref("");
        const inputValues = ref({});

        onMounted(() => {
            chrome.storage.session.get(["templatesToFill"], (data) => {
                if (data.templatesToFill) {
                    templates.value = data.templatesToFill;

                    templates.value.forEach((template) => {
                        extractedHTML.value += template.body;
                    });

                    console.log(extractedHTML.value);

                    const placeholderRegex =
                        /<custom-input\s+label="([^"]+)"\s*><\/custom-input>/g;
                    const uniqueLabels = new Set();
                    let match;

                    while (
                        (match = placeholderRegex.exec(extractedHTML.value)) !==
                        null
                    ) {
                        uniqueLabels.add(match[1]);
                    }

                    uniqueLabels.forEach((label) => {
                        inputValues.value[label] = "";
                    });

                    console.log("Input labels found:", [...uniqueLabels]);
                }
            });
        });

        const filledHTML = computed(() => {
            let result = extractedHTML.value;

            for (const [label, value] of Object.entries(inputValues.value)) {
                const regex = new RegExp(
                    `<custom-input\\s+label="${label}"\\s*><\\/custom-input>`,
                    "g"
                );

                const isEmpty = value.trim() === "";
                const pillClass = isEmpty
                    ? "bg-white border border-red-400"
                    : "bg-white border border-lime-500";

                const displayValue = isEmpty ? label : value;

                result = result.replace(
                    regex,
                    `<span class="${pillClass} px-2 py-0 rounded-full font-semibold drop-shadow-sm">${displayValue}</span>`
                );
            }

            return result;
        });

        const closeGenerateEmail = () => {
            console.log("CLOSE CREATE TEMPLATE WINDOW");
            window.close();
        };

        const launchPlaintextEmail = () => {
            // Create a temporary DOM element to parse the HTML
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = filledHTML.value;

            // Traverse the nodes and convert block-level elements into line breaks
            const walk = (node) => {
                let text = "";

                node.childNodes.forEach((child) => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        text += child.textContent;
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        const tag = child.tagName.toLowerCase();

                        if (tag === "br") {
                            text += "\n";
                        } else if (
                            ["p", "div", "section", "li"].includes(tag)
                        ) {
                            text += walk(child) + "\n\n";
                        } else if (
                            tag === "span" ||
                            tag === "strong" ||
                            tag === "b" ||
                            tag === "em"
                        ) {
                            text += walk(child);
                        } else {
                            text += walk(child);
                        }
                    }
                });

                return text;
            };

            const plainTextWithBreaks = walk(tempDiv)
                .replace(/\n{3,}/g, "\n\n") // limit multiple line breaks
                .trim();

            const mailtoLink = `mailto:?subject=${encodeURIComponent(
                subject.value
            )}&body=${encodeURIComponent(plainTextWithBreaks)}`;
            window.location.href = mailtoLink;
        };

        const copyFormattedEmail = async () => {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        "text/html": new Blob([filledHTML.value], {
                            type: "text/html",
                        }),
                    }),
                ]);
                alert("Formatted email copied to clipboard!");
            } catch (err) {
                console.error("Clipboard copy failed:", err);
                alert("Could not copy email. Please try again.");
            }
        };

        const disableLaunchInbox = computed(() => {
            const allInputsFilled = Object.values(inputValues.value).every(
                (val) => val.trim() !== ""
            );
            const subjectFilled = subject.value.trim() !== "";

            return !allInputsFilled || !subjectFilled;
        });

        return {
            subject,
            templates,
            extractedHTML,
            inputValues,
            closeGenerateEmail,
            disableLaunchInbox,
            filledHTML,
            launchPlaintextEmail,
            copyFormattedEmail,
        };
    },
};
</script>

<style scoped></style>
