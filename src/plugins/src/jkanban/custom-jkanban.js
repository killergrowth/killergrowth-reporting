var kanban1 = new jKanban({
    element:'#demo1',
    boards  :[
        {
            'id' : '_todo',
            'title'  : 'Try Drag me!',
            "class" : "bg-info:500",
            'item'  : [
                {
                    'title':'You can drag me too',
                },
                {
                    'title':'Buy Milk',
                }
            ]
        },
        {
            'id' : '_working',
            'title'  : 'Working',
            "class" : "bg-warning:500",
            'item'  : [
                {
                    'title':'Do Something!',
                },
                {
                    'title':'Run?',
                }
            ]
        },
        {
            'id' : '_done',
            'title'  : 'Done',
            "class" : "bg-success:500",
            'item'  : [
                {
                    'title':'All right',
                },
                {
                    'title':'Ok!',
                }
            ]
        }
    ]
});







var kanban2 = new jKanban({
    element : '#demo2',
    click : function(el){
        alert(el.innerHTML);
    },
    boards  :[
        {
            'id' : '_todo',
            'title'  : 'To Do (Item only in Working)',
            'class' : 'bg-info:500',
            'dragTo' : ['_working'],
            'item'  : [
                {
                    'title':'My Task Test',
                },
                {
                    'title':'Buy Milk',
                }
            ]
        },
        {
            'id' : '_working',
            'title'  : 'Working',
            'class' : 'bg-warning:500',
            'item'  : [
                {
                    'title':'Do Something!',
                },
                {
                    'title':'Run?',
                }
            ]
        },
        {
            'id' : '_done',
            'title'  : 'Done (Item only in Working)',
            'class' : 'bg-success:500',
            'dragTo' : ['_working'],
            'item'  : [
                {
                    'title':'All right',
                },
                {
                    'title':'Ok!',
                }
            ]
        }
    ]
});














var kanban3 = new jKanban({
    element : '#demo3',
    gutter  : '15px',
    click : function(el){
        alert(el.innerHTML);
    },
    boards  :[
        {
            'id' : '_todo',
            'title'  : 'To Do',
            'class' : 'bg-info:500',
            'item'  : [
                {
                    'title':'My Task Test',
                },
                {
                    'title':'Buy Milk',
                }
            ]
        },
        {
            'id' : '_working',
            'title'  : 'Working',
            'class' : 'bg-warning:500',
            'item'  : [
                {
                    'title':'Do Something!',
                },
                {
                    'title':'Run?',
                }
            ]
        },
        {
            'id' : '_done',
            'title'  : 'Done',
            'class' : 'bg-success:500',
            'item'  : [
                {
                    'title':'All right',
                },
                {
                    'title':'Ok!',
                }
            ]
        }
    ]
});

var toDoButton = document.getElementById('addToDo');
toDoButton.addEventListener('click',function(){
    kanban3.addElement(
        '_todo',
        {
            'title':'Test Add',
        }
    );
});

var addBoardDefault = document.getElementById('addDefault');
addBoardDefault.addEventListener('click', function () {
    kanban3.addBoards(
        [{
            'id' : '_default',
            'title'  : 'Kanban Default',
            'item'  : [
                {
                    'title':'Default Item',
                },
                {
                    'title':'Default Item 2',
                },
                {
                    'title':'Default Item 3',
                }
            ]
        }]
    )
});

var removeBoard = document.getElementById('removeBoard');
removeBoard.addEventListener('click',function(){
    kanban3.removeBoard('_done');
});