let _set_notesValues = [
    {
        "title":"Daily Affirmations",
        "description":"Write down three positive affirmations to start each day.",
        "date":"Aug 15, 2024",
        "category":"all"
    },
    {
        "title":"To-Do List",
        "description":"Create a list of tasks to accomplish today, categorized by priority.",
        "date":"Aug 20, 2024",
        "category":"social"
    },
    {
        "title":"Meal Planning",
        "description":"Plan meals for the week, noting down ingredients you need to buy",
        "date":"Sep 03, 2024",
        "category":"social"
    },
    {
        "title":"Goal Tracker",
        "description":"Track progress on your mind, soul, and body goals with small milestones.",
        "date":"Oct 20, 2024",
        "category":"social"
    },
    {
        "title":"Book/Podcast Recommendations",
        "description":"Create a list of books or podcasts to read or listen to, with brief descriptions.",
        "date":"Nov 10, 2024",
        "category":"business"
    },
    {
        "title":"Favorite Quotes",
        "description":"Collect inspirational or thought-provoking quotes from books, movies, or people.",
        "date":"Nov 11, 2024",
        "category":"important"
    },
    {
        "title":"Gratitude Journal",
        "description":"Jot down three things you are grateful for each day to boost mindfulness.",
        "date":"Dec 01, 2024",
        "category":"business"
    },
    {
        "title":"Workout Routine",
        "description":"Note different workout routines or exercises you did like to try this week.",
        "date":"Jan 05, 2024",
        "category":"all"
    },
    {
        "title":"Creative Ideas",
        "description":"Capture random thoughts, creative ideas, or sketches for future projects.",
        "date":"Feb 24, 2024",
        "category":"business"
    },
    {
        "title":"Budget Planner",
        "description":"Plan out your monthly budget, including savings, expenses, and goals.",
        "date":"Mar 01, 2024",
        "category":"important"
    },
    {
        "title":"Movies/TV Shows to Watch",
        "description":"Keep track of recommendations of your favourite show.",
        "date":"Mar 01, 2024",
        "category":"important"
    },
    {
        "title":"Fitness Progress",
        "description":"Note down workout routines and results.",
        "date":"Mar 01, 2024",
        "category":"all"
    },
    {
        "title":"Personal Reflection",
        "description":"Journal about your emotions or thoughts daily.",
        "date":"Mar 01, 2024",
        "category":"social"
    },
    {
        "title":"Bucket List",
        "description":"Write down life goals or experiences you want to have.",
        "date":"Mar 01, 2024",
        "category":"important"
    },
    {
        "title":"Learning Goals",
        "description":"Write down skills or subjects you want to learn.",
        "date":"Mar 01, 2024",
        "category":"important"
    },
    {
        "title":"Positive Memories",
        "description":"Record small happy moments from your week.",
        "date":"Mar 01, 2024",
        "category":"social"
    },
    {
        "title":"Work Projects",
        "description":"Track ongoing tasks or projects for work.",
        "date":"Mar 01, 2024",
        "category":"all"
    },
    {
        "title":"Healthy Snacks",
        "description":"Keep a list of go-to healthy snack ideas.",
        "date":"Mar 01, 2024",
        "category":"all"
    },
    {
        "title":"Self-Care Ideas",
        "description":"Write down activities to help relax and recharge.",
        "date":"Mar 01, 2024",
        "category":"business"
    },
    {
        "title":"Time Management",
        "description":"Write down techniques to improve time management.",
        "date":"Mar 01, 2024",
        "category":"important"
    },
    {
        "title":"Career Development",
        "description":"Write down career aspirations and how to achieve them.",
        "date":"Mar 01, 2024",
        "category":"social"
    },
    {
        "title":"Shopping List",
        "description":"Keep a running list of items to buy next time you are out.",
        "date":"Mar 01, 2024",
        "category":"business"
    },
    {
        "title":"Quotes of the Day",
        "description":"Note interesting or motivational quotes you come across.",
        "date":"Mar 01, 2024",
        "category":"all"
    },
    {
        "title":"Personal Milestones",
        "description":"Document accomplishments in your personal life.",
        "date":"Mar 01, 2024",
        "category":"business"
    }
];

sessionStorage.setItem("notes", JSON.stringify(_set_notesValues));


let addNotes = document.querySelector(".add-new-notes");
let titleTag = document.querySelector("#note-title");
let descTag = document.querySelector("#note-text");
let addBtn = document.querySelector(".add-notes");

let editTitleTag = document.querySelector("#edit-note-title");
let editDescTag = document.querySelector("#edit-note-text");
let editBtn = document.querySelector(".edit-notes");

let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let notes = JSON.parse(sessionStorage.getItem("notes") || "[]");
let isUpdate = false, updateId;

let _get_addNotesModal = document.querySelector('#addNotesModal');
let _get_editNotesModal = document.querySelector('#editNotesModal');

let _init_addNotesModal = new bootstrap.Modal(_get_addNotesModal, {
    keyboard: false
})
let _init_editNotesModal = new bootstrap.Modal(_get_editNotesModal, {
    keyboard: false
})

addNotes.addEventListener("click", () => {
    _init_addNotesModal.show();
});

