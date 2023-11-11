const createNoteBtn = document.getElementById('create-note-btn');
const overlay = document.getElementById('overlay');
const closeModalBtn = document.getElementById('close-btn');
const saveNoteBtn = document.getElementById('save-note-btn');
const notesContainer = document.getElementById('notes-container');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const settings = document.getElementById('settingspage');

let editingNote = null;

window.addEventListener('load', () => {
    const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    savedNotes.forEach(({ title, content, bgColor }) => {
        const note = createNoteElement(title, content, bgColor);
        notesContainer.appendChild(note);
    });
});

notesContainer.addEventListener('click', (event) => {
    const editButton = event.target.closest('.edit-btn');
    const deleteButton = event.target.closest('.delete-button');
    if (editButton) {
        const note = editButton.parentElement;
        editingNote = note;
        const title = note.querySelector('.note-title').textContent;
        const content = reverseMarkdownConverter(note.querySelector('.note-content').innerHTML);
        noteTitleInput.value = title;
        noteContentInput.value = content;
        overlay.style.display = 'flex';
    }
    if (deleteButton) {
        const note = deleteButton.parentElement;
        note.outerHTML = "";
        saveNotesToLocalStorage();
    }
});

saveNoteBtn.addEventListener('click', () => {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    if(!content) {
        alert('Please enter a note content.');
        return;
    }
    if(!title) {
        alert('Please enter a note title.');
        return;
    }
    if (title && content) {
        if (editingNote) {
            editingNote.querySelector('.note-title').textContent = title;
            editingNote.querySelector('.note-content').innerHTML = markdownConverter(noteContentInput.value);
            editingNote = null;
            overlay.style.display = 'none';
        } else {
            const note = createNoteElement(title, content);
            notesContainer.appendChild(note);
            noteTitleInput.value = '';
            noteContentInput.value = '';
            overlay.style.display = 'none';
        }
        saveNotesToLocalStorage();
    }
});

createNoteBtn.addEventListener('click', () => {
    overlay.style.display = 'flex';
    noteTitleInput.value = '';
    noteContentInput.value = '';
    editingNote = null;
});

closeModalBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
});

searchBtn.addEventListener('click', () => {
    const searchText = searchInput.value.trim().toLowerCase();
    const notes = document.querySelectorAll('.note');

    notes.forEach((note) => {
        const title = note.querySelector('.note-title').textContent.toLowerCase();
        const content = note.querySelector('.note-content').textContent.toLowerCase();

        if (title.includes(searchText) || content.includes(searchText)) {
            note.style.display = 'block';
        } else {
            note.style.display = 'none';
        }
    });
});

function createNoteElement(title, content, bgColor) {
    const note = document.createElement('div');
    note.id = title;
    note.classList.add('note', 'fade-in'); 

    if (bgColor) {
        note.style.backgroundColor = bgColor;
    }

    const titleElement = document.createElement('h2');
    titleElement.classList.add('note-title');
    titleElement.textContent = title;

    const contentElement = document.createElement('p');
    contentElement.classList.add('note-content');
    contentElement.innerHTML = markdownConverter(content);

    const editButton = document.createElement('button');
    editButton.classList.add('edit-btn');
    editButton.textContent = 'Edit';

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button', 'fa-solid', 'fa-trash-can');

    note.appendChild(titleElement);
    note.appendChild(contentElement);
    note.appendChild(editButton);
    note.appendChild(deleteButton);
    
    return note;
}

function saveNotesToLocalStorage() {
    const notes = Array.from(document.querySelectorAll('.note')).map((note) => {
        const title = note.querySelector('.note-title').textContent;
        const content = note.querySelector('.note-content').innerHTML;
        const bgColor = note.style.backgroundColor;
        return { title, content, bgColor };
    });
    localStorage.setItem('notes', JSON.stringify(notes));
}

function downloadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function uploadNotes(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const contents = e.target.result;
        const notes = JSON.parse(contents);
        localStorage.setItem('notes', JSON.stringify(notes));
        location.reload();
    };
    reader.readAsText(file);
}

const uploadBtn = document.createElement('button');
uploadBtn.textContent = '';
uploadBtn.classList.add('upload-btn', 'fa-solid', 'fa-upload');
uploadBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', uploadNotes);
    input.click();
});

const downloadBtn = document.createElement('button');
downloadBtn.textContent = '';
downloadBtn.classList.add('download-btn', 'fa-solid', 'fa-download', 'fa-shake');
downloadBtn.addEventListener('click', downloadNotes);

document.body.prepend(uploadBtn);
document.body.prepend(downloadBtn);

function markdownConverter(text) {
    const renderer = new marked.Renderer();
    
    marked.setOptions({
        renderer: renderer,
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: false,
        smartypants: false,
    });

    
    return marked.parse(text);
};


function reverseMarkdownConverter(text) {
    const reversedText = text.replace(/<em>/g, "*").replace(/<\/em>/g, "*");
    const reversedTexth2 = reversedText.replace(/<h2>/g, "## ").replace(/<\/h2>/g, "");
    const reversedTexth1 = reversedTexth2.replace(/<h1>/g, "# ").replace(/<\/h1>/g, "");
    const reversedTextp = reversedTexth1.replace(/<p>/g, "").replace(/<\/p>/g, "");
    const reversedTexth3 = reversedTextp.replace(/<h3>/g, "### ").replace(/<\/h3>/g, "");
    const reversedTexth4 = reversedTexth3.replace(/<h4>/g, "#### ").replace(/<\/h4>/g, "");
    const reversedTexth5 = reversedTexth4.replace(/<h5>/g, "##### ").replace(/<\/h5>/g, "");
    const reversedTexth6 = reversedTexth5.replace(/<h6>/g, "###### ").replace(/<\/h6>/g, "");
    const reversedTextbr = reversedTexth6.replace(/<br>/g, "\n");
    const reversedTextul = reversedTextbr.replace(/<ul>/g, "").replace(/<\/ul>/g, "");
    const reversedTextli = reversedTextul.replace(/<li>/g, "- ").replace(/<\/li>/g, "");
    const reversedTextstrong = reversedTextli.replace(/<strong>/g, "**").replace(/<\/strong>/g, "**");
    const reversedTextprecode = reversedTextstrong.replace(/<pre><code>/g, "```\n").replace(/<\/code><\/pre>/g, "\n```");
    const reversedTextcode = reversedTextprecode.replace(/<code>/g, "`").replace(/<\/code>/g, "`");
    return reversedTextcode;
}


function animateCloudIcon() {
    const cloudIcon = document.createElement('i');
    cloudIcon.classList.add('fa-solid', 'fa-cloud-arrow-up', 'cloud-icn');
    document.body.appendChild(cloudIcon);
  
    setInterval(() => {
        cloudIcon.classList.add('fa-fade');
        saveNotesToLocalStorage();
        setTimeout(() => {
            cloudIcon.classList.remove('fa-fade');
        }, 5000);
    }, 10000);
}

animateCloudIcon();