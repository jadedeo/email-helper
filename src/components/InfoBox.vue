<template>
    <div class="bg-gray-50 p-3 flex flex-col gap-2">
        <h5 class="font-bold">
            <span></span>Salutations are automatically applied
        </h5>
        <p>
            Greetings and sign-off salutations are applied to all email
            reposnses, no matter which template is used.
        </p>
    </div>
</template>

<script>
export default {
    props: {
        heading: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: false,
        },
    },
    setup() {
        return {};
    },
};
</script>

<style scoped></style>
