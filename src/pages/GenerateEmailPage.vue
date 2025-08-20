<!-- pages/GenerateEmailPage.vue -->
<!-- TODO: toggle preview based on formatting -->
<template>
    <div class="w-full bg-gray-100 py-3 px-6 flex flex-col gap-3 h-dvh">
        <div class="flex gap-3 flex-1 overflow-hidden">
            <!-- LEFT PANEL -->
            <div
                class="bg-white rounded-md h-full p-5 flex flex-col flex-[2] gap-3 overflow-hidden"
            >
                <!-- SELECTIONS -->
                <section class="flex flex-col gap-2">
                    <h3>Selections</h3>
                    <div class="flex gap-1 flex-wrap">
                        <span
                            class="bg-lime-50 border-1 border-solid border-lime-500 rounded-md px-2 py-1 min-w-fit"
                            v-for="template in props.templates.filter(
                                (template) => template.section !== 'Salutations'
                            )"
                        >
                            {{ template.title }}
                        </span>
                    </div>
                    <!-- TODO: make selections editable -->
                </section>

                <hr />

                <!-- ADD INPUTS -->
                <section class="flex flex-col flex-1 overflow-auto gap-3 pr-2">
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
                class="bg-white rounded-md h-full w-full flex flex-col flex-[5]"
            >
                <section class="flex flex-col p-5 gap-3 flex-1 overflow-auto">
                    <div>
                        <label for="input-subject"></label>
                        <input
                            v-model="subject"
                            id="input-subject"
                            type="text"
                            placeholder="Subject"
                            class="!border-none !p-0 w-full"
                        />
                    </div>

                    <hr />

                    <!-- RIGHT PANEL Preview -->
                    <div
                        v-if="isFormatted"
                        v-html="filledHTML"
                        class="overflow-y-auto wrap-normal"
                    ></div>

                    <div
                        v-else
                        v-html="strippedHTML"
                        class="overflow-y-auto wrap-normal"
                    ></div>
                </section>
            </div>
        </div>

        <div class="flex w-full justify-between">
            <Button
                label="Back to template selection"
                variant="redLink"
                @button-click="isModalOpen = true"
            />
            <div class="flex justify-end gap-3">
                <transition name="fade">
                    <div v-if="showToast" class="text-gray-500 py-2">
                        Copied!
                    </div>
                </transition>

                <div class="flex items-center gap-1 cursor">
                    <input
                        type="checkbox"
                        id="formatting-checkbox"
                        v-model="isFormatted"
                    />
                    <label for="formatting-checkbox">Apply Formatting</label>
                </div>

                <Button
                    v-if="isFormatted"
                    @button-click="copyFormattedEmail"
                    label="Copy with Formatting"
                    class="!w-[190px] !px-5"
                    :disabled="disableCopyAndDraft"
                />

                <Button
                    v-else
                    @button-click="launchPlaintextEmail"
                    label="Create Draft in Mail Client"
                    class="!w-[190px] !px-5"
                    :disabled="disableCopyAndDraft"
                />
            </div>
        </div>
    </div>
    <Modal v-if="isModalOpen" @close="isModalOpen = false">
        <template #title> You're about to lose all progress. </template>

        <template #footer>
            <Button
                label="Discard email"
                variant="grayFilled"
                @button-click="handleConfirmDiscardEmail"
            >
                <DeleteOutlineIcon fillColor="#e7000b" :size="18" />
            </Button>
        </template>
    </Modal>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Button from "../components/Button.vue";
import Modal from "../components/Modal.vue";
import DeleteOutlineIcon from "vue-material-design-icons/DeleteOutline.vue";

import "../style.css";

const props = defineProps({
    templates: {
        type: Array,
        required: true,
    },
});

const emit = defineEmits(["navigate-to-generate-tab"]);

const subject = computed(() => {
    const permit = inputValues.value["Permit Number"];
    return permit?.trim()
        ? `SFRPD Follow-Up: Permit #${permit}`
        : "SFRPD Follow-Up: Permit #";
});

let extractedHTML = ref("");
const inputValues = ref({});

const showToast = ref(false);
const isModalOpen = ref(false);
const isFormatted = ref(true);

// console.log("Selected templates:", props.templates);

onMounted(() => {
    const nonSalutationTemplates = props.templates.filter(
        (template) => template.section !== "Salutations"
    );
    const greeting = props.templates.find(
        (template) =>
            template.title === "Greeting" && template.section === "Salutations"
    );
    const signOff = props.templates.find(
        (template) =>
            template.title === "Sign-off" && template.section === "Salutations"
    );

    // build ordered array: greeting, core, sign-off
    const allTemplates = [];
    if (greeting) allTemplates.push(greeting);
    allTemplates.push(...nonSalutationTemplates);
    if (signOff) allTemplates.push(signOff);

    // map -> body + (divider if not last)
    extractedHTML.value = allTemplates
        .map((tpl, i) => {
            let html = tpl.body;
            if (i < allTemplates.length - 1) {
                html += `
                <div data-template-split style="height: 1.5rem;"></div>
                <hr data-template-split />
                <div data-template-split style="height: 1.5rem;"></div>`;
            }
            return html;
        })
        .join("");

    const placeholderRegex =
        /<custom-input\s+label="([^"]+)"\s*><\/custom-input>/g;

    const uniqueLabels = new Set();
    uniqueLabels.add("Permit Number");

    let match;
    while ((match = placeholderRegex.exec(extractedHTML.value)) !== null) {
        uniqueLabels.add(match[1]);
    }

    uniqueLabels.forEach((label) => {
        inputValues.value[label] = "";
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
            `<span class="custom-input-pill ${pillClass} px-2 py-0 rounded-full font-semibold drop-shadow-sm">${displayValue}</span>`
        );
    }

    return result;
});

