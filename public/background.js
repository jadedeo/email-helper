chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg === "open-or-focus-create-template") {
        chrome.storage.session.get("createTemplateWindowId", (data) => {
            const savedId = data.createTemplateWindowId;

            if (typeof savedId === "number") {
                chrome.windows.get(savedId, (win) => {
                    if (chrome.runtime.lastError || !win) {
                        createNewWindow(sendResponse); // window doesn't exist anymore
                    } else {
                        chrome.windows.update(savedId, { focused: true });
                        sendResponse({ status: "focused" });
                    }
                });
            } else {
                createNewWindow(sendResponse); // no saved ID
            }
        });

        return true; // keep sendResponse alive
    }
});

function createNewWindow(sendResponse) {
    chrome.system.display.getInfo((displays) => {
        const primaryDisplay = displays.find((d) => d.isPrimary);
        const availWidth = primaryDisplay.workArea.width;
        const availHeight = primaryDisplay.workArea.height;

        const width = 800;
        const height = 600;
        const left = Math.round(availWidth / 2 - width / 2);
        const top = Math.round(availHeight / 2 - height / 2);

        chrome.windows.create(
            {
                url: chrome.runtime.getURL("create-template.html"),
                type: "popup",
                width,
                height,
                left,
                top,
            },
            (win) => {
                if (win?.id !== undefined) {
                    chrome.storage.session.set({
                        createTemplateWindowId: win.id,
                    });

                    chrome.windows.onRemoved.addListener(function handleClose(
                        closedId
                    ) {
                        if (closedId === win.id) {
                            chrome.storage.session.remove(
                                "createTemplateWindowId"
                            );
                            chrome.windows.onRemoved.removeListener(
                                handleClose
                            );
                        }
                    });
                }
                sendResponse({ status: "created" });
            }
        );
    });
}
