<!-- src/components/Editor.vue -->

<template>
    <div
        class="editor-wrapper flex flex-col h-full bg-white rounded-md drop-shadow-sm"
    >
        <editor-content :editor="editor" class="flex-1 overflow-auto" />
        <div class="tiptap-menu h-fit flex gap-1">
            <Button
                @click="editor?.chain().focus().toggleBold().run()"
                :class="{ active: editor?.isActive('bold') }"
                variant="editormenuitem"
            >
                B
            </Button>
            <Button
                @click="editor?.chain().focus().toggleItalic().run()"
                :class="{ active: editor?.isActive('italic') }"
                variant="editormenuitem"
            >
                I
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
                        .insertContent({ type: 'vueComponent' }) // ← match your node name
                        .run()
                "
                variant="editormenuitem"
            >
                Vue Component
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
import ListItem from "@tiptap/extension-list-item";
import { watch, onBeforeUnmount } from "vue";
import Button from "../components/Button.vue";
import VueComponent from "../lib/Extension";
import { createApp } from "vue";

const tiptapNodeViewApp = createApp({});

export default {
    components: {
        EditorContent,
        // BulletList,
        // ListItem,
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
                VueComponent,
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
