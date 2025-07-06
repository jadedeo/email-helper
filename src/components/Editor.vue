<!-- src/components/Editor.vue -->

<template>
    <editor-content :editor="editor" />
</template>

<script>
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { watch, onBeforeUnmount } from "vue";

export default {
    components: {
        EditorContent,
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
            extensions: [StarterKit],
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
