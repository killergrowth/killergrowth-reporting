// List 
let _addList = document.querySelector('#add-list');
let _addListInput = document.querySelector('#s-list-name');

let _addListModalBtn = document.querySelector('._add-list');
let _get_addListModal = document.getElementById('addListModal');

let _editListInput = document.querySelector('#s-list-name-edit');
let _get_editListBoard = document.querySelector('.btn-edit-board');
let _editListModalBtn = document.querySelector('._edit-list');
let _get_editListModal = document.getElementById('editListModal');

// Add Task Modal
let _get_addTaskModal = document.getElementById('addTaskModal');
let _addTask = document.querySelector('.add-tsk');
let _addTask_Title_Input = document.querySelector('#s-task');
let _addTask_TextArea_Input = document.querySelector('#s-text');

// Edit Task Modal
let _get_editTaskModal = document.getElementById('editTaskModal');
let _editTask = document.querySelector('.edit-tsk');
let _editTask_Title_Input = document.querySelector('#s-edit-task');
let _editTask_TextArea_Input = document.querySelector('#s-edit-text');

// Board Select List
let boardSelector = document.getElementById("boards-id-list");

// Boards
let _get_boardDeleteBtn = document.querySelector('.btn-delete-board');


let _init_addListModal = new bootstrap.Modal(_get_addListModal, {
    keyboard: false
})
let _init_editListModal = new bootstrap.Modal(_get_editListModal, {
    keyboard: false
})

let _init_addTaskModal = new bootstrap.Modal(_get_addTaskModal, {
    keyboard: false
})
let _init_editTaskModal = new bootstrap.Modal(_get_editTaskModal, {
    keyboard: false
})


function randomString(length) {
    let result = '';
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}


/**
 * 
 *  @function kcAddBoardModal => Kanban Add Board Modal Toggle Fn();
 * 
 */

function kcAddBoardModal() {

    _addList.addEventListener('click', function() {
        _init_addListModal.show();        
    })
    
}

/**
 * 
 *  @function kcAddBoard => Kanban Add Board Modal Toggle Fn();
 * 
 */

function kcAddBoard() {

    _addListModalBtn.addEventListener('click', function() {
        let get_addListInput = _addListInput.value;
    
        _appScrumboard.addBoards([
            {
                id: randomString(5),
                title: get_addListInput,
                item: [
                ]
            }
        ]);    

        _init_addListModal.hide();

        _addListInput.value = "";
        
        resetBoardsList();
        boardsIdList();
        kcAddTaskModal();
        kcEditBoardModal();
    })
    
}


/**
 * 
 *  @function kcEditBoardModal => Kanban Edit Board Modal Toggle Fn();
 * 
 */

function kcEditBoardModal() {
    _get_editListBoard.addEventListener('click', function() {

        _editListInput.value = boardSelector.options[boardSelector.selectedIndex].text;        
        _init_editListModal.show();
        
    })
}


/**
 * 
 *  @function kcEditBoard => Kanban Edit Board Toggle Fn();
 * 
 */

function kcEditBoard() {

    _editListModalBtn.addEventListener('click', function() {
        
        let get_editListInput = _editListInput.value;

        _appScrumboard.options.boards.forEach(element => {

            if (element.id === boardSelector.value) {

                element.title=get_editListInput;
                document.querySelector(`[data-id="${element.id}"] .kanban-title-board`).innerText = get_editListInput;
                _editListInput.value = '';
                _init_editListModal.hide();
                resetBoardsList();
                boardsIdList();                
            }
        });
    });
}



/**
 * 
 *  @function kcAddTaskModal => Kanban Add Task Modal Toggle Fn();
 * 
 */

function kcAddTaskModal() {

    let _get_addTaskBtn = document.querySelectorAll('.kb-add-task');

    _get_addTaskBtn.forEach(element => {
        element.addEventListener('click', function() {

            let _kanbanBoard = element.closest('.kanban-board');
            let _kanbanBoard_ID = _kanbanBoard.dataset.id;

            _addTask.setAttribute('data-kboard-id', _kanbanBoard_ID)
            
            _init_addTaskModal.show();
            
        })
    })    
}


/**
 * 
 *  @function kcAddTask => Kanban Add Task Fn();
 * 
 */

