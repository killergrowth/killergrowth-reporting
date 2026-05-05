/**
 * @function corkThemeCustomizer
 * 
 * @param {object} options
 * 
 * @Warning :- DO NOT MAKE ANY CHANGE
 * 
 */

 const corkThemeCustomizer = function(options) {

    let OPTIONS = {
        // _Base: options.base,
    }

    let Locations = {
        _assets: '../src/assets/',
        _plugins: '../src/plugins/',
    }


    /**
     * @function Base
     * @param {  } options
     */

    this.Components = function() {
        return _components = { 
            MediaSize,
            Dom,
            Locations
        };
    }


    /**
     * @function HTML
     * @param { } options 
     */

    this.HTML = function() {
        let _admin_selector = document.querySelector('.main-container');
        let _page_selector = document.body;

        let _get_dataPage = document.body.dataset.page;
        let _get_dataMain = document.body.dataset.main;
        
        let $html_TriggerButton = `<div class="theme-customizer-trigger">
            <div class="tct-trigger-content">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-settings" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            </div>
        </div>`;


        let content_1 = "";

        if ((_get_dataPage !== undefined) || (_get_dataPage === `true`)) {
            content_1 = `<div class="col-4">
                            <div class="tc-option form-check">
                                <div class="">
                                    <a class="tc-light-ele" target="_blank" href="../html/modern-light-menu/index.html"><img src="../html/src/assets/img/layouts/theme-customizer/layout-1.svg" alt="option"></a>
                                    <a class="tc-dark-ele" target="_blank" href="../html/modern-dark-menu/index.html"><img src="../html/src/assets/img/layouts/theme-customizer/layout-1-dark.svg" alt="option"></a>
                                </div>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="tc-option form-check">
                                <div class="">
                                    <a class="tc-light-ele" target="_blank" href="../html/horizontal-light-menu/index.html"><img src="../html/src/assets/img/layouts/theme-customizer/layout-3.svg" alt="option"></a>
                                    <a class="tc-dark-ele" target="_blank" href="../html/horizontal-dark-menu/index.html"><img src="../html/src/assets/img/layouts/theme-customizer/layout-3-dark.svg" alt="option"></a>
                                </div>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="tc-option form-check">
                                <div class="">
                                    <a class="tc-light-ele" target="_blank" href="../html/vertical-light-menu/index.html"><img src="../html/src/assets/img/layouts/theme-customizer/layout-2.svg" alt="option"></a>
                                    <a class="tc-dark-ele" target="_blank" href="../html/vertical-dark-menu/index.html"><img src="../html/src/assets/img/layouts/theme-customizer/layout-2-dark.svg" alt="option"></a>
                                </div>
                            </div>
                        </div>`;
        } else if ((_get_dataMain !== undefined) || (_get_dataMain === `true`)) {
            content_1 = `<div class="col-4">
                            <div class="tc-option form-check">
                                <div class="">
                                    <a class="tc-light-ele" target="_blank" href="https://designreset.com/cork-new-test/html/modern-light-menu/index.html"><img src="https://designreset.com/wp-content/uploads/2026/04/layout-1.svg" alt="option"></a>
                                    <a class="tc-dark-ele" target="_blank" href="https://designreset.com/cork-new-test/html/modern-dark-menu/index.html"><img src="https://designreset.com/wp-content/uploads/2026/04/layout-1-dark.svg" alt="option"></a>
                                </div>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="tc-option form-check">
                                <div class="">
                                    <a class="tc-light-ele" target="_blank" href="https://designreset.com/cork-new-test/html/horizontal-light-menu/index.html"><img src="https://designreset.com/wp-content/uploads/2026/04/layout-3.svg" alt="option"></a>
                                    <a class="tc-dark-ele" target="_blank" href="https://designreset.com/cork-new-test/html/horizontal-dark-menu/index.html"><img src="https://designreset.com/wp-content/uploads/2026/04/layout-3-dark.svg" alt="option"></a>
                                </div>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="tc-option form-check">
                                <div class="">
                                    <a class="tc-light-ele" target="_blank" href="https://designreset.com/cork-new-test/html/vertical-light-menu/index.html"><img src="https://designreset.com/wp-content/uploads/2026/04/layout-2.svg" alt="option"></a>
                                    <a class="tc-dark-ele" target="_blank" href="https://designreset.com/cork-new-test/html/vertical-dark-menu/index.html"><img src="https://designreset.com/wp-content/uploads/2026/04/layout-2-dark.svg" alt="option"></a>
                                </div>
                            </div>
                        </div>`
        } else {
            content_1 = `<div class="col-4">
                            <div class="tc-option form-check">
                                <div class="">
                                    <a class="tc-light-ele" target="_blank" href="../modern-light-menu/index.html"><img src="../src/assets/img/layouts/theme-customizer/layout-1.svg" alt="option"></a>
                                    <a class="tc-dark-ele" target="_blank" href="../modern-light-menu/index.html"><img src="../src/assets/img/layouts/theme-customizer/layout-1-dark.svg" alt="option"></a>
                                </div>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="tc-option form-check">
                                <div class="">
                                    <a class="tc-light-ele" target="_blank" href="../horizontal-light-menu/index.html"><img src="../src/assets/img/layouts/theme-customizer/layout-3.svg" alt="option"></a>
                                    <a class="tc-dark-ele" target="_blank" href="../horizontal-light-menu/index.html"><img src="../src/assets/img/layouts/theme-customizer/layout-3-dark.svg" alt="option"></a>
                                </div>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="tc-option form-check">
                                <div class="">
                                    <a class="tc-light-ele" target="_blank" href="../vertical-light-menu/index.html"><img src="../src/assets/img/layouts/theme-customizer/layout-2.svg" alt="option"></a>
                                    <a class="tc-dark-ele" target="_blank" href="../vertical-light-menu/index.html"><img src="../src/assets/img/layouts/theme-customizer/layout-2-dark.svg" alt="option"></a>
                                </div>
                            </div>
                        </div>`;
        }


        let content_2 = "";

        if ((_get_dataPage !== undefined) || (_get_dataPage === `true`)) {
            content_2 = `<p class="notification-dashboard mb-0">
                            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon  text-info:500 dark:text-dark:300  icon-tabler icons-tabler-filled icon-tabler-info-square-rounded"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2l.642 .005l.616 .017l.299 .013l.579 .034l.553 .046c4.687 .455 6.65 2.333 7.166 6.906l.03 .29l.046 .553l.041 .727l.006 .15l.017 .617l.005 .642l-.005 .642l-.017 .616l-.013 .299l-.034 .579l-.046 .553c-.455 4.687 -2.333 6.65 -6.906 7.166l-.29 .03l-.553 .046l-.727 .041l-.15 .006l-.617 .017l-.642 .005l-.642 -.005l-.616 -.017l-.299 -.013l-.579 -.034l-.553 -.046c-4.687 -.455 -6.65 -2.333 -7.166 -6.906l-.03 -.29l-.046 -.553l-.041 -.727l-.006 -.15l-.017 -.617l-.004 -.318v-.648l.004 -.318l.017 -.616l.013 -.299l.034 -.579l.046 -.553c.455 -4.687 2.333 -6.65 6.906 -7.166l.29 -.03l.553 -.046l.727 -.041l.15 -.006l.617 -.017c.21 -.003 .424 -.005 .642 -.005zm0 9h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007v3l.007 .117a1 1 0 0 0 .876 .876l.117 .007h1l.117 -.007a1 1 0 0 0 .876 -.876l.007 -.117l-.007 -.117a1 1 0 0 0 -.764 -.857l-.112 -.02l-.117 -.006v-3l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007zm.01 -3l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" /></svg>
                            <span class="text-dark:100 dark:text-dark:300  bg-dark:900">Admin Only</span>
                        </p>`;
        } else if ((_get_dataMain !== undefined) || (_get_dataMain === `true`)) {
            content_2 = `<p class="notification-dashboard mb-0">
                            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon  text-info:500 dark:text-dark:300  icon-tabler icons-tabler-filled icon-tabler-info-square-rounded"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2l.642 .005l.616 .017l.299 .013l.579 .034l.553 .046c4.687 .455 6.65 2.333 7.166 6.906l.03 .29l.046 .553l.041 .727l.006 .15l.017 .617l.005 .642l-.005 .642l-.017 .616l-.013 .299l-.034 .579l-.046 .553c-.455 4.687 -2.333 6.65 -6.906 7.166l-.29 .03l-.553 .046l-.727 .041l-.15 .006l-.617 .017l-.642 .005l-.642 -.005l-.616 -.017l-.299 -.013l-.579 -.034l-.553 -.046c-4.687 -.455 -6.65 -2.333 -7.166 -6.906l-.03 -.29l-.046 -.553l-.041 -.727l-.006 -.15l-.017 -.617l-.004 -.318v-.648l.004 -.318l.017 -.616l.013 -.299l.034 -.579l.046 -.553c.455 -4.687 2.333 -6.65 6.906 -7.166l.29 -.03l.553 -.046l.727 -.041l.15 -.006l.617 -.017c.21 -.003 .424 -.005 .642 -.005zm0 9h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007v3l.007 .117a1 1 0 0 0 .876 .876l.117 .007h1l.117 -.007a1 1 0 0 0 .876 -.876l.007 -.117l-.007 -.117a1 1 0 0 0 -.764 -.857l-.112 -.02l-.117 -.006v-3l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007zm.01 -3l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" /></svg>
                            <span class="text-dark:100 dark:text-dark:300  bg-dark:900">Admin Only</span>
                        </p>`;
        } else {
            content_2 = ``;
        }



    
        let content_3 = "";

        if ((_get_dataPage !== undefined) || (_get_dataPage === `true`)) {
            content_3 = `<p class="notification-dashboard mb-0">
                            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon  text-info:500 dark:text-dark:300  icon-tabler icons-tabler-filled icon-tabler-info-square-rounded"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2l.642 .005l.616 .017l.299 .013l.579 .034l.553 .046c4.687 .455 6.65 2.333 7.166 6.906l.03 .29l.046 .553l.041 .727l.006 .15l.017 .617l.005 .642l-.005 .642l-.017 .616l-.013 .299l-.034 .579l-.046 .553c-.455 4.687 -2.333 6.65 -6.906 7.166l-.29 .03l-.553 .046l-.727 .041l-.15 .006l-.617 .017l-.642 .005l-.642 -.005l-.616 -.017l-.299 -.013l-.579 -.034l-.553 -.046c-4.687 -.455 -6.65 -2.333 -7.166 -6.906l-.03 -.29l-.046 -.553l-.041 -.727l-.006 -.15l-.017 -.617l-.004 -.318v-.648l.004 -.318l.017 -.616l.013 -.299l.034 -.579l.046 -.553c.455 -4.687 2.333 -6.65 6.906 -7.166l.29 -.03l.553 -.046l.727 -.041l.15 -.006l.617 -.017c.21 -.003 .424 -.005 .642 -.005zm0 9h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007v3l.007 .117a1 1 0 0 0 .876 .876l.117 .007h1l.117 -.007a1 1 0 0 0 .876 -.876l.007 -.117l-.007 -.117a1 1 0 0 0 -.764 -.857l-.112 -.02l-.117 -.006v-3l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007zm.01 -3l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" /></svg>
                            <span class="text-dark:100 dark:text-dark:300  bg-dark:900">Admin Only</span>
                        </p>`;
        } else if ((_get_dataMain !== undefined) || (_get_dataMain === `true`)) {
            content_3 = `<p class="notification-dashboard mb-0">
                            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon  text-info:500 dark:text-dark:300  icon-tabler icons-tabler-filled icon-tabler-info-square-rounded"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2l.642 .005l.616 .017l.299 .013l.579 .034l.553 .046c4.687 .455 6.65 2.333 7.166 6.906l.03 .29l.046 .553l.041 .727l.006 .15l.017 .617l.005 .642l-.005 .642l-.017 .616l-.013 .299l-.034 .579l-.046 .553c-.455 4.687 -2.333 6.65 -6.906 7.166l-.29 .03l-.553 .046l-.727 .041l-.15 .006l-.617 .017l-.642 .005l-.642 -.005l-.616 -.017l-.299 -.013l-.579 -.034l-.553 -.046c-4.687 -.455 -6.65 -2.333 -7.166 -6.906l-.03 -.29l-.046 -.553l-.041 -.727l-.006 -.15l-.017 -.617l-.004 -.318v-.648l.004 -.318l.017 -.616l.013 -.299l.034 -.579l.046 -.553c.455 -4.687 2.333 -6.65 6.906 -7.166l.29 -.03l.553 -.046l.727 -.041l.15 -.006l.617 -.017c.21 -.003 .424 -.005 .642 -.005zm0 9h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007v3l.007 .117a1 1 0 0 0 .876 .876l.117 .007h1l.117 -.007a1 1 0 0 0 .876 -.876l.007 -.117l-.007 -.117a1 1 0 0 0 -.764 -.857l-.112 -.02l-.117 -.006v-3l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007zm.01 -3l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" /></svg>
                            <span class="text-dark:100 dark:text-dark:300  bg-dark:900">Admin Only</span>
                        </p>`;
        } else {
            content_3 = ``;
        }


        
        
        let $html_ThemeCustomizer = `<aside class="theme-customizor-container">

        <div class="tc-header">

            <div class="tc-title">
                <h5>Theme Customizer</h5>
            </div>

            <div class="tc-action-close">
                <span class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x tc-btn-action-close"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </span>
            </div>

        </div>

        <div class="tc-content-container">
            
            <div class="tc-options-categories">

                <div id="tc-colorscheme-section" class="tc-option-item mb-4">
                    <div class="tc-option-container">
                        <div class="tc-option-collapse settings-color-scheme-collapse">
                            <div class="options">
                                <div class="choice-container-radio">
                                    
                                    <div class="row">

                                    ${((sessionStorage.getItem('_LayoutName') !== 'Horizontal Light Menu') && (sessionStorage.getItem('_LayoutName') !== 'Horizontal Dark Menu')) ?
                                    
                                        `<div class="col-6">
                                            <div class="tc-option tc-card-switch">

                                                <label class="tc-option mb-0 me-0" for="theme-collapsible">
                                                    
                                                    <span class="d-flex justify-content-between mb-3">
                                                        <span class="tc-icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-table" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                                                <path stroke="none " d="M0 0h24v24H0z" fill="none"></path>
                                                                <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                                                                <line x1="4" y1="10" x2="20" y2="10"></line>
                                                                <line x1="10" y1="4" x2="10" y2="20"></line>
                                                            </svg>
                                                        </span>

                                                        <span class="form-check form-switch form-check-inline form-switch-success me-0">
                                                            <input class="form-check-input theme-customization-input" type="checkbox" role="switch" name="theme-menu-settings-collaspible" id="theme-collapsible">                                                            <!-- <label class="form-check-label" for="form-switch-primary">Primary</label> -->
                                                        </span>
                                                        
                                                    </span>
                                                    
                                                    <span class="tc-option-label">Collapsible</span>
        
                                                    ${content_2}

                                                </label>

                                                
                                            </div>
                                        </div>`

                                    :

                                    ``

                                    }

                                        <div class="${((sessionStorage.getItem('_LayoutName') !== 'Horizontal Light Menu') && (sessionStorage.getItem('_LayoutName') !== 'Horizontal Dark Menu')) ? `col-6` : `col-7 mx-auto`} ">
                                            <div class="tc-option tc-card-switch">

                                                <label class="tc-option mb-0 me-0" for="theme-monochrome">
                                                    
                                                    <span class="d-flex justify-content-between mb-3">
                                                        <span class="tc-icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-table" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                                                <path stroke="none " d="M0 0h24v24H0z" fill="none"></path>
                                                                <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                                                                <line x1="4" y1="10" x2="20" y2="10"></line>
                                                                <line x1="10" y1="4" x2="10" y2="20"></line>
                                                            </svg>
                                                        </span>

                                                        <span class="form-check form-switch form-check-inline form-switch-success me-0">
                                                            <input class="form-check-input theme-customization-input" type="checkbox" name="theme-colorScheme-monochrome" role="switch" id="theme-monochrome">
                                                        </span>
                                                        
                                                    </span>
                                                    
                                                    <span class="tc-option-label">Monochrome</span>
        
                                                </label>
                                                
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            

                <div id="tc-colorscheme-section" class="tc-option-item mb-4">
                    <div class="tc-option-container">
                        <div class="tc-option-collapse settings-color-scheme-collapse">
                            <div class="options">
                                <div class="choice-container-radio">
                                    
                                    <div class="tc-option-area">

                                        <div class="tc-option-area-title">
                                            <h5>Color Scheme</h5>
                                        </div>
                                        
                                        <div class="row">
                                            <div class="col-6">
                                                <div class="tc-option tc-card-switch">
    
                                                    <label class="tc-option mb-0 me-0" for="theme-light-mode">
                                                        
                                                        <span class="d-flex justify-content-between mb-3">
                                                            <span class="tc-icon">
    
                                                                <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-sun-high"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14.828 14.828a4 4 0 1 0 -5.656 -5.656a4 4 0 0 0 5.656 5.656z" />
                                                                    <path d="M6.343 17.657l-1.414 1.414" />
                                                                    <path d="M6.343 6.343l-1.414 -1.414" />
                                                                    <path d="M17.657 6.343l1.414 -1.414" />
                                                                    <path d="M17.657 17.657l1.414 1.414" />
                                                                    <path d="M4 12h-2" />
                                                                    <path d="M12 4v-2" />
                                                                    <path d="M20 12h2" />
                                                                    <path d="M12 20v2" />
                                                                </svg>
                                                            </span>
    
                                                            <span class="form-check form-switch form-check-inline form-switch-warning me-0">
                                                                <input class="form-check-input theme-customization-input" type="checkbox" role="switch" name="theme-colorScheme-style" value="theme-light" id="theme-light-mode">
                                                            </span>
                                                            
                                                        </span>
                                                        
                                                        <span class="tc-option-label">Light</span>
            
                                                    </label>
                                                    
                                                </div>
                                            </div>
    
                                            <div class="col-6">
                                                <div class="tc-option tc-card-switch">
    
                                                    <label class="tc-option mb-0 me-0" for="theme-dark-mode">
                                                        
                                                        <span class="d-flex justify-content-between mb-3">
                                                            <span class="tc-icon">
                                                                <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-moon">
                                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                                    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                                                                </svg>
                                                            </span>
    
                                                            <span class="form-check form-switch form-check-inline form-switch-primary me-0">
                                                                <input class="form-check-input theme-customization-input" type="checkbox" role="switch" name="theme-colorScheme-style" value="theme-dark" id="theme-dark-mode">
                                                                <!-- <label class="form-check-label" for="form-switch-primary">Primary</label> -->
                                                            </span>
                                                            
                                                        </span>
                                                        
                                                        <span class="tc-option-label">Dark</span>
            
                                                    </label>
                                                    
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    
                                    
                                </div>

                            </div>
                        </div>
                    </div>

                </div>

                <div id="tc-layout-section" class="tc-option-item mb-4">
                    <div class="tc-option-container">
                        <div class="tc-option-collapse settings-layout-collapse">

                            <div class="options">

                                <div class="tc-option-area">

                                    <div class="tc-option-area-title">
                                        <h5>Layout</h5>
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-6">
                                            <div class="tc-option tc-card-switch">
        
                                                <label class="tc-option mb-0 me-0" for="theme-full-mode">
                                                    
                                                    <span class="d-flex justify-content-between mb-3">
                                                        <span class="tc-icon">
        
                                                            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-arrows-maximize">
                                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                                <path d="M16 4l4 0l0 4" />
                                                                <path d="M14 10l6 -6" />
                                                                <path d="M8 20l-4 0l0 -4" />
                                                                <path d="M4 20l6 -6" />
                                                                <path d="M16 20l4 0l0 -4" />
                                                                <path d="M14 14l6 6" />
                                                                <path d="M8 4l-4 0l0 4" />
                                                                <path d="M4 4l6 6" />
                                                            </svg>
                                                        </span>
        
                                                        <span class="form-check form-switch form-check-inline form-switch-secondary me-0">
                                                            <input class="form-check-input theme-customization-input" type="checkbox" role="switch" name="theme-layout-width" value="full" id="theme-full-mode">
                                                        </span>
                                                        
                                                    </span>
                                                    
                                                    <span class="tc-option-label">Full</span>
        
                                                </label>
                                                
                                            </div>
                                        </div>
        
                                        <div class="col-6">
                                            <div class="tc-option tc-card-switch">
        
                                                <label class="tc-option mb-0 me-0" for="theme-boxed-mode">
                                                    
                                                    <span class="d-flex justify-content-between mb-3">
                                                        <span class="tc-icon">

                                                            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-border-sides">
                                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                                <path d="M4 8v8" />
                                                                <path d="M20 16v-8" />
                                                                <path d="M8 4h8" />
                                                                <path d="M8 20h8" />
                                                            </svg>
                                                        </span>
        
                                                        <span class="form-check form-switch form-check-inline form-switch-secondary me-0">
                                                            <input class="form-check-input theme-customization-input" type="checkbox" role="switch" name="theme-layout-width" value="boxed" id="theme-boxed-mode">
                                                        </span>
                                                        
                                                    </span>
                                                    
                                                    <span class="tc-option-label">Boxed</span>
        
                                                </label>
                                                
                                            </div>
                                        </div>

                                        ${content_3}
                                        
                                    </div>
        
                                </div>
                                
                                
                            </div>
                            
                        </div>
                    </div>
                </div>
                                
                <!---<div id="tc-rtl-section" class="tc-option-item mb-4">
                    <div class="tc-option-container">
                        
                        <div class="tc-option-collapse settings-rtl-collapse">

                            <div class="options">

                                <div class="tc-option-area">

                                    <div class="tc-option-area-title">
                                        <h5>RTL</h5>
                                    </div>
                                    
                                    <div class="rtl text-center">

                                        ${((_get_dataPage !== undefined) || (_get_dataPage === `true`)) ?
                                             
                                            `<a href="../html/rtl/vertical-light-menu/index.html" target="_blank" class="btn btn-gradient-secondary">View</a>`
                                            
                                            :
                                            
                                            `<a href="../rtl/vertical-light-menu/index.html" target="_blank" class="btn btn-gradient-secondary">View</a>`
                                        }
                                        
                                    </div>
                                </div>
                                
                            </div>
                            
                        </div>
                    </div>
                </div>--->

                <div id="tc-theme-layout-section" class="tc-option-item">
                    <div class="tc-option-container">
                        <div id="OptionOne" class="tc-option-collapse collapse show settings-theme-layout-style-collapse" aria-labelledby="headingOne" data-bs-parent="#tcOptions">
                            <div class="options">
                                <div class="choice-container-radio">

                                    <div class="tc-option-area">

                                        <div class="tc-option-area-title">
                                            <h5>Theme Layout</h5>
                                        </div>
                                        
                                        <div class="row">

                                            ${content_1}

                                       </div>
                                        
                                    </div>                                    
                                    
                                </div>
                            </div>                                
                        </div>
                    </div>
                    
                </div>

            </div>

            <div class="tc-options-action-buttons">

                <div class="row">
                    <div class="col-6">
                        <button class="btn btn-gradient-danger reset-btn w-100">Reset</button>
                    </div>
                    <div class="col-6">
                        <!-- <a href="https://themeforest.net/item/cork-responsive-admin-dashboard-template/25582188" target="_blank" class="btn btn-secondary w-100">Buy Now</a> -->
                        <a href="https://themeforest.net/item/cork-responsive-admin-dashboard-template/25582188" target="_blank" class="btn btn-primary w-100">Buy Now</a>
                    </div>
                </div>
                
            </div>
            
        </div>

    </aside>`;
                

    // console.log(_admin_selector);
    if (_admin_selector !== null) {
        _admin_selector.insertAdjacentHTML('afterend', $html_TriggerButton)
        _admin_selector.insertAdjacentHTML('afterend', $html_ThemeCustomizer)
    } else {
        console.log(_page_selector)
        _page_selector.insertAdjacentHTML('beforeend', $html_TriggerButton)
        _page_selector.insertAdjacentHTML('beforeend', $html_ThemeCustomizer)
    }


        this.ThemeLayout();
        this.Active();
        this.ThemeCustomizerScroll();

    }
    

    /**
     * @function ThemeLayout
     * @param {  } options
     */

    this.ThemeLayout = function() {

        let DomCustomizer = {
            _class: {
                themeInput: document.querySelectorAll('.theme-customization-input')
            }
        }
        
        DomCustomizer._class.themeInput.forEach(element => {

            element.addEventListener('change', function() {

                let _GetInputNameAttribute = this.name;
                let _GetInputValueAttribute = this.value;

                let _get_PageData = document.body.dataset.page;

                switch (_GetInputNameAttribute) {

                    case 'theme-colorScheme-style':
                        
                        switch (_GetInputValueAttribute) {
                            case 'theme-light':
                                document.body.classList.remove('dark');
                                document.querySelector(`#theme-dark-mode`).checked = false;
                                sessionStorage.setItem('_LayoutDark', false);
                                break;
                                
                            case 'theme-dark':
                                document.body.classList.add('dark');
                                document.querySelector(`#theme-light-mode`).checked = false;
                                sessionStorage.setItem('_LayoutDark', true);
                                break;
                        
                            default:
                                console.error('Undefined value');
                                break;
                        }
                        
                        break;


                    // COLOR SCHEME = MONOCHROME

                    case 'theme-colorScheme-monochrome':

                        if (document.querySelector(`[name="${_GetInputNameAttribute}"]`).checked === true) {
                            document.body.classList.add('layout-theme-monochrome');
                            sessionStorage.setItem('_LayoutMonochrome', true);
                        } else {
                            document.body.classList.remove('layout-theme-monochrome');
                            sessionStorage.setItem('_LayoutMonochrome', false);
                        }
                        
                        break;
                        
                    case 'theme-menu-settings-collaspible':

                        if (document.querySelector(`[name="${_GetInputNameAttribute}"]`).checked === true) {
                            document.querySelector("html").classList.add("sidebar-noneoverflow");
                            document.body.classList.add('alt-menu');
                            document.querySelector('.main-container').classList.add('sidebar-closed');
                            document.querySelector('.menu.active .dropdown-toggle[aria-expanded="true"]').setAttribute("aria-expanded", "false");
                            document.querySelector('.menu.active .submenu').classList.remove("show");
                            sessionStorage.setItem('_LayoutAltMenu', true);
                        } else {
                            document.querySelector("html").classList.remove("sidebar-noneoverflow");
                            document.body.classList.remove('alt-menu');
                            document.querySelector('.main-container').classList.remove('sidebar-closed');
                            document.querySelector('.menu.active .dropdown-toggle[aria-expanded="false"]').setAttribute("aria-expanded", "true");
                            document.querySelector('.menu.active .submenu').classList.add("show");
                            sessionStorage.setItem('_LayoutAltMenu', false);
                        }

                        break;

                    // LAYOUT = FULL AND BOXED
                    
                    case 'theme-layout-width':

                        switch (_GetInputValueAttribute) {

                            case 'full':

                                if ((_get_PageData === undefined) || (_get_PageData !== `true`))  {

                                    get_layoutName = sessionStorage.getItem("_LayoutName");
                                    
                                    if ((get_layoutName === "Vertical Light Menu") || (get_layoutName === "Vertical Dark Menu")) {
                                        document.querySelector('.middle-content').classList.remove('container-xxl');
                                    } else if ((get_layoutName === "Modern Light Menu") || (get_layoutName === "Modern Dark Menu")) {
                                        document.querySelector('.middle-content').classList.remove('container-xxl');
                                        document.querySelector('.header-container').classList.remove('container-xxl');
                                    } else if ((get_layoutName === "Horizontal Light Menu") || (get_layoutName === "Horizontal Dark Menu")) {
                                        document.querySelector('.header-container .header').classList.remove('container-xxl');
                                        document.querySelector('.topbar-wrapper .menu-categories').classList.remove('container-xxl');
                                        document.querySelector('.middle-content').classList.remove('container-xxl');
                                        
                                    } else {
                                        console.warn("No layout Defined");
                                    }
                                    
                                }
                                document.body.classList.remove("layout-boxed");
                                document.querySelector(`#theme-boxed-mode`).checked = false;
                                sessionStorage.setItem('_LayoutBoxed', false);
                                break;
                                
                            case 'boxed':
                                    
                                if ((_get_PageData === undefined) || (_get_PageData !== `true`))  {

                                    get_layoutName = sessionStorage.getItem("_LayoutName");
                                    
                                    if ((get_layoutName === "Vertical Light Menu") || (get_layoutName === "Vertical Dark Menu")) {
                                        document.querySelector('.middle-content').classList.add('container-xxl');
                                    } else if ((get_layoutName === "Modern Light Menu") || (get_layoutName === "Modern Dark Menu")) {
                                        document.querySelector('.middle-content').classList.add('container-xxl');
                                        document.querySelector('.header-container').classList.add('container-xxl');
                                    } else if ((get_layoutName === "Horizontal Light Menu") || (get_layoutName === "Horizontal Dark Menu")) {
                                        document.querySelector('.header-container .header').classList.add('container-xxl');
                                        document.querySelector('.topbar-wrapper .menu-categories').classList.add('container-xxl');
                                        document.querySelector('.middle-content').classList.add('container-xxl');
                                    } else {
                                        console.warn("No layout Defined");
                                    }
                                }
                                
                                document.body.classList.add("layout-boxed");
                                document.querySelector(`#theme-full-mode`).checked = false;
                                sessionStorage.setItem('_LayoutBoxed', true);
                                break;
                        
                            default:
                                console.error('Undefined value')
                                break;
                        }
                        
                        break;
                
                    default:
                        console.error('default value')
                        break;
                }
            })
        });
    }

    /**
     * @function Active
     * @param {  } options
     */

    this.Active = function() {

        // Monochrome

        let _get_LayoutMonochrome = sessionStorage.getItem('_LayoutMonochrome');
        let _convert_Parse_LayoutMonochrome = JSON.parse(_get_LayoutMonochrome)
        
        if (_convert_Parse_LayoutMonochrome) {
            document.querySelector('.theme-customization-input#theme-monochrome').checked = true
        } else {
            document.querySelector('.theme-customization-input#theme-monochrome').checked = false
        }
        
        //  Menu Collapsible

        if ((sessionStorage.getItem("_LayoutName") !== "Horizontal Light Menu") && (sessionStorage.getItem("_LayoutName") !== "Horizontal Dark Menu")) {
            let _get_LayoutCollapsible = sessionStorage.getItem('_LayoutAltMenu');
            let _convert_Parse_LayoutCollapsible = JSON.parse(_get_LayoutCollapsible)
    
            if (_convert_Parse_LayoutCollapsible) {
                document.querySelector(`.theme-customization-input#theme-collapsible`).checked = true;
            } else {
                document.querySelector(`.theme-customization-input#theme-collapsible`).checked = false;
            }
        }
        

        //  Boxed

        let _get_LayoutBoxed = sessionStorage.getItem('_LayoutBoxed');
        let _convert_Parse_LayoutBoxed = JSON.parse(_get_LayoutBoxed);

        if (_convert_Parse_LayoutBoxed) {
            document.querySelector(`.theme-customization-input#theme-boxed-mode`).checked = true;
            document.querySelector('.theme-customization-input#theme-full-mode').checked = false;
        } else {
            document.querySelector(`.theme-customization-input#theme-boxed-mode`).checked = false;
            document.querySelector('.theme-customization-input#theme-full-mode').checked = true;
        }

        //  Menu ColorScheme

        let _get_LayoutDark = sessionStorage.getItem('_LayoutDark');
        let _convert_Parse_LayoutDark = JSON.parse(_get_LayoutDark);

        if (_convert_Parse_LayoutDark) {
            document.querySelector(`.theme-customization-input#theme-light-mode`).checked = false;
            document.querySelector('.theme-customization-input#theme-dark-mode').checked = true;
        } else {
            document.querySelector(`.theme-customization-input#theme-light-mode`).checked = true;
            document.querySelector('.theme-customization-input#theme-dark-mode').checked = false;
        }
    }

    /**
     * @function ThemeCustomizerScroll
     * @param {  } options
     */

    this.ThemeCustomizerScroll = function() {
        themeCustomizerScroll = new PerfectScrollbar('.tc-options-categories', {
            wheelSpeed:.5,
            swipeEasing:!0,
            minScrollbarLength:40,
            maxScrollbarLength:300,
            suppressScrollX : true
        });        
    }

    /**
     * @function Reset
     * @param {  } options
     */

     this.Reset = function() {
        if (sessionStorage.length) {
            sessionStorage.clear();
            window.location.reload();
        }
     }

     /**
     * @access themeCustomizer Functions
     * @param
     * @functions 
     */

    this.themeCustomizerTrigger = function() {
        setTimeout(() => {
            let _getThemeTrigger = document.querySelector('.theme-customizer-trigger');
            let _getThemeCustomizerOverlay = document.querySelector('.tc-overlay');
            
            _getThemeTrigger.addEventListener('click', function() {
                document.body.classList.add('theme-customizer-show')
                _getThemeCustomizerOverlay.classList.add('show');
            })
            document.querySelector('.tc-action-close .tc-btn-action-close').addEventListener('click', function() {
                document.body.classList.remove('theme-customizer-show')
                _getThemeCustomizerOverlay.classList.remove('show');
            })
        
            if (!sessionStorage.themeCustomizer) {
                document.body.classList.add('theme-customizer-show')
                _getThemeCustomizerOverlay.classList.add('show');
                sessionStorage.setItem('themeCustomizer', true);                    
            }
            
            _getThemeCustomizerOverlay.addEventListener('click', function() {
                document.body.classList.remove('theme-customizer-show')
                _getThemeCustomizerOverlay.classList.remove('show');
            })
        }, 500);  
    }
     
     

    /**
     * @access Init Functions
     * @param
     * @functions 
     */

    this.HTML();
    
}

setTimeout(() => {
    
    /**
     *  @access corkThemeCustomizer()
     */
    
        let ThemeCustomizer = new corkThemeCustomizer();
        
        
    
    /**
     *  @Reset
    */
    
    document.querySelector('.reset-btn').addEventListener('click', function() {
        ThemeCustomizer.Reset();
    })
    
    ThemeCustomizer.themeCustomizerTrigger();
}, 400);