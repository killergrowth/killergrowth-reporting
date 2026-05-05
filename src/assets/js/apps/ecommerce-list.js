let usrListAll = new DataTable('#ecommerce-list-all', {
    "dom": "<'inv-list-top-section'<'row'<'col-sm-12 col-md-6 d-flex justify-content-md-start justify-content-center mb-0'l><'col-sm-12 col-md-6 d-flex justify-content-md-end justify-content-center mt-md-0 mt-3'f>>>" +
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
    },

    initComplete: function () {
        this.api()
            .columns()
            .every(function () {
                let column = this;
                let title = column.footer().textContent;
 
                // Create input element
                let input = document.createElement('input');
                input.placeholder = title;
                input.classList.add('form-control');
                input.classList.add('w-100');
                column.footer().replaceChildren(input);
 
                // Event listener for user input
                input.addEventListener('keyup', () => {
                    if (column.search() !== this.value) {
                        column.search(input.value).draw();
                    }
                });
            });
    }
});




new TomSelect('#productAvailabilityFilter', {
    maxItems: null,
    placeholder: 'Availability',
    plugins: {
		remove_button:{
			title:'Remove this item',
		}
	}
});
  
new TomSelect('#productStatusFilter', {
    maxItems: null,
    placeholder: 'Status',
    plugins: {
		remove_button:{
			title:'Remove this item',
		}
	}
});


document.getElementById('productAvailabilityFilter').addEventListener('change', function () {
    const selected = Array.from(this.selectedOptions).map(opt => opt.value);
    const regex = selected.length ? selected.join('|') : '';
    usrListAll.column(3).search(regex, true, false).draw();
});

document.getElementById('productStatusFilter').addEventListener('change', function () {
    const selected = Array.from(this.selectedOptions).map(opt => opt.value);
    const regex = selected.length ? selected.join('|') : '';
    usrListAll.column(5).search(regex, true, false).draw();
});
