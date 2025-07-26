<!-- components/Editor.vue -->

<template>
    <div
        class="editor-wrapper flex flex-col h-full bg-white rounded-md border-solid border-1 border-gray-200 overflow-auto"
    >
        <editor-content :editor="editor" class="flex-1 overflow-auto" />
        <div
            class="tiptap-menu h-fit flex gap-1 items-center p-1 border-t-1 border-solid border-gray-200"
        >
            <!-- TODO: add list formatting, linking & font colors -->
            <!-- https://tiptap.dev/docs/ui-components/components/link-popover -->
            <Button
                @click="editor?.chain().focus().toggleBold().run()"
                :class="{ active: editor?.isActive('bold') }"
                variant="editormenuitem"
            >
                <BoldFormatIcon fillColor="#000000" :size="18" />
            </Button>
            <Button
                @click="editor?.chain().focus().toggleItalic().run()"
                :class="{ active: editor?.isActive('italic') }"
                variant="editormenuitem"
            >
                <ItalicFormatIcon fillColor="#000000" :size="18" />
            </Button>

            <Button
                @click="editor?.chain().focus().toggleUnderline().run()"
                :class="{ active: editor?.isActive('underline') }"
                variant="editormenuitem"
            >
                <UnderlineFormatIcon fillColor="#000000" :size="18" />
            </Button>

            <!-- REPLACE WITH LINK ACTION -->
            <Button
                @click="editor?.chain().focus().toggleUnderline().run()"
                :class="{ active: editor?.isActive('underline') }"
                variant="editormenuitem"
                disabled="true"
            >
                <LinkVariantIcon fillColor="#000000" :size="18" />
            </Button>

            <Button
                @click="
                    editor?.chain().focus().toggleHeading({ level: 1 }).run()
                "
                :class="{ active: editor?.isActive('heading', { level: 1 }) }"
                variant="editormenuitem"
            >
                H1
            </Button>
            <Button
                @click="
                    editor?.chain().focus().toggleHeading({ level: 2 }).run()
                "
                :class="{ active: editor?.isActive('heading', { level: 2 }) }"
                variant="editormenuitem"
            >
                H2
            </Button>
            <Button
                @click="
                    editor?.chain().focus().toggleHeading({ level: 3 }).run()
                "
                :class="{ active: editor?.isActive('heading', { level: 3 }) }"
                variant="editormenuitem"
            >
                H3
            </Button>

            <Button
                @click="
                    editor
                        .chain()
                        .focus()
                        .insertContent({ type: 'customInput' }) // ← match your node name
                        .run()
                "
                variant="editormenuitem"
                class="!border-solid border-1 border-lime-500 !py-1 !h-fit"
                ><TextIcon fillColor="#000000" :size="16" />
                Custom Input Field
            </Button>

            <!-- <Button
                @click="editor?.chain().focus().toggleBulletList().run()"
                :class="{ active: editor?.isActive('bulletList') }"
                variant="editormenuitem"
            >
                • List
            </Button> -->

            <!-- <Button
                @click="editor?.chain().focus().splitListItem('listItem').run()"
                :disabled="!editor?.can().splitListItem('listItem')"
                variant="editormenuitem"
            >
                ↩︎ Split
            </Button> -->

            <!-- <Button
                @click="editor?.chain().focus().sinkListItem('listItem').run()"
                :disabled="!editor?.can().sinkListItem('listItem')"
                variant="editormenuitem"
            >
                → Indent
            </Button> -->
            <!-- 
            <Button
                @click="editor?.chain().focus().liftListItem('listItem').run()"
                :disabled="!editor?.can().liftListItem('listItem')"
                variant="editormenuitem"
            >
                ← Outdent
            </Button> -->
        </div>
    </div>
</template>

<script>
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import BulletList from "@tiptap/extension-bullet-list";
import Underline from "@tiptap/extension-underline";
import ListItem from "@tiptap/extension-list-item";
import { watch, onBeforeUnmount } from "vue";
import Button from "../components/Button.vue";
import CustomInput from "../lib/CustomInputExtension";
import { createApp } from "vue";

import BoldFormatIcon from "vue-material-design-icons/FormatBold.vue";
import ItalicFormatIcon from "vue-material-design-icons/FormatItalic.vue";
import UnderlineFormatIcon from "vue-material-design-icons/FormatUnderline.vue";
import TextIcon from "vue-material-design-icons/Text.vue";
import LinkVariantIcon from "vue-material-design-icons/LinkVariant.vue";

export default {
    components: {
        EditorContent,
        // BulletList,
        // ListItem,
        BoldFormatIcon,
        ItalicFormatIcon,
        UnderlineFormatIcon,
        TextIcon,
        LinkVariantIcon,
        Button,
    },
    emits: ["update:modelValue"],
    props: {
        modelValue: {
            type: String,
            required: true,
        },
    },
    setup(props, { emit }) {
        const editor = useEditor({
            content: props.modelValue,
            extensions: [
                StarterKit.configure({
                    bulletList: false,
                    listItem: false,
                }),
                Underline,
                BulletList.configure({
                    itemTypeName: "listItem",
                    keepMarks: true,
                    HTMLAttributes: {
                        class: "bullet-list-class list-inside list-disc ",
                    },
                }),
                ListItem.configure({
                    HTMLAttributes: {
                        class: "list-item-class",
                    },
                }),
                ,
                Placeholder.configure({
                    placeholder:
                        "Start typing or paste a pre-written template.",
                }),
                CustomInput,
            ],
            editorProps: {
                attributes: {
                    class: "w-full h-full p-4 focus:outline-none ",
                },
            },
            onUpdate({ editor }) {
                emit("update:modelValue", editor.getHTML());
            },
        });

        watch(
            () => props.modelValue,
            (newValue) => {
                if (editor.value && newValue !== editor.value.getHTML()) {
                    editor.value.commands.setContent(newValue, false);
                }
            }
        );

        onBeforeUnmount(() => {
            if (editor.value) editor.value.destroy();
        });

        return { editor };
    },
};
</script>

<style scoped>
.editor-content {
    width: 100%;

    padding: 1rem;
    cursor: text;
    outline: none;
}

.editor-content:focus {
    outline: none;
}

.ProseMirror [data-placeholder]::before {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
}
</style>
