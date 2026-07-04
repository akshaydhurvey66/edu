/*==================================================
File Name   : inputBox.js
Module      : Layout
Version     : 2.0
Project     : Edu Work
Purpose     : Controls the GPT-style input composer.
==================================================*/

/*==================================================
SECTION 01
CONSTANTS
==================================================*/

const MIN_EDITOR_HEIGHT = 24;
const MAX_EDITOR_HEIGHT = 160;
const SUPPORTED_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "pdf", "doc", "docx", "txt", "zip", "rar"];

const ELEMENTS = {};

const STATE = {
    files: [],
    counter: 0,
    initialized: false
};

/*==================================================
SECTION 02
INITIALIZE
==================================================*/

export function initializeInputBox() {
    if (STATE.initialized) {
        destroy(false);
    }

    cacheDOM();

    if (!ELEMENTS.inputEditor || !ELEMENTS.sendButton || !ELEMENTS.filePicker) {
        return;
    }

    registerEvents();
    syncComposer();
    STATE.initialized = true;
}

function cacheDOM() {
    ELEMENTS.inputContainer = document.getElementById("inputContainer");
    ELEMENTS.editorArea = document.getElementById("editorArea");
    ELEMENTS.inputEditor = document.getElementById("inputEditor");
    ELEMENTS.inputPlaceholder = document.getElementById("inputPlaceholder");
    ELEMENTS.addButton = document.getElementById("addButton");
    ELEMENTS.expandButton = document.getElementById("expandButton");
    ELEMENTS.sendButton = document.getElementById("sendButton");
    ELEMENTS.attachmentPreview = document.getElementById("attachmentPreview");
    ELEMENTS.filePicker = document.getElementById("filePicker");
}

/*==================================================
SECTION 03
EVENTS
==================================================*/

function registerEvents() {
    ELEMENTS.inputEditor.addEventListener("input", handleInput);
    ELEMENTS.inputEditor.addEventListener("paste", handlePaste);
    ELEMENTS.inputContainer.addEventListener("click", handleComposerClick);
    ELEMENTS.addButton.addEventListener("click", openFilePicker);
    ELEMENTS.expandButton.addEventListener("click", handleExpand);
    ELEMENTS.sendButton.addEventListener("click", handleSend);
    ELEMENTS.filePicker.addEventListener("change", handleFiles);
    ELEMENTS.attachmentPreview.addEventListener("click", handlePreviewClick);
}

function handleInput() {
    normalizeEditor();
    syncComposer();
}

function handlePaste(event) {
    event.preventDefault();

    const text = event.clipboardData?.getData("text/plain") || "";

    insertPlainText(text);
    syncComposer();
}

function handleComposerClick(event) {
    if (event.target.closest("button")) {
        return;
    }

    focusInput();
}

function handlePreviewClick(event) {
    const removeButton = event.target.closest("[data-remove-file]");

    if (!removeButton) {
        return;
    }

    removeFile(removeButton.getAttribute("data-remove-file"));
}

/*==================================================
SECTION 04
COMPOSER STATE
==================================================*/

function syncComposer() {
    updatePlaceholder();
    updateSendButton();
    autoGrow();
    renderPreview();
}

function updatePlaceholder() {
    const isEmpty = getInputText().length === 0;

    ELEMENTS.editorArea.classList.toggle("is-empty", isEmpty);
    ELEMENTS.inputPlaceholder.hidden = !isEmpty;
}

function updateSendButton() {
    const hasText = getInputText().length > 0;
    const hasFiles = STATE.files.length > 0;

    ELEMENTS.sendButton.disabled = !(hasText || hasFiles);
}

function autoGrow() {
    const editor = ELEMENTS.inputEditor;

    editor.style.height = `${MIN_EDITOR_HEIGHT}px`;

    const nextHeight = Math.min(Math.max(editor.scrollHeight, MIN_EDITOR_HEIGHT), MAX_EDITOR_HEIGHT);

    editor.style.height = `${nextHeight}px`;
    editor.style.overflowY = editor.scrollHeight > MAX_EDITOR_HEIGHT ? "auto" : "hidden";
}

/*==================================================
SECTION 05
FILES
==================================================*/

function openFilePicker() {
    ELEMENTS.filePicker.value = "";
    ELEMENTS.filePicker.click();
}

function handleFiles(event) {
    const files = Array.from(event.target.files || []);

    files.filter(isSupportedFile).forEach((file) => {
        if (isDuplicateFile(file)) {
            return;
        }

        STATE.files.push(createFileEntry(file));
    });

    ELEMENTS.filePicker.value = "";
    syncComposer();
}

function renderPreview() {
    ELEMENTS.attachmentPreview.replaceChildren();
    ELEMENTS.attachmentPreview.classList.toggle("has-files", STATE.files.length > 0);

    STATE.files.forEach((entry) => {
        ELEMENTS.attachmentPreview.appendChild(createPreviewChip(entry));
    });
}

function removeFile(fileId) {
    const nextFiles = [];

    STATE.files.forEach((entry) => {
        if (entry.id === fileId) {
            releasePreview(entry);
            return;
        }

        nextFiles.push(entry);
    });

    STATE.files = nextFiles;
    syncComposer();
}