function kcAddTask() {

    _addTask.addEventListener('click', function() {

        let _kanbanBoard_ID = document.querySelector('.add-tsk').dataset.kboardId;
        
        if (_addTask_Title_Input.value !== '') {

            let _get_addTask_Title_Input_Value = _addTask_Title_Input.value;
            let _get_addTask_TextArea_Input_Value = _addTask_TextArea_Input.value;

            _appScrumboard.addElement(_kanbanBoard_ID, {
                id: randomString(5),
                title: `<div class="kanban-card" data-image="" data-kcTitle="${_get_addTask_Title_Input_Value}" data-kcContent="${_get_addTask_TextArea_Input_Value}">
                                <div class="d-flex kc-card-actions" style="cursor:pointer;">
                                    <div class="kc-card-edit">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-pencil-minus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /><path d="M16 19h6" /></svg>
                                    </div>
                                    <div class="kc-card-delete">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                                    </div>
                                </div>

                                <div class="d-flex flex-column align-items-start">
                                    <div class="kc-status">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-up-right">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M8 8h8v8" />
                                        </svg>
                                    </div>
                                    
                                    <h3 class="kc-title">
                                        ${_get_addTask_Title_Input_Value}
                                    </h3>
                                    
                                    <div class="d-flex justify-content-between w-100">

                                        <div class="d-flex align-self-center">

                                            <div class="kc-task-comments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-message-dots">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M12 11v.01" />
                                                        <path d="M8 11v.01" />
                                                        <path d="M16 11v.01" />
                                                        <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3z" />
                                                    </svg>
                                                </div>
                                                <div class="count">1</div>
                                            </div>

                                            <div class="kc-task-attachments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-paperclip">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5" />
                                                    </svg>
                                                </div>
                                                <div class="count">4</div>
                                            </div>
                                            
                                        </div>

                                        <div class="">
                                            
                                            <div class="avatar--group">
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-7.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-19.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-12.png" class="rounded-circle" />
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>`
            });

            _init_addTaskModal.hide();

            _addTask_Title_Input.value = '';
            _addTask_TextArea_Input.value = '';
                        
            /**
             * 
             * 
             *   @re-initiate all the functions after adding new task
             * 
             *  */

            // Re-init Edit Task
            
            kcCardEditModal();
            kcCardEdit();
            
            // Re-init Delate Task
            kcCardDelete();
        } else {
            console.warn('Conditions Does not matches');
        }

    });
}


/**
 * 
 *  @function kcCardEditModal => Kanban Edit Task Modal Toggle Fn();
 * 
 */


function kcCardEditModal() {
    let _get_editTaskBtn = document.querySelectorAll('.kc-card-edit');
    
    _get_editTaskBtn.forEach(element => {
        element.addEventListener('click', function() {
            
            let _this = element;
            let _kanban_item = _this.closest('.kanban-item');
            let _get_kanbanCard = _kanban_item.querySelector('.kanban-card');
            
            let _kanbanBoard_ID = _kanban_item.dataset.eid;
            let _get_kc_image = _get_kanbanCard.dataset.image;
            let _get_kc_title = _get_kanbanCard.dataset.kctitle;
            let _get_kc_content = _get_kanbanCard.dataset.kccontent;
            let _get_condition = _get_kc_image !== ''? "true" : "false";

            _editTask_Title_Input.value = _get_kc_title;
            _editTask_TextArea_Input.value = _get_kc_content;

            
            _editTask.setAttribute('data-img-attach', _get_condition);
            _editTask.setAttribute('data-kboard-id', _kanbanBoard_ID);
            
            _init_editTaskModal.show();

        })
    });
}


/**
 * 
 *  @function kcCardEdit => Kanban Edit Task Fn();
 * 
 */

function kcCardEdit() {
        
    _editTask.addEventListener('click', function() {

        let _kanbanBoard_ID = document.querySelector('.edit-tsk').dataset.kboardId;
        
        let _get_id = this.dataset.kboardId;
        let _get_imgAttach = this.dataset.imgAttach;

        let _get_kc_image = "";                
        
        let _get_editTask_Title_Input_Value = _editTask_Title_Input.value;
        let _get_editTask_TextArea_Input_Value = _editTask_TextArea_Input.value;

        if (_get_imgAttach !== 'false') {
            _appScrumboard.replaceElement(_get_id, {
                title: `<div class="kanban-card" data-image="${_get_kc_image}" data-kcTitle="${_get_editTask_Title_Input_Value}" data-kcContent="${_get_editTask_TextArea_Input_Value}">
                                <div class="d-flex kc-card-actions" style="cursor:pointer;">
                                    <div class="kc-card-edit">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-pencil-minus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /><path d="M16 19h6" /></svg>
                                    </div>
                                    <div class="kc-card-delete">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                                    </div>
                                </div>
                                <div class="kc-task-image">
                                    <img alt="kct-image" src="../src/assets/img/apps/kanban/abstract-2.jpg" />
                                </div>
                                <div class="d-flex flex-column align-items-start">
                                    <div class="kc-status">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-up-right">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M8 8h8v8" />
                                        </svg>
                                    </div>
                                    
                                    <h3 class="kc-title">
                                        ${_get_editTask_Title_Input_Value}
                                    </h3>
                                    
                                    <div class="d-flex justify-content-between w-100">
        
                                        <div class="d-flex align-self-center">
        
                                            <div class="kc-task-comments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-message-dots">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M12 11v.01" />
                                                        <path d="M8 11v.01" />
                                                        <path d="M16 11v.01" />
                                                        <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3z" />
                                                    </svg>
                                                </div>
                                                <div class="count">1</div>
                                            </div>
        
                                            <div class="kc-task-attachments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-paperclip">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5" />
                                                    </svg>
                                                </div>
                                                <div class="count">4</div>
                                            </div>
                                            
                                        </div>
        
                                        <div class="">
                                            
                                            <div class="avatar--group">
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-27.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-30.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-37.png" class="rounded-circle" />
                                                </div>
                                            </div>
        
                                        </div>
        
                                    </div>
                                </div>
                            </div>`
            });                    
        } else {
            _appScrumboard.replaceElement(_get_id, {
                title: `<div class="kanban-card" data-image="" data-kcTitle="${_get_editTask_Title_Input_Value}" data-kcContent="${_get_editTask_TextArea_Input_Value}">
                                <div class="d-flex kc-card-actions" style="cursor:pointer;">
                                    <div class="kc-card-edit">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-pencil-minus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /><path d="M16 19h6" /></svg>
                                    </div>
                                    <div class="kc-card-delete">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                                    </div>
                                </div>
                                
                                <div class="d-flex flex-column align-items-start">
                                    <div class="kc-status">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-up-right">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M8 8h8v8" />
                                        </svg>
                                    </div>
                                    
                                    <h3 class="kc-title">
                                        ${_get_editTask_Title_Input_Value}
                                    </h3>
                                    
                                    <div class="d-flex justify-content-between w-100">
        
                                        <div class="d-flex align-self-center">
        
                                            <div class="kc-task-comments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-message-dots">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M12 11v.01" />
                                                        <path d="M8 11v.01" />
                                                        <path d="M16 11v.01" />
                                                        <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3z" />
                                                    </svg>
                                                </div>
                                                <div class="count">1</div>
                                            </div>
        
                                            <div class="kc-task-attachments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-paperclip">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5" />
                                                    </svg>
                                                </div>
                                                <div class="count">4</div>
                                            </div>
                                            
                                        </div>
        
                                        <div class="">
                                            
                                            <div class="avatar--group">
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-32.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-28.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-36.png" class="rounded-circle" />
                                                </div>
                                            </div>
        
                                        </div>
        
                                    </div>
                                </div>
                            </div>`
            });
        }

        _init_editTaskModal.hide();
        
    })
}


function kcCardDelete() {
    document.querySelectorAll('.kc-card-delete').forEach(element => {
        element.addEventListener('click', function() {
            
            let _this = element;
            let _kanban_item = _this.closest('.kanban-item');
            // console.log(element)
            
            let _get_element_id = _kanban_item.dataset.eid;
            
            _appScrumboard.removeElement(_get_element_id);
            
        })
    });
}



/**
 * ====================
 * Multiple File Upload
 * ====================
*/

// We want to preview images, so we register
// the Image Preview plugin, We also register 
// exif orientation (to correct mobile image
// orientation) and size validation, to prevent
// large files from being added
FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageExifOrientation,
    FilePondPluginFileValidateSize,
    // FilePondPluginImageEdit
);
  
  // Select the file input and use 
  // create() to turn it into a pond
