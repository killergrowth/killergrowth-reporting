let usrListAll = new DataTable('#user-list-all', {
    "dom": "<'inv-list-top-section'<'row'<'col-sm-12 col-md-6 d-flex justify-content-md-start justify-content-center'l><'col-sm-12 col-md-6 d-flex justify-content-md-end justify-content-center mt-md-0 mt-3'f>>>" +
        "<'table-responsive'tr>" +
        "<'inv-list-bottom-section d-sm-flex justify-content-sm-between text-center'<'inv-list-pages-count  mb-sm-0 mb-3'i><'inv-list-pagination'p>>",

    headerCallback:function(e, a, t, n, s) {
        e.getElementsByTagName("th")[0].innerHTML=`
        <div class="form-check form-check-primary d-block new-control">
            <input class="form-check-input chk-parent" type="checkbox" id="form-check-default">
        </div>`
    },
    columnDefs:[{
        targets:0,
        width:"30px",
        className:"",
        orderable:!1,
        render:function(e, a, t, n) {
            return `
            <div class="form-check form-check-primary d-block new-control">
                <input class="form-check-input child-chk" type="checkbox" id="form-check-default">
            </div>`
        },
    }],
    "order": [[ 1, "asc" ]],
    
    "oLanguage": {
        "oPaginate": { "sPrevious": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>', "sNext": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' },
        "sInfo": "Showing page _PAGE_ of _PAGES_",
        "sSearch": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        "sSearchPlaceholder": "Search...",
        "sLengthMenu": "Results :  _MENU_",
    },
    "stripeClasses": [],
    "lengthMenu": [7, 10, 20, 50],
    "pageLength": 10,
    layout: {
        bottomEnd: {
            paging: {
                firstLast: false
            }
        }
    }
});

let usrListActive = new DataTable('#user-list-active', {
    "dom": "<'inv-list-top-section'<'row'<'col-sm-12 col-md-6 d-flex justify-content-md-start justify-content-center'l><'col-sm-12 col-md-6 d-flex justify-content-md-end justify-content-center mt-md-0 mt-3'f>>>" +
        "<'table-responsive'tr>" +
        "<'inv-list-bottom-section d-sm-flex justify-content-sm-between text-center'<'inv-list-pages-count  mb-sm-0 mb-3'i><'inv-list-pagination'p>>",

    headerCallback:function(e, a, t, n, s) {
        e.getElementsByTagName("th")[0].innerHTML=`
        <div class="form-check form-check-primary d-block new-control">
            <input class="form-check-input chk-parent" type="checkbox" id="form-check-default">
        </div>`
    },
    columnDefs:[{
        targets:0,
        width:"30px",
        className:"",
        orderable:!1,
        render:function(e, a, t, n) {
            return `
            <div class="form-check form-check-primary d-block new-control">
                <input class="form-check-input child-chk" type="checkbox" id="form-check-default">
            </div>`
        },
    }],
    "order": [[ 1, "asc" ]],
    
    "oLanguage": {
        "oPaginate": { "sPrevious": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>', "sNext": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' },
        "sInfo": "Showing page _PAGE_ of _PAGES_",
        "sSearch": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        "sSearchPlaceholder": "Search...",
        "sLengthMenu": "Results :  _MENU_",
    },
    "stripeClasses": [],
    "lengthMenu": [7, 10, 20, 50],
    "pageLength": 10,
    layout: {
        bottomEnd: {
            paging: {
                firstLast: false
            }
        }
    }
});


let usrListPending = new DataTable('#user-list-pending', {
    "dom": "<'inv-list-top-section'<'row'<'col-sm-12 col-md-6 d-flex justify-content-md-start justify-content-center'l><'col-sm-12 col-md-6 d-flex justify-content-md-end justify-content-center mt-md-0 mt-3'f>>>" +
        "<'table-responsive'tr>" +
        "<'inv-list-bottom-section d-sm-flex justify-content-sm-between text-center'<'inv-list-pages-count  mb-sm-0 mb-3'i><'inv-list-pagination'p>>",

    headerCallback:function(e, a, t, n, s) {
        e.getElementsByTagName("th")[0].innerHTML=`
        <div class="form-check form-check-primary d-block new-control">
            <input class="form-check-input chk-parent" type="checkbox" id="form-check-default">
        </div>`
    },
    columnDefs:[{
        targets:0,
        width:"30px",
        className:"",
        orderable:!1,
        render:function(e, a, t, n) {
            return `
            <div class="form-check form-check-primary d-block new-control">
                <input class="form-check-input child-chk" type="checkbox" id="form-check-default">
            </div>`
        },
    }],
    "order": [[ 1, "asc" ]],
    
    "oLanguage": {
        "oPaginate": { "sPrevious": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>', "sNext": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' },
        "sInfo": "Showing page _PAGE_ of _PAGES_",
        "sSearch": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        "sSearchPlaceholder": "Search...",
        "sLengthMenu": "Results :  _MENU_",
    },
    "stripeClasses": [],
    "lengthMenu": [7, 10, 20, 50],
    "pageLength": 10,
    layout: {
        bottomEnd: {
            paging: {
                firstLast: false
            }
        }
    }
});


