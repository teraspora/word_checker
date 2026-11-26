const status = document.querySelector('#dictionary-status');
const fileChoice = document.querySelector('#file-choice');
const fileInput = document.querySelector('#dictionary-file');
const form = document.querySelector('#check-form');
const wordInput = document.querySelector('#word');
const checkButton = document.querySelector('#check-button');
const result = document.querySelector('#result');
const neighbours = document.querySelector('#neighbours');
const wordList = document.querySelector('#word-list');

let words = [];

function loadDictionary(text) {
    const entries = text.split(/\r?\n/).map((word) => word.trim()).filter(Boolean);
    if (entries.length === 0 || entries.some((word, index) =>
        !/^[A-Z]+$/.test(word) || (index > 0 && entries[index - 1] >= word)
    )) {
        throw new Error('The dictionary must contain sorted, unique uppercase words, one per line.');
    }

    words = entries;
    status.textContent = `Dictionary loaded (${words.length.toLocaleString()} words).`;
    fileChoice.hidden = true;
    checkButton.disabled = false;
}

async function loadDefaultDictionary() {
    if (location.protocol === 'file:') {
        status.textContent = 'Choose sowpods.txt to load the dictionary when opening this page directly.';
        fileChoice.hidden = false;
        return;
    }

    try {
        const response = await fetch('sowpods.txt');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        loadDictionary(await response.text());
    } catch (error) {
        status.textContent = `Could not load sowpods.txt: ${error.message} Choose the file below.`;
        fileChoice.hidden = false;
    }
}

fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    try {
        loadDictionary(await file.text());
    } catch (error) {
        status.textContent = `Could not load dictionary: ${error.message}`;
    }
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const word = wordInput.value.trim().toUpperCase();
    if (!/^[A-Z]+$/.test(word)) {
        result.textContent = 'Enter a word using letters A–Z only.';
        result.className = 'result invalid';
        neighbours.hidden = true;
        return;
    }

    let low = 0;
    let high = words.length;
    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (words[middle] < word) low = middle + 1;
        else high = middle;
    }

    const valid = words[low] === word;
    result.textContent = valid ? 'VALID' : 'INVALID';
    result.className = `result ${valid ? 'valid' : 'invalid'}`;
    wordList.replaceChildren();

    const appendWord = (text, className = '') => {
        const item = document.createElement('li');
        item.textContent = text;
        if (className) item.className = className;
        wordList.append(item);
    };

    words.slice(Math.max(0, low - 10), low).forEach((entry) => appendWord(entry));
    if (valid) {
        appendWord(word, 'match');
    } else {
        appendWord('', 'insertion');
        wordList.lastElementChild.setAttribute('aria-label', `${word} would appear here`);
    }
    words.slice(low + (valid ? 1 : 0), low + (valid ? 11 : 10))
        .forEach((entry) => appendWord(entry));
    neighbours.hidden = false;
});

loadDefaultDictionary();