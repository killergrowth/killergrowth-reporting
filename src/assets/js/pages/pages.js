/**
 * 
 * @Mandatory_JS_FILEs - (Page JS Mandatory Files)
 * 
 */


/**
 * 
 *  Get 
 * 
 */


let _getSession = sessionStorage;
let _get_Body = document.body;

// Dark Layout

let _getSession_LayoutDark = _getSession.getItem('_LayoutDark');
let _convertToParse_LayoutDark = JSON.parse(_getSession_LayoutDark);

// Monochrome

let _getSession_LayoutMonochrome = _getSession.getItem('_LayoutMonochrome');
let _convertToParse_LayoutMonochrome = JSON.parse(_getSession_LayoutMonochrome);


if (_convertToParse_LayoutDark) {
    _get_Body.classList.add('dark');
} else {
    _get_Body.classList.remove('dark');
}



if (_convertToParse_LayoutMonochrome) {
    _get_Body.classList.add('layout-theme-monochrome');
} else {
    _get_Body.classList.remove('layout-theme-monochrome');
}


/**
 * 
 *  Nav-Sidebar Toggle
 * 
 */

let navbarToggle = document.querySelector('.navbar-toggle');
let pageOverlay = document.querySelector('.page-overlay');

if (navbarToggle) {
    navbarToggle.addEventListener('click', function() {
        document.body.classList.add('sidebar-page-show')
    })
}

pageOverlay.addEventListener('click', function() {
    document.body.classList.remove('sidebar-page-show')
})





/**
 * 
 *  Button Wave Effect
 * 
 */

getAllBtn = document.querySelectorAll('button.btn, a.btn');
            
getAllBtn.forEach(btn => {

    if (!btn.classList.contains('_no--effects')) {
        btn.classList.add('_effect--ripple');
    }
    
});

if (document.querySelector('._effect--ripple')) {
    Waves.attach('._effect--ripple', 'waves-light');
    Waves.init();
}