function showNotes() {
    if(!notes) return;
    document.querySelectorAll(".note").forEach(li => li.remove());
    notes.forEach((note, id) => {
        let filterDesc = note.description.replaceAll("\n", '<br/>');
        let liTag = `<div class="col-md-4 mb-3">
                        <div class="note" data-category="${note.category}">
                            <div class="action-btn">
                                <ul class="menu list-inline">
                                    <li class="list-inline-item btn-edit" onclick="updateNote(${id}, '${note.title}', '${note.category}', '${filterDesc}')"><svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-pencil-minus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /><path d="M16 19h6" /></svg></li>
                                    <li class="list-inline-item btn-delete" onclick="deleteNote(${id})"><svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg></li>
                                </ul>
                            </div>
                        
                            <div class="details">
                                <h5>${note.title}</h5>
                                <p>${filterDesc}</p>
                            </div>

                            <div class="bottom-content">
                                <p>${note.date}</p>
                                <div class="settings">

                                    <div class="btn-group" role="group">
                                        <div id="btndefault" type="button" class="dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-label-important"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16.52 7h-12.52l4 5l-4 5h12.52a1 1 0 0 0 .78 -.375l3.7 -4.625l-3.7 -4.625a1 1 0 0 0 -.78 -.375" /></svg>
                                        </div>
                                        <div class="dropdown-menu" aria-labelledby="btndefault">
                                            <a href="javascript:void(0);" class="dropdown-item note-category cat-all" data-cat-note="all">Default</a>
                                            <a href="javascript:void(0);" class="dropdown-item note-category cat-business" data-cat-note="business">Business</a>
                                            <a href="javascript:void(0);" class="dropdown-item note-category cat-social" data-cat-note="social">Social</a>
                                            <a href="javascript:void(0);" class="dropdown-item note-category cat-important" data-cat-note="important">Important</a>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>

                        </div>
                    </div>`;
        document.querySelector('.notes-list').insertAdjacentHTML("afterend", liTag);
    });
}


showNotes();

function showMenu(elem) {
    elem.parentElement.classList.add("show");
    document.addEventListener("click", e => {
        if(e.target.tagName != "I" || e.target != elem) {
            elem.parentElement.classList.remove("show");
        }
    });
}

function deleteNote(noteId) {
    let confirmDel = confirm("Are you sure you want to delete this note?");
    if(!confirmDel) return;
    notes.splice(noteId, 1);
    sessionStorage.setItem("notes", JSON.stringify(notes));
    showNotes();
}

function updateNote(noteId, title, category, filterDesc) {
    let description = filterDesc.replaceAll('<br/>', '\r\n');
    updateId = noteId;
    isUpdate = true;
    _init_editNotesModal.show();
    editTitleTag.value = title;
    editDescTag.value = description;
}

addBtn.addEventListener("click", e => {
    e.preventDefault();   
    
    let title = titleTag.value;
    let description = descTag.value;
    
    if(title || description) {
        let currentDate = new Date(),
        month = months[currentDate.getMonth()],
        day = currentDate.getDate(),
        year = currentDate.getFullYear();

        let noteInfo = {title, description, date: `${month} ${day}, ${year}`}
        if(!isUpdate) {
            notes.push(noteInfo);
        } else {
            isUpdate = false;
            notes[updateId] = noteInfo;
        }
        sessionStorage.setItem("notes", JSON.stringify(notes));
        showNotes();
        // setCategory();

        _init_addNotesModal.hide();

        titleTag.value = '';
        descTag.value = '';
    }
});

editBtn.addEventListener("click", e => {
    e.preventDefault();
    
    let title = editTitleTag.value;
    let description = editDescTag.value;

    if(title || description) {
        let currentDate = new Date(),
        month = months[currentDate.getMonth()],
        day = currentDate.getDate(),
        year = currentDate.getFullYear();

        let noteInfo = {title, description, date: `${month} ${day}, ${year}`}
        if(!isUpdate) {
            notes.push(noteInfo);
        } else {
            isUpdate = false;
            notes[updateId] = noteInfo;
        }
        
        sessionStorage.setItem("notes", JSON.stringify(notes));
        showNotes();
        setCategory();
        _init_editNotesModal.hide();

        editTitleTag.value = '';
        editDescTag.value = '';
    }
});

function setCategory() {
    
    let _get_note_category = document.querySelectorAll('.note-category');

    _get_note_category.forEach(element => {
        element.addEventListener('click', function() {
            let _get_catNote = this.dataset.catNote;
            this.closest('.note').setAttribute("data-category", _get_catNote)
        })        
    });
    
}

function filterNote() {
    let filterNote = document.querySelectorAll('.filter-note');

    filterNote.forEach(element => {
        element.addEventListener('click', function() {
            let _get_catID = this.id;
            
            let _get_filterNoteActive = document.querySelector('.filter-note.active');
            
            if (_get_filterNoteActive) {
                _get_filterNoteActive.classList.remove('active');
                this.classList.add('active');
            } else {
                this.classList.add('active');
            }            

            let _get_notesCat = document.querySelectorAll(`.note`);            

            _get_notesCat.forEach(noteEle => {

                let _get_cat = noteEle.dataset.category;

                if (_get_catID === _get_cat) {
                    noteEle.parentNode.style.display = 'block';
                } else if (_get_catID === "all") {
                    noteEle.parentNode.style.display = 'block';
                } else {
                    noteEle.parentNode.style.display = 'none';
                }
                
            });
            
        })        
    });
}

setCategory();
filterNote();