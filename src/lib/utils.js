// src/lib/utils.js

export function extractCustomInputLabels(html) {
    const matches = [
        ...html.matchAll(
            /<custom-input\s+label=["'](.*?)["']><\/custom-input>/gi
        ),
    ];
    return matches
        .map((match) => match[1].trim())
        .filter((label) => label.length > 0);
}

export function removeEmptyCustomInputs(html) {
    return html.replace(
        /<custom-input\s+label=["']{0,1}\s*["']{0,1}><\/custom-input>/gi,
        ""
    );
}

export function loadTemplatesAndSections() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["templates", "sections"], (result) => {
            const templates = Array.isArray(result.templates)
                ? result.templates
                : [];

            let sections;

            if (Array.isArray(result.sections)) {
                sections = result.sections;
            } else {
                const sectionNames = new Set(
                    templates.map(
                        (t) => t.section?.trim() || "Uncategorized Templates"
                    )
                );
                sections = [...sectionNames];
                chrome.storage.local.set({ sections });
            }

            resolve({ templates, sections });
        });
    });
}

export function initializeDefaultInputOptions(staticDefaults) {
    return new Promise((resolve) => {
        chrome.storage.local.get(["defaultInputOptions"], (result) => {
            const existing = Array.isArray(result.defaultInputOptions)
                ? result.defaultInputOptions
                : [];
            // combine defaults and inputs from imports
            const merged = Array.from(
                new Set([...staticDefaults, ...existing])
            );
            chrome.storage.local.set({ defaultInputOptions: merged }, resolve);
        });
    });
}

export function updateDefaultInputsFromUploadedTemplates(templates = []) {
    const allBodies = templates.map((t) => t.body || "").join("\n");
    const extractedLabels = extractCustomInputLabels(allBodies);

    chrome.storage.local.get(["defaultInputOptions"], (result) => {
        const existing = Array.isArray(result.defaultInputOptions)
            ? result.defaultInputOptions
            : [];

        const toAdd = [...new Set(extractedLabels)].filter(
            (label) => !existing.includes(label)
        );

        if (toAdd.length) {
            chrome.storage.local.set({
                defaultInputOptions: [...existing, ...toAdd],
            });
        }
    });
}