/*==================================================
SECTION 06
ACTIONS
==================================================*/

function handleSend() {
    if (ELEMENTS.sendButton.disabled) {
        return;
    }

    emitComposerEvent("send", getComposerPayload());
}

function clearInput() {
    ELEMENTS.inputEditor.innerHTML = "";
    STATE.files.forEach(releasePreview);
    STATE.files = [];
    syncComposer();
}

function focusInput(placeAtStart = false) {
    if (!ELEMENTS.inputEditor) {
        return;
    }

    ELEMENTS.inputEditor.focus();
    placeCaret(placeAtStart || !getInputText() ? "start" : "end");
}

function handleExpand() {
    emitComposerEvent("expand", getComposerPayload());
}

/*==================================================
SECTION 07
HELPERS
==================================================*/

function getInputText() {
    return (ELEMENTS.inputEditor?.innerText || "")
        .replace(/\u00A0/g, " ")
        .replace(/\r/g, "")
        .trim();
}

function normalizeEditor() {
    if (getInputText()) {
        return;
    }

    ELEMENTS.inputEditor.innerHTML = "";
}

function insertPlainText(text) {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
        ELEMENTS.inputEditor.textContent += text;
        return;
    }

    const range = selection.getRangeAt(0);

    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);

    selection.removeAllRanges();
    selection.addRange(range);
}

function placeCaret(position) {
    const selection = window.getSelection();
    const range = document.createRange();

    range.selectNodeContents(ELEMENTS.inputEditor);
    range.collapse(position === "start");

    selection.removeAllRanges();
    selection.addRange(range);
}

function createFileEntry(file) {
    return {
        id: `file-${STATE.counter += 1}`,
        file,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : ""
    };
}

function isSupportedFile(file) {
    const extension = file.name.toLowerCase().split(".").pop();
    return file.type.startsWith("image/") || SUPPORTED_EXTENSIONS.includes(extension);
}

function isDuplicateFile(file) {
    return STATE.files.some((entry) => {
        return entry.file.name === file.name
            && entry.file.size === file.size
            && entry.file.lastModified === file.lastModified;
    });
}

function createPreviewChip(entry) {
    const chip = document.createElement("article");
    const body = document.createElement("div");
    const name = document.createElement("span");
    const size = document.createElement("span");
    const removeButton = document.createElement("button");

    chip.className = "file-chip";
    chip.appendChild(createPreviewMedia(entry));

    body.className = "file-chip-body";

    name.className = "file-chip-name";
    name.textContent = entry.file.name;

    size.className = "file-chip-size";
    size.textContent = formatFileSize(entry.file.size);

    body.append(name, size);

    removeButton.className = "file-chip-remove";
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `Remove ${entry.file.name}`);
    removeButton.setAttribute("data-remove-file", entry.id);
    removeButton.textContent = "×";

    chip.append(body, removeButton);

    return chip;
}

function createPreviewMedia(entry) {
    if (entry.file.type.startsWith("image/")) {
        const image = document.createElement("img");

        image.className = "file-chip-thumb";
        image.src = entry.previewUrl;
        image.alt = "";

        return image;
    }

    const icon = document.createElement("span");

    icon.className = "file-chip-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = [
        "<svg viewBox=\"0 0 24 24\">",
        "<path d=\"M7 3h7l5 5v13H7z\" fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path>",
        "<path d=\"M14 3v5h5\" fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path>",
        "</svg>"
    ].join("");

    return icon;
}

function formatFileSize(size) {
    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1048576) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / 1048576).toFixed(1)} MB`;
}

function getComposerPayload() {
    return {
        text: getInputText(),
        files: STATE.files.map((entry) => entry.file)
    };
}

function emitComposerEvent(type, detail) {
    document.dispatchEvent(
        new CustomEvent(`eduwork:composer:${type}`, { detail })
    );
}

function releasePreview(entry) {
    if (!entry.previewUrl) {
        return;
    }

    URL.revokeObjectURL(entry.previewUrl);
}

/*==================================================
SECTION 08
PUBLIC API
==================================================*/

export { clearInput, focusInput, getInputText };

export function destroy(resetFiles = true) {
    if (!STATE.initialized || !ELEMENTS.inputEditor) {
        return;
    }

    ELEMENTS.inputEditor.removeEventListener("input", handleInput);
    ELEMENTS.inputEditor.removeEventListener("paste", handlePaste);
    ELEMENTS.inputContainer.removeEventListener("click", handleComposerClick);
    ELEMENTS.addButton.removeEventListener("click", openFilePicker);
    ELEMENTS.expandButton.removeEventListener("click", handleExpand);
    ELEMENTS.sendButton.removeEventListener("click", handleSend);
    ELEMENTS.filePicker.removeEventListener("change", handleFiles);
    ELEMENTS.attachmentPreview.removeEventListener("click", handlePreviewClick);

    if (resetFiles) {
        STATE.files.forEach(releasePreview);
        STATE.files = [];
    }

    STATE.initialized = false;
}
