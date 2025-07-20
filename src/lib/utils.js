// src/lib/utils.js

export const extractFieldNamesFromTemplates = (templates = []) => {
    const fields = new Set();

    templates.forEach((template) => {
        try {
            const doc = JSON.parse(template.body);
            traverseNode(doc, (node) => {
                if (node.type === "customInput" && node.attrs?.label) {
                    fields.add(node.attrs.label.trim());
                }
            });
        } catch (e) {
            console.warn("Invalid JSON in template:", e);
        }
    });

    return [...fields];
};

const traverseNode = (node, callback) => {
    if (!node) return;
    callback(node);
    if (Array.isArray(node.content)) {
        node.content.forEach((child) => traverseNode(child, callback));
    }
};