let usrListBanned = new DataTable('#user-list-banned', {
    "dom": "<'inv-list-top-section'<'row'<'col-sm-12 col-md-6 d-flex justify-content-md-start justify-content-center'l><'col-sm-12 col-md-6 d-flex justify-content-md-end justify-content-center mt-md-0 mt-3'f>>>" +
        "<'table-responsive'tr>" +
        "<'inv-list-bottom-section d-sm-flex justify-content-sm-between text-center'<'inv-list-pages-count  mb-sm-0 mb-3'i><'inv-list-pagination'p>>",

    headerCallback:function(e, a, t, n, s) {
        e.getElementsByTagName("th")[0].innerHTML=`
        <div class="form-check form-check-primary d-block new-control">
            <input class="form-check-input chk-parent" type="checkbox" id="form-check-default">
        </div>`
    },
    columnDefs:[{
        targets:0,
        width:"30px",
        className:"",
        orderable:!1,
        render:function(e, a, t, n) {
            return `
            <div class="form-check form-check-primary d-block new-control">
                <input class="form-check-input child-chk" type="checkbox" id="form-check-default">
            </div>`
        },
    }],
    "order": [[ 1, "asc" ]],
    
    "oLanguage": {
        "oPaginate": { "sPrevious": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>', "sNext": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' },
        "sInfo": "Showing page _PAGE_ of _PAGES_",
        "sSearch": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        "sSearchPlaceholder": "Search...",
        "sLengthMenu": "Results :  _MENU_",
    },
    "stripeClasses": [],
    "lengthMenu": [7, 10, 20, 50],
    "pageLength": 10,
    layout: {
        bottomEnd: {
            paging: {
                firstLast: false
            }
        }
    }
});


let usrListRejected = new DataTable('#user-list-rejected', {
    "dom": "<'inv-list-top-section'<'row'<'col-sm-12 col-md-6 d-flex justify-content-md-start justify-content-center'l><'col-sm-12 col-md-6 d-flex justify-content-md-end justify-content-center mt-md-0 mt-3'f>>>" +
        "<'table-responsive'tr>" +
        "<'inv-list-bottom-section d-sm-flex justify-content-sm-between text-center'<'inv-list-pages-count  mb-sm-0 mb-3'i><'inv-list-pagination'p>>",

    headerCallback:function(e, a, t, n, s) {
        e.getElementsByTagName("th")[0].innerHTML=`
        <div class="form-check form-check-primary d-block new-control">
            <input class="form-check-input chk-parent" type="checkbox" id="form-check-default">
        </div>`
    },
    columnDefs:[{
        targets:0,
        width:"30px",
        className:"",
        orderable:!1,
        render:function(e, a, t, n) {
            return `
            <div class="form-check form-check-primary d-block new-control">
                <input class="form-check-input child-chk" type="checkbox" id="form-check-default">
            </div>`
        },
    }],
    "order": [[ 1, "asc" ]],
    
    "oLanguage": {
        "oPaginate": { "sPrevious": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>', "sNext": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' },
        "sInfo": "Showing page _PAGE_ of _PAGES_",
        "sSearch": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        "sSearchPlaceholder": "Search...",
        "sLengthMenu": "Results :  _MENU_",
    },
    "stripeClasses": [],
    "lengthMenu": [7, 10, 20, 50],
    "pageLength": 10,
    layout: {
        bottomEnd: {
            paging: {
                firstLast: false
            }
        }
    }
});



$("div.toolbar").html('<button class="dt-button dt-delete btn btn-danger" tabindex="0" aria-controls="invoice-list"><span>Delete</span></button>');

// multiCheck(invoiceList);


$('.dt-delete').on('click', function() {
      // Read all checked checkboxes
    $(".select-customers-info:checked").each(function () {
        if (this.classList.contains('chk-parent')) {
            return;
        } else {
            $(this).parents('tr').remove();
        }
    });
    
})


$('.action-delete').on('click', function() {
    $(this).parents('tr').remove();
})