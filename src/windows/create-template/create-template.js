// src/windows/create-template/create-template.js

import { createApp } from "vue";
import CreateTemplate from "./CreateTemplate.vue";
// import CustomInputNode from "../../lib/CustomInputNode";

// This is critical:
const app = createApp(CreateTemplate);

// Pass the app instance to your extension:
// CustomInputNode.configure({ app });

// Now mount
app.mount("#app");

// import { createApp } from "vue";
// import CreateTemplate from "./CreateTemplate.vue";
// import CustomInputComponent from "../../components/CustomInputComponent.vue";

// console.log("Registered component:", CustomInputComponent);

// const app = createApp(CreateTemplate);

// app.mount("#app");

// console.log("CreateTemplate entry loaded");
