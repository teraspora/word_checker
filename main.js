const status = document.querySelector('#dictionary-status');
const fileChoice = document.querySelector('#file-choice');
const fileInput = document.querySelector('#dictionary-file');
const form = document.querySelector('#check-form');
const wordInput = document.querySelector('#word');
const checkButton = document.querySelector('#check-button');
const result = document.querySelector('#result');
const details = document.querySelector('#details');
const neighbours = document.querySelector('#neighbours');
const wordList = document.querySelector('#word-list');
const definition = document.querySelector('#definition');
const definition_text = document.querySelector('#definition-text');
const definition_credit = document.querySelector('#definition-credit');
const definition_source = document.querySelector('#definition-source');

let words = [];
let definition_request = 0;

async function get_definition(word) {
    const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`
    );
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Dictionary API: HTTP ${response.status}`);

    const entries = await response.json();
    for (const entry of entries) {
        for (const meaning of entry.meanings ?? []) {
            for (const item of meaning.definitions ?? []) {
                if (typeof item.definition === 'string' && item.definition.trim()) {
                    return item.definition;
                }
            }
        }
    }
    return null;
}

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
    update_word();
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

function clear_definition() {
    definition_request++;
    definition.hidden = true;
    definition_credit.hidden = true;
    details.classList.remove('has-definition');
}

function update_word() {
    const word = wordInput.value.trim().toUpperCase();
    if (!word || words.length === 0) {
        result.textContent = '';
        result.className = 'result';
        neighbours.hidden = true;
        return null;
    }

    if (!/^[A-Z]+$/.test(word)) {
        result.textContent = 'Enter a word using letters A–Z only.';
        result.className = 'result invalid';
        neighbours.hidden = true;
        return null;
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
    return { word, valid };
}

wordInput.addEventListener('input', () => {
    clear_definition();
    update_word();
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    wordInput.focus();
    wordInput.select();
    clear_definition();
    const request = definition_request;
    const checked_word = update_word();

    if (checked_word && checked_word.valid) {
        definition.hidden = false;
        details.classList.add('has-definition');
        definition_text.textContent = 'Loading definition...';
        try {
            const text = await get_definition(checked_word.word);
            if (request !== definition_request) return;
            definition_text.textContent = text ?? 'No definition available.';
            if (text) {
                definition_source.href = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(checked_word.word.toLowerCase())}`;
                definition_credit.hidden = false;
            }
        } catch (error) {
            if (request !== definition_request) return;
            definition_text.textContent = `Could not load definition: ${error.message}`;
        }
    }
});

loadDefaultDictionary();