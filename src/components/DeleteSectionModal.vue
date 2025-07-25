<!-- <template>
    <Modal
        :title="title"
        :body="body"
        :actions="[
            {
                label: 'Delete section',
                onClick: handleDeleteSection,
            },
            {
                label: 'Delete section and templates',
                onClick: handleDeleteAll,
            },
        ]"
        @close="closeModal"
    />
</template>

<script>
import Modal from "../components/Modal.vue";

export default {
    components: { Modal },
    props: {
        title: String,
        body: String,
    },
    emits: ["close"],
    setup(_, { emit }) {
        const closeModal = () => emit("close");

        const handleDeleteSection = () => {
            // logic
            console.log("Deleting section only");
            closeModal();
        };

        const handleDeleteAll = () => {
            // logic
            console.log("Deleting section + templates");
            closeModal();
        };

        return { closeModal, handleDeleteSection, handleDeleteAll };
    },
};
</script> -->
