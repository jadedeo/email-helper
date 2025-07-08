// src/lib/Extension.js

import { mergeAttributes, Node } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";

import Component from "../components/Component.vue";

export default Node.create({
    name: "customInput",

    group: "inline",
    inline: true,
    atom: true,

    content: "inline*",

    addAttributes() {
        return {
            label: {
                default: "",
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "custom-input",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ["custom-input", mergeAttributes(HTMLAttributes), 0];
    },

    addNodeView() {
        return VueNodeViewRenderer(Component);
    },
});
