// TODO: clean up
// public/background.js

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === "open-or-focus-create-template") {
        handleWindow(
            "create-template.html",
            "createTemplateWindowId",
            msg.payload,
            sendResponse
        );
        return true;
    }

    if (msg?.type === "open-or-focus-generate-email") {
        handleWindow(
            "generate-email.html",
            "generateEmailWindowId",
            msg.payload,
            sendResponse
        );
        return true;
    }
});

function handleWindow(file, windowIdKey, payload, sendResponse) {
    chrome.storage.session.get(windowIdKey, (data) => {
        const savedId = data[windowIdKey];

        if (typeof savedId === "number") {
            chrome.windows.get(savedId, (win) => {
                if (chrome.runtime.lastError || !win) {
                    createNewWindow(file, windowIdKey, payload, sendResponse);
                } else {
                    chrome.windows.update(savedId, { focused: true });
                    sendResponse({ status: "focused" });
                }
            });
        } else {
            createNewWindow(file, windowIdKey, payload, sendResponse);
        }
    });
}

function createNewWindow(file, windowIdKey, payload = null, sendResponse) {
    chrome.system.display.getInfo((displays) => {
        const primaryDisplay = displays.find((d) => d.isPrimary);
        const availWidth = primaryDisplay.workArea.width;
        const availHeight = primaryDisplay.workArea.height;

        const width = 1000;
        const height = 800;
        const left = Math.round(availWidth / 2 - width / 2);
        const top = Math.round(availHeight / 2 - height / 2);

        chrome.windows.create(
            {
                url: chrome.runtime.getURL(file),
                type: "popup",
                width,
                height,
                left,
                top,
            },
            (win) => {
                if (win?.id !== undefined) {
                    chrome.storage.session.set({ [windowIdKey]: win.id });

                    chrome.windows.onRemoved.addListener(function handleClose(
                        closedId
                    ) {
                        if (closedId === win.id) {
                            chrome.storage.session.remove(windowIdKey);
                            chrome.windows.onRemoved.removeListener(
                                handleClose
                            );
                        }
                    });

                    if (payload) {
                        chrome.storage.session.set({
                            [file.includes("generate-email")
                                ? "templatesToFill"
                                : "templateToEdit"]: payload,
                        });
                    }
                }
                sendResponse({ status: "created" });
            }
        );
    });
}