var addTaslFileUpload = FilePond.create(
    document.querySelector('.add-task-file-upload')
);

var editTaslFileUpload = FilePond.create(
    document.querySelector('.edit-task-file-upload')
);


let _appScrumboard = new jKanban({
    element : '#myKanban',
    widthBoard: "350px",
    itemAddOptions: {
        enabled: true,                                              // add a button to board for easy item creation
        content: '+',                                                // text or html content of the board button   
        class: 'kb-add-task btn btn-primary',         // default class of the button
        footer: false                                           // position the button on footer
    },
    
    boards :[
        {
            id    : "board-todo_list",               // id of the board
            title : "Todo List",              // title of the board
            item  : [                           // item of this board
                {
                    id    : "board-todo_list-1",        // id of the item
                    title : `<div class="kanban-card" data-image="../src/assets/img/apps/kanban/abstract-2.jpg" data-kcTitle="Gather Project Requirements" data-kcContent="lorem Ipsum">
                                <div class="d-flex kc-card-actions" style="cursor:pointer;">
                                    <div class="kc-card-edit">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-pencil-minus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /><path d="M16 19h6" /></svg>
                                    </div>
                                    <div class="kc-card-delete">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                                    </div>
                                </div>
                                <div class="kc-task-image">
                                    <img alt="kct-image" src="../src/assets/img/apps/kanban/abstract-2.jpg" />
                                </div>
                                <div class="d-flex flex-column align-items-start">
                                    <div class="kc-status">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-up-right">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M8 8h8v8" />
                                        </svg>
                                    </div>
                                    
                                    <h3 class="kc-title">
                                        Gather Project Requirements
                                    </h3>
                                    
                                    <div class="d-flex justify-content-between w-100">

                                        <div class="d-flex align-self-center">

                                            <div class="kc-task-comments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-message-dots">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M12 11v.01" />
                                                        <path d="M8 11v.01" />
                                                        <path d="M16 11v.01" />
                                                        <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3z" />
                                                    </svg>
                                                </div>
                                                <div class="count">1</div>
                                            </div>

                                            <div class="kc-task-attachments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-paperclip">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5" />
                                                    </svg>
                                                </div>
                                                <div class="count">4</div>
                                            </div>
                                            
                                        </div>

                                        <div class="">
                                            
                                            <div class="avatar--group">
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-24.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-21.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-25.png" class="rounded-circle" />
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>`
                },
                {
                    id    : "board-todo_list-2",
                    title : `<div class="kanban-card" data-image="" data-kcTitle="Create Wireframes & UI Design" data-kcContent="lorem Ipsum">
                                <div class="d-flex kc-card-actions" style="cursor:pointer;">
                                    <div class="kc-card-edit">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-pencil-minus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /><path d="M16 19h6" /></svg>
                                    </div>
                                    <div class="kc-card-delete">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                                    </div>
                                </div>
                                <div class="d-flex flex-column align-items-start">
                                    <div class="kc-status">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-up-right">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M8 8h8v8" />
                                        </svg>
                                    </div>
                                    
                                    <h3 class="kc-title">
                                        Create Wireframes & UI Design
                                    </h3>
                                    <div class="d-flex justify-content-between w-100">

                                        <div class="d-flex align-self-center">

                                            <div class="kc-task-comments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-message-dots">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M12 11v.01" />
                                                        <path d="M8 11v.01" />
                                                        <path d="M16 11v.01" />
                                                        <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3z" />
                                                    </svg>
                                                </div>
                                                <div class="count">1</div>
                                            </div>

                                            <div class="kc-task-attachments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-paperclip">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5" />
                                                    </svg>
                                                </div>
                                                <div class="count">4</div>
                                            </div>
                                            
                                        </div>

                                        <div class="">
                                            
                                            <div class="avatar--group">
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-30.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-32.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-34.png" class="rounded-circle" />
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>`, 
                },
                {
                    id    : "board-todo_list-3",
                    title : `<div class="kanban-card" data-image="" data-kcTitle="Set Up Development Environment" data-kcContent="lorem Ipsum">
                                <div class="d-flex kc-card-actions" style="cursor:pointer;">
                                    <div class="kc-card-edit">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-pencil-minus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /><path d="M16 19h6" /></svg>
                                    </div>
                                    <div class="kc-card-delete">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                                    </div>
                                </div>
                                <div class="d-flex flex-column align-items-start">
                                    <div class="kc-status">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-up-right">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M8 8h8v8" />
                                        </svg>
                                    </div>
                                    
                                    <h3 class="kc-title">
                                        Set Up Development Environment
                                    </h3>

                                    <div class="d-flex justify-content-between w-100">

                                        <div class="d-flex align-self-center">

                                            <div class="kc-task-comments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-message-dots">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M12 11v.01" />
                                                        <path d="M8 11v.01" />
                                                        <path d="M16 11v.01" />
                                                        <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3z" />
                                                    </svg>
                                                </div>
                                                <div class="count">1</div>
                                            </div>

                                            <div class="kc-task-attachments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-paperclip">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5" />
                                                    </svg>
                                                </div>
                                                <div class="count">4</div>
                                            </div>
                                            
                                        </div>

                                        <div class="">
                                            
                                            <div class="avatar--group">
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-26.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-27.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-12.png" class="rounded-circle" />
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>`, 
                }
            ]
        },
        {
            id    : "board-in_progress",
            title : "In Progress",
            item  : [                           // item of this board
                {
                    id    : "board-in_progress-1",
                    title : `<div class="kanban-card" data-image="" data-kcTitle="Develop Core Features" data-kcContent="lorem Ipsum">
                                <div class="d-flex kc-card-actions" style="cursor:pointer;">
                                    <div class="kc-card-edit">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-pencil-minus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /><path d="M16 19h6" /></svg>
                                    </div>
                                    <div class="kc-card-delete">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                                    </div>
                                </div>
                                <div class="d-flex flex-column align-items-start">
                                    <div class="kc-status">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-up-right">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M8 8h8v8" />
                                        </svg>
                                    </div>
                                    
                                    <h3 class="kc-title">
                                        Develop Core Features
                                    </h3>

                                    <div class="d-flex justify-content-between w-100">

                                        <div class="d-flex align-self-center">

                                            <div class="kc-task-comments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-message-dots">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M12 11v.01" />
                                                        <path d="M8 11v.01" />
                                                        <path d="M16 11v.01" />
                                                        <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3z" />
                                                    </svg>
                                                </div>
                                                <div class="count">1</div>
                                            </div>

                                            <div class="kc-task-attachments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-paperclip">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5" />
                                                    </svg>
                                                </div>
                                                <div class="count">4</div>
                                            </div>
                                            
                                        </div>

                                        <div class="">
                                            
                                            <div class="avatar--group">
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-10.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-9.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-7.png" class="rounded-circle" />
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>`, 
                },
                {
                    id    : "board-in_progress-2",        // id of the item
                    title : `<div class="kanban-card" data-image="../src/assets/img/apps/kanban/abstract-1.jpg" data-kcTitle="Integrate API & Database" data-kcContent="lorem Ipsum">
                                <div class="d-flex kc-card-actions" style="cursor:pointer;">
                                    <div class="kc-card-edit">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-pencil-minus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /><path d="M16 19h6" /></svg>
                                    </div>
                                    <div class="kc-card-delete">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                                    </div>
                                </div>
                    
                                <div class="kc-task-image">
                                    <img alt="kct-image" src="../src/assets/img/apps/kanban/abstract-1.jpg" />
                                </div>
                                <div class="d-flex flex-column align-items-start">
                                    <div class="kc-status">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-up-right">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M8 8h8v8" />
                                        </svg>
                                    </div>
                                    
                                    <h3 class="kc-title">
                                        Integrate API & Database
                                    </h3>
                                    
                                    <div class="d-flex justify-content-between w-100">

                                        <div class="d-flex align-self-center">

                                            <div class="kc-task-comments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-message-dots">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M12 11v.01" />
                                                        <path d="M8 11v.01" />
                                                        <path d="M16 11v.01" />
                                                        <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3z" />
                                                    </svg>
                                                </div>
                                                <div class="count">1</div>
                                            </div>

                                            <div class="kc-task-attachments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-paperclip">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5" />
                                                    </svg>
                                                </div>
                                                <div class="count">4</div>
                                            </div>
                                            
                                        </div>

                                        <div class="">
                                            
                                            <div class="avatar--group">
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-14.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-13.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-2.png" class="rounded-circle" />
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>`,         // title of the item
                    class : ["myClass"]     // array of additional classes
                },
            ]
        },
        {
            id    : "board-ready_to_test",
            title : "Review",
            item  : [                           // item of this board
                {
                    id    : "board-ready_to_test-1",
                    title : `<div class="kanban-card" data-image="" data-kcTitle="Perform Bug Fixing & Optimization" data-kcContent="lorem Ipsum">
                                <div class="d-flex kc-card-actions" style="cursor:pointer;">
                                    <div class="kc-card-edit">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-pencil-minus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /><path d="M16 19h6" /></svg>
                                    </div>
                                    <div class="kc-card-delete">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                                    </div>
                                </div>
                                <div class="d-flex flex-column align-items-start">
                                    <div class="kc-status">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-up-right">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M8 8h8v8" />
                                        </svg>
                                    </div>
                                    
                                    <h3 class="kc-title">
                                        Perform Bug Fixing & Optimization
                                    </h3>

                                    <div class="d-flex justify-content-between w-100">

                                        <div class="d-flex align-self-center">

                                            <div class="kc-task-comments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-message-dots">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M12 11v.01" />
                                                        <path d="M8 11v.01" />
                                                        <path d="M16 11v.01" />
                                                        <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3z" />
                                                    </svg>
                                                </div>
                                                <div class="count">1</div>
                                            </div>

                                            <div class="kc-task-attachments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-paperclip">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5" />
                                                    </svg>
                                                </div>
                                                <div class="count">4</div>
                                            </div>
                                            
                                        </div>

                                        <div class="">
                                            
                                            <div class="avatar--group">
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-25.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-28.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-33.png" class="rounded-circle" />
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>`, 
                }
            ]
        },
        {
            id    : "board-done",
            title : "Done",
            item  : [                           // item of this board
                {
                    id    : "board-done_list-1",
                    title : `<div class="kanban-card" data-image="" data-kcTitle="Deploy & Document" data-kcContent="lorem Ipsum">
                                <div class="d-flex kc-card-actions" style="cursor:pointer;">
                                    <div class="kc-card-edit">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-pencil-minus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /><path d="M16 19h6" /></svg>
                                    </div>
                                    <div class="kc-card-delete">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                                    </div>
                                </div>
                                <div class="d-flex flex-column align-items-start">
                                    <div class="kc-status">
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-up-right">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M8 8h8v8" />
                                        </svg>
                                    </div>
                                    
                                    <h3 class="kc-title">
                                        Deploy & Document
                                    </h3>

                                    <div class="d-flex justify-content-between w-100">

                                        <div class="d-flex align-self-center">

                                            <div class="kc-task-comments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-message-dots">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M12 11v.01" />
                                                        <path d="M8 11v.01" />
                                                        <path d="M16 11v.01" />
                                                        <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3z" />
                                                    </svg>
                                                </div>
                                                <div class="count">1</div>
                                            </div>

                                            <div class="kc-task-attachments">
                                                <div class="icon">
                                                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-paperclip">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                        <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5" />
                                                    </svg>
                                                </div>
                                                <div class="count">4</div>
                                            </div>
                                            
                                        </div>

                                        <div class="">
                                            
                                            <div class="avatar--group">
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-25.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-28.png" class="rounded-circle" />
                                                </div>
                                                <div class="avatar avatar-sm">
                                                    <img alt="avatar" src="../src/assets/img/profile/profile-33.png" class="rounded-circle" />
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>`, 
                }
            ]
        }
    ]
})


function boardsIdList() {
    
    let boardsList = _appScrumboard.options.boards;
    
    for(index in boardsList) {
        boardSelector.options[boardSelector.options.length] = new Option(boardsList[index].title, boardsList[index].id);
    }
}

function resetBoardsList() {
    boardSelector.options.length = 0;
}


_get_boardDeleteBtn.addEventListener('click', function() {
    _appScrumboard.removeBoard(boardSelector.value);
    resetBoardsList();
    boardsIdList();
})


boardsIdList();


kcAddBoardModal();
kcAddBoard();


kcEditBoardModal();
kcEditBoard();


/**
 * 
 * Add Task
 * 
 *  */ 

kcAddTaskModal();
kcAddTask();

/**
 * 
 * Edit Task
 * 
 *  */ 
kcCardEditModal();
kcCardEdit();

kcCardDelete();