const strippedHTML = computed(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(filledHTML.value, "text/html");

    // strip styles from all elements
    doc.body.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("style");

        // replace <hr data-template-split> with ---- divider
        if (el.tagName === "HR" && el.hasAttribute("data-template-split")) {
            const divider = doc.createElement("div");
            divider.textContent = "------------------------------------------";
            el.replaceWith(divider);
        }

        // replace <div data-template-split> with vertical spacing
        if (el.tagName === "DIV" && el.hasAttribute("data-template-split")) {
            const spacer = doc.createElement("br");
            el.replaceWith(spacer);
        }
    });

    // add new class for styling purposes
    doc.body.querySelectorAll("ul li").forEach((li) => {
        li.classList.add("unformatted-ul-li");
    });

    // replace headings with paragraphs
    doc.body.querySelectorAll("h1", "h2", "h3").forEach((h) => {
        const newParagraph = doc.createElement("p");
        newParagraph.textContent = h.textContent;
        h.replaceWith(newParagraph);
    });

    // replace empty <p></p> with <p>&nbsp;</p>
    doc.body.querySelectorAll("p").forEach((p) => {
        if (!p.textContent.trim()) {
            p.innerHTML = "&nbsp;";
        }
    });

    return doc.body.innerHTML;
});

const launchPlaintextEmail = () => {
    // get raw HTML
    const rawHTML = filledHTML.value;

    // split on divider markers then trim + drop any pieces that end up empty
    const htmlSections = rawHTML
        .split(
            /<hr[^>]*data-template-split[^>]*>|<div[^>]*data-template-split[^>]*>/gi
        )
        .map((s) => s.trim())
        .filter((s) => s !== "");

    // walk the DOM, preserving all intra-template newlines
    const walk = (node, depth = 0) => {
        let text = "";
        node.childNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
                text += child.textContent;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const tag = child.tagName.toLowerCase();
                if (tag === "br") {
                    text += "\n";
                } else if (tag === "ul") {
                    // unordered list
                    text += "\n";
                    child.querySelectorAll(":scope > li").forEach((li) => {
                        text +=
                            " ".repeat(depth * 2) + "- " + walk(li, depth + 1);
                    });
                    text += "\n";
                } else if (tag === "ol") {
                    // ordered list
                    text += "\n";
                    child.querySelectorAll(":scope > li").forEach((li, idx) => {
                        text +=
                            " ".repeat(depth * 2) +
                            `${idx + 1}. ` +
                            walk(li, depth + 1);
                    });
                    text += "\n";
                } else if (tag === "li") {
                    // should be handled by parent <ul>/<ol>, but keep safe fallback
                    text += walk(child, depth);
                } else {
                    text += walk(child);
                    if (["p", "div", "section"].includes(tag)) {
                        text += "\n";
                    }
                }
            }
        });
        return text;
    };

    // convert each chunk to plaintext, trim only at the very ends, then filter out any that somehow became empty
    const textSections = htmlSections
        .map((chunk) => {
            const container = document.createElement("div");
            container.innerHTML = chunk;
            // remove leading/trailing newlines/spaces only
            return walk(container).replace(/^[\s\n]+|[\s\n]+$/g, "");
        })
        .filter((txt) => txt.trim() !== ""); // second‐pass filter

    // join with custom divider
    const body = textSections.join(
        "\n\n------------------------------------------\n\n"
    );

    console.log(body);

    // fire mailto
    const mailto =
        `mailto:?subject=${encodeURIComponent(subject.value)}` +
        `&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
};

const copyFormattedEmail = async () => {
    try {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = filledHTML.value;

        tempDiv.querySelectorAll("[data-template-split]").forEach((el) => {
            if (el.tagName === "HR") {
                // style <hr> consistently
                el.style.border = "none";
                el.style.borderTop = "1px solid #ccc";
                el.style.margin = "0 0";
            } else {
                // add vertical spacing for <div data-template-split>
                const spacer = document.createElement("div");
                spacer.innerHTML = "&nbsp;";
                spacer.style.display = "block";
                spacer.style.lineHeight = "0.5em";
                spacer.style.marginTop = "0.5em";
                spacer.style.marginBottom = "0.5em";
                el.replaceWith(spacer);
            }
        });

        tempDiv.querySelectorAll("p, h1, h2, h3").forEach((p) => {
            p.style.margin = "0";
        });

        tempDiv.querySelectorAll("p").forEach((p) => {
            if (p.innerHTML.trim() === "") {
                p.innerHTML = "&nbsp;";
            }
            p.style.margin = "0 0 0.5em 0"; // give all p tags bottom spacing
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
    } catch (error) {
        console.error("Clipboard copy failed:", error);
        alert("Could not copy email. Please try again.");
    }
};

const disableCopyAndDraft = computed(() => {
    const allInputsFilled = Object.values(inputValues.value).every(
        (val) => val.trim() !== ""
    );

    return !allInputsFilled;
});

const handleConfirmDiscardEmail = () => {
    console.log("back to template selection");
    isModalOpen.value = false;
    emit("navigate-to-generate-tab");
};
</script>

<style scoped></style>
