/*==================================================
File Name   : inputBox.js
Module      : Layout
Version     : 1.0
Project     : Edu Work
Purpose     : Controls the GPT-style input composer.
Responsibilities:
- Cache composer DOM references.
- Manage placeholder, auto-grow, and send state.
- Handle file selection, preview chips, and removal.
- Expose send and expand callback hooks.
Imports:
- None
Constants:
- MIN_EDITOR_HEIGHT, MAX_EDITOR_HEIGHT, SUPPORTED_EXTENSIONS
DOM Elements:
- Cached inside ELEMENTS
Functions:
- initializeInputBox, cacheDOM, registerEvents, handleInput
- updatePlaceholder, updateSendButton, autoGrow, openFilePicker
- handleFiles, renderPreview, removeFile, clearInput, focusInput
- destroy
Exports:
- initializeInputBox, clearInput, focusInput, getInputText, destroy
==================================================*/

/*==================================================
SECTION 01
CONSTANTS
==================================================*/

const MIN_EDITOR_HEIGHT = 24;
const MAX_EDITOR_HEIGHT = 160;
const SUPPORTED_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "pdf", "doc", "docx", "txt", "zip", "rar"];
const ELEMENTS = {};
const STATE = { files: [], counter: 0, initialized: false };

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
    document.execCommand("insertText", false, text);
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

function updatePlaceholder() {
    ELEMENTS.editorArea.classList.toggle("is-empty", getInputText().length === 0);
}

function updateSendButton() {
    const hasText = getInputText().length > 0;
    ELEMENTS.sendButton.disabled = !(hasText || STATE.files.length);
}

function autoGrow() {
    ELEMENTS.inputEditor.style.height = "0px";
    const nextHeight = Math.min(Math.max(ELEMENTS.inputEditor.scrollHeight, MIN_EDITOR_HEIGHT), MAX_EDITOR_HEIGHT);
    ELEMENTS.inputEditor.style.height = `${nextHeight}px`;
    ELEMENTS.inputEditor.style.overflowY = ELEMENTS.inputEditor.scrollHeight > MAX_EDITOR_HEIGHT ? "auto" : "hidden";
}

function syncComposer() {
    updatePlaceholder();
    updateSendButton();
    autoGrow();
    renderPreview();
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
    const files = Array.from(event.target.files || []).filter(isSupportedFile);

    files.forEach((file) => {
        if (isDuplicateFile(file)) {
            return;
        }

        STATE.files.push({
            id: `file-${STATE.counter += 1}`,
            file,
            previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : ""
        });
    });

    syncComposer();
    ELEMENTS.filePicker.value = "";
}

function renderPreview() {
    ELEMENTS.attachmentPreview.innerHTML = "";
    ELEMENTS.attachmentPreview.classList.toggle("has-files", STATE.files.length > 0);

    STATE.files.forEach((entry) => {
        const chip = document.createElement("article");
        chip.className = "file-chip";
        chip.innerHTML = `${createPreviewMedia(entry)}<div class="file-chip-body"><span class="file-chip-name">${escapeHTML(entry.file.name)}</span><span class="file-chip-size">${formatFileSize(entry.file.size)}</span></div><button class="file-chip-remove" type="button" aria-label="Remove file" data-remove-file="${entry.id}">&times;</button>`;
        ELEMENTS.attachmentPreview.appendChild(chip);
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

function handleExpand() {
    emitComposerEvent("expand", getComposerPayload());
}

/*==================================================
SECTION 07
HELPERS
==================================================*/

function getInputText() {
    return (ELEMENTS.inputEditor?.textContent || "").replace(/\u00A0/g, " ").trim();
}

function normalizeEditor() {
    if (!getInputText()) {
        ELEMENTS.inputEditor.innerHTML = "";
    }
}

function focusInput() {
    if (!ELEMENTS.inputEditor) {
        return;
    }

    ELEMENTS.inputEditor.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(ELEMENTS.inputEditor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}

function isSupportedFile(file) {
    const extension = file.name.toLowerCase().split(".").pop();
    return SUPPORTED_EXTENSIONS.includes(extension);
}

function isDuplicateFile(file) {
    return STATE.files.some((entry) => entry.file.name === file.name && entry.file.size === file.size && entry.file.lastModified === file.lastModified);
}

function createPreviewMedia(entry) {
    if (entry.file.type.startsWith("image/")) {
        return `<img class="file-chip-thumb" src="${entry.previewUrl}" alt="">`;
    }

    return `<span class="file-chip-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8"></path><path d="M14 3v5h5" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8"></path></svg></span>`;
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

function escapeHTML(value) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return value.replace(/[&<>"']/g, (character) => map[character]);
}

function getComposerPayload() {
    return { text: getInputText(), files: STATE.files.map((entry) => entry.file) };
}

function emitComposerEvent(type, detail) {
    document.dispatchEvent(new CustomEvent(`eduwork:composer:${type}`, { detail }));
}

function releasePreview(entry) {
    if (entry.previewUrl) {
        URL.revokeObjectURL(entry.previewUrl);
    }
}

/*==================================================
SECTION 08
PUBLIC API
==================================================*/

export function clearInput() {
    ELEMENTS.inputEditor.innerHTML = "";
    STATE.files.forEach(releasePreview);
    STATE.files = [];
    syncComposer();
}

export { focusInput, getInputText };

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
