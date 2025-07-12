<!-- src/windows/generate-email/GenerateEmail.vue -->
<template>
    <div class="w-full bg-gray-100 p-10 flex flex-col gap-5 h-dvh">
        <h3>Email Response Writer</h3>
        <div class="flex gap-3 flex-1 overflow-hidden">
            <!-- LEFT PANEL -->
            <div
                class="bg-white rounded-md h-full p-5 flex flex-col flex-[1] gap-5 overflow-hidden"
            >
                <!-- SELECTIONS -->
                <section class="flex flex-col gap-2">
                    <h3>Selections</h3>
                    <div class="flex gap-1 flex-wrap">
                        <span
                            class="bg-lime-50 border-1 border-solid border-lime-500 rounded-md px-2 py-1 min-w-fit"
                            v-for="template in templates.filter(
                                (template) => template.section !== 'Salutations'
                            )"
                        >
                            {{ template.title }}
                        </span>
                    </div>
                    <!-- TODO: make selections editable -->
                    <!-- <Button label="Add More" variant="link" /> -->
                </section>

                <hr />

                <!-- ADD INPUTS -->
                <section class="flex flex-col flex-1 overflow-auto gap-5 pr-2">
                    <div>
                        <h3>Add Inputs</h3>
                        <p>Please complete the missing inputs in this email.</p>
                    </div>

                    <div
                        v-for="(val, label) in inputValues"
                        :key="label"
                        class="flex flex-col gap-1"
                    >
                        <label :for="label" class="font-bold">{{
                            label
                        }}</label>
                        <input
                            type="text"
                            class="standard"
                            v-model="inputValues[label]"
                            :id="label"
                            :placeholder="`Enter ${label.toLowerCase()}`"
                        />
                    </div>
                </section>
            </div>

            <!-- RIGHT PANEL -->
            <div
                class="bg-white rounded-md h-full w-full flex flex-col flex-[2]"
            >
                <section class="flex flex-col p-5 gap-3 flex-1 overflow-auto">
                    <label for="input-subject"></label>
                    <input
                        v-model="subject"
                        id="input-subject"
                        type="text"
                        placeholder="Subject"
                        class="!border-none !p-0"
                    />

                    <hr />
                    <!-- TODO: make preview editable -->
                    <div v-html="filledHTML" class="overflow-auto"></div>
                </section>
            </div>
        </div>

        <div class="flex justify-end gap-3 w-fill">
            <!-- TOAST HERE -->

            <transition name="fade">
                <div v-if="showToast" class="text-gray-500 py-2">Copied!</div>
            </transition>

            <Button
                @button-click="copyFormattedEmail"
                label="Copy with Formatting"
                variant="outlined"
                class="!w-fit !px-5"
                :disabled="disableCopyAndDraft"
            />

            <Button
                @button-click="launchPlaintextEmail"
                label="Create Draft in Mail Client"
                class="!w-fit !px-5"
                :disabled="disableCopyAndDraft"
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

        const showToast = ref(false);

        onMounted(() => {
            chrome.storage.session.get(["templatesToFill"], (data) => {
                if (data.templatesToFill) {
                    templates.value = data.templatesToFill;

                    templates.value.forEach((template, index) => {
                        extractedHTML.value += template.body;
                        if (index < templates.value.length - 1) {
                            extractedHTML.value += `<div data-template-split style="height: 1.5rem;"></div>`;
                        }
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

                    console.log("input labels found", [...uniqueLabels]);
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
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = filledHTML.value;

            const walk = (node) => {
                let text = "";

                node.childNodes.forEach((child) => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        text += child.textContent;
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        const tag = child.tagName.toLowerCase();

                        if (tag === "br") {
                            text += "\n";
                        } else if (tag === "p") {
                            if (child.textContent.trim() === "") {
                                text += "\n";
                            } else {
                                text += walk(child) + "\n";
                            }
                        } else if (
                            tag === "div" &&
                            child.dataset.templateSplit !== undefined
                        ) {
                            // spacer between templates
                            text += "\n\n";
                        } else if (
                            ["p", "div", "section", "li"].includes(tag)
                        ) {
                            text += walk(child) + "\n";
                        } else {
                            text += walk(child);
                        }
                    }
                });

                return text;
            };

            const plainTextWithBreaks = walk(tempDiv)
                .replace(/\n{3,}/g, "\n\n") // collapse excessive spacing
                .replace(/[ \t]+\n/g, "\n") // clean trailing whitespace
                .trim();

            const mailtoLink = `mailto:?subject=${encodeURIComponent(
                subject.value
            )}&body=${encodeURIComponent(plainTextWithBreaks)}`;
            window.location.href = mailtoLink;
        };

        const copyFormattedEmail = async () => {
            try {
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = filledHTML.value;

                tempDiv
                    .querySelectorAll("[data-template-split]")
                    .forEach((el) => {
                        const spacer = document.createElement("span");
                        spacer.innerHTML = "&nbsp;";
                        spacer.style.display = "block";
                        spacer.style.lineHeight = "1.5em";
                        spacer.style.marginTop = "0.75em";
                        spacer.style.marginBottom = "0.75em";
                        el.replaceWith(spacer);
                    });

                tempDiv.querySelectorAll("p, h1, h2, h3").forEach((p) => {
                    p.style.margin = "0";
                });

                tempDiv.querySelectorAll("p").forEach((p) => {
                    if (p.innerHTML.trim() === "") {
                        p.innerHTML = "&nbsp;";
                    }
                    p.style.margin = "0 0 1em 0"; // give all p tags bottom spacing
                });

                const wrappedHTML = `
            <div style="font-family: Calibri, sans-serif; font-size: 11pt;">
                ${tempDiv.innerHTML}
            </div>
        `;

                await navigator.clipboard.write([
                    new ClipboardItem({
                        "text/html": new Blob([wrappedHTML], {
                            type: "text/html",
                        }),
                    }),
                ]);

                showToast.value = true;
                setTimeout(() => (showToast.value = false), 2000);
            } catch (err) {
                console.error("Clipboard copy failed:", err);
                alert("Could not copy email. Please try again.");
            }
        };

        const disableCopyAndDraft = computed(() => {
            const allInputsFilled = Object.values(inputValues.value).every(
                (val) => val.trim() !== ""
            );
            // TODO: run by jyaleen - don't think it makes sense anymore for subject to be required
            // const subjectFilled = subject.value.trim() !== "";

            return !allInputsFilled /*|| !subjectFilled*/;
        });

        return {
            subject,
            templates,
            extractedHTML,
            inputValues,
            closeGenerateEmail,
            disableCopyAndDraft,
            filledHTML,
            launchPlaintextEmail,
            copyFormattedEmail,
            showToast,
        };
    },
};
</script>

<style scoped></style>
