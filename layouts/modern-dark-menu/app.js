var CORKUI = function() {
    let layoutName = 'Modern Dark Menu';
    // let _ThemeColors;

    let Settings = {
        _admin: "Cork Admin Template",
        _layout_name: layoutName,
        // _layout_toggle: true,
        _layout_darkMode: true,        // Done
        _layout_boxed: true,                   // Boxed layout
        _layout_monochrome: false,           // Monochrome theme
        _layout_altMenu: true,           // Also, known as collapsible menu
        _layout_logo_dark: '../src/assets/img/logo.svg',
        _layout_logo_light: '../src/assets/img/logo2.svg',
        _reset: false,
    }

    let Colors = {
        _primary_50: "#f5f7fe",
        _primary_100: "#eceffe",
        _primary_200: "#cfd7fc",
        _primary_300: "#b1befa",
        _primary_400: "#778ef7",
        _primary_500: "#3d5df3",
        _primary_600: "#3754db",
        _primary_700: "#2e46b6",
        _primary_800: "#253892",
        _primary_900: "#1e2e77",
        _primary_1000: "#152143",

        _info_50: "#f2f9ff",
        _info_100: "#e6f4ff",
        _info_200: "#bfe3ff",
        _info_300: "#99d2ff",
        _info_400: "#4db0ff",
        _info_500: "#008eff",
        _info_600: "#0080e6",
        _info_700: "#006bbf",
        _info_800: "#005599",
        _info_900: "#00467d",
        _info_1000: "#0b2f52",

        _success_50: "#f2fbf6",
        _success_100: "#e6f6ee",
        _success_200: "#c0e9d4",
        _success_300: "#99dcbb",
        _success_400: "#4dc187",
        _success_500: "#01a754",
        _success_600: "#01964c",
        _success_700: "#017d3f",
        _success_800: "#016432",
        _success_900: "#005229",
        _success_1000: "#0c272b",

        _warning_50: "#fefaf4",
        _warning_100: "#fcf5e9",
        _warning_200: "#f8e5c8",
        _warning_300: "#f3d6a7",
        _warning_400: "#eab764",
        _warning_500: "#e19822",
        _warning_600: "#cb891f",
        _warning_700: "#a9721a",
        _warning_800: "#875b14",
        _warning_900: "#6e4a11",
        _warning_1000: "#282625",

        _danger_50: "#fdf5f6",
        _danger_100: "#fbeced",
        _danger_200: "#f6cfd2",
        _danger_300: "#f1b3b6",
        _danger_400: "#e67980",
        _danger_500: "#db4049",
        _danger_600: "#c53a42",
        _danger_700: "#a43037",
        _danger_800: "#83262c",
        _danger_900: "#6b1f24",
        _danger_1000: "#2c1c2b",

        _secondary_50: "#f9f5fc",
        _secondary_100: "#f2eafa",
        _secondary_200: "#dfcbf2",
        _secondary_300: "#cbacea",
        _secondary_400: "#a46edb",
        _secondary_500: "#7d30cb",
        _secondary_600: "#712bb7",
        _secondary_700: "#5e2498",
        _secondary_800: "#4b1d7a",
        _secondary_900: "#3d1863",
        _secondary_1000: "#1d1a3b",

        _dark_50: "#f5f5f5",
        _dark_100: "#eaeaec",
        _dark_200: "#cbcbcf",
        _dark_300: "#abacb2",
        _dark_400: "#6c6e78",
        _dark_500: "#2d303e",
        _dark_600: "#292b38",
        _dark_700: "#22242f",
        _dark_800: "#1b1d25",
        _dark_900: "#16181e",
        _dark_1000: "#181e2e",

        _x_1: "#fafafa",
        _x_2: "#f1f2f3",
        _x_3: "#ebedf2",
        _x_4: "#e0e6ed",
        _x_5: "#bfc9d4",
        _x_6: "#d3d3d3",
        _x_7: "#888ea8",
        _x_8: "#506690",
        _x_9: "#607d8b",
        _x_10: "#555555",
        _x_11: "#515365",
        _x_12: "#1b2e4b",
        _x_13: "#191e3a",
        _x_14: "#0e1726",
        _x_15: "#060818",
        _x_16: "#008eff",
        _x_17: "#00ab55",
        _x_18: "#ffbb44",
        _x_19: "#e95f2b",
        _x_20: "#f8538d",
        _x_21: "#445ede",
        _x_22: "#304aca",
        _x_23: "#22c7d5",
        _x_24: "#7d30cb",
        
    }
    
    var MediaSize = {
        xl: 1200,
        lg: 992,
        md: 991,
        sm: 576
    };
    
    var Dom = {
        main: document.querySelector('html, body'),
        id: {
            container: document.querySelector("#container"),
        },
        class: {
            navbar: document.querySelector(".navbar"),
            overlay: document.querySelector('.overlay'),
            search: document.querySelector('.toggle-search'),
            searchOverlay: document.querySelector('.search-overlay'),
            searchForm: document.querySelector('.search-form-control'),
            mainContainer: document.querySelector('.main-container'),
            mainHeader: document.querySelector('.header.navbar')
        }
    }

    
    var categoryScroll = {
        scrollCat: function() {
            var sidebarWrapper = document.querySelectorAll('.sidebar-wrapper li.active')[0];
            var sidebarWrapperTop = sidebarWrapper.offsetTop - 50;
            setTimeout(() => {
                const scroll = document.querySelector('.menu-categories');
                scroll.scrollTop = sidebarWrapperTop;
            }, 50);
        }
    }

    

    var toggleFunction = {
        sidebar: function($recentSubmenu) {

            var sidebarCollapseEle = document.querySelectorAll('.sidebarCollapse');

            sidebarCollapseEle.forEach(el => {
                el.addEventListener('click', function (sidebar) {
                    sidebar.preventDefault();
                    let getSidebar = document.querySelector('.sidebar-wrapper');

                    if ($recentSubmenu === true) {
                        if (document.querySelector('.collapse.submenu').classList.contains('show')) {
                            document.querySelector('.submenu.show').classList.add('mini-recent-submenu');
                            getSidebar.querySelector('.collapse.submenu').classList.remove('show');
                            getSidebar.querySelector('.collapse.submenu').classList.remove('show');
                            document.querySelector('.collapse.submenu').parentNode.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
                        } else {
                            if (Dom.class.mainContainer.classList.contains('sidebar-closed')) {
                                if (document.querySelector('.collapse.submenu').classList.contains('recent-submenu')) {
                                    getSidebar.querySelector('.collapse.submenu.recent-submenu').classList.add('show');
                                    document.querySelector('.collapse.submenu.recent-submenu').parentNode.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'true');
                                    document.querySelector('.submenu').classList.remove('mini-recent-submenu');
                                } else {
                                    document.querySelector('li.active .submenu').classList.add('recent-submenu');
                                    getSidebar.querySelector('.collapse.submenu.recent-submenu').classList.add('show');
                                    document.querySelector('.collapse.submenu.recent-submenu').parentNode.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'true');
                                    document.querySelector('.submenu').classList.remove('mini-recent-submenu');
                                }
                            }
                        }
                    }
                    
                    Dom.class.mainContainer.classList.toggle("sidebar-closed");
                    Dom.class.mainHeader.classList.toggle('expand-header');
                    Dom.class.mainContainer.classList.toggle("sbar-open");
                    Dom.class.overlay.classList.toggle('show');
                    Dom.main.classList.toggle('sidebar-noneoverflow');
                    
                });
            });
        },
        onToggleSidebarSubmenu: function() {
            ['mouseenter', 'mouseleave'].forEach(function(e){
                document.querySelector('.sidebar-wrapper').addEventListener(e, function() {
                    if (document.querySelector('body').classList.contains('alt-menu')) {
                        if (document.querySelector('.main-container').classList.contains('sidebar-closed')) {
                            if (e === 'mouseenter') {
                                document.querySelector('li.menu .submenu').classList.remove('show');
                                document.querySelector('li.menu.active .submenu').classList.add('recent-submenu');
                                document.querySelector('li.menu.active').querySelector('.collapse.submenu.recent-submenu').classList.add('show');
                                document.querySelector('.collapse.submenu.recent-submenu').parentNode.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'true');
                            } else if (e === 'mouseleave') {
                                getMenuList = document.querySelectorAll('li.menu');
                                getMenuList.forEach(element => {

                                    var submenuShowEle = element.querySelector('.collapse.submenu.show');

                                    if (submenuShowEle) {
                                        submenuShowEle.classList.remove('show');
                                    }

                                    var submenuExpandedToggleEle = element.querySelector('.dropdown-toggle[aria-expanded="true"]');

                                    if (submenuExpandedToggleEle) {
                                        submenuExpandedToggleEle.setAttribute('aria-expanded', 'false');
                                    }
                                    
                                });
                            }
                        }
                    } else {
                        if (document.querySelector('.main-container').classList.contains('sidebar-closed')) {
                            if (e === 'mouseenter') {
                                document.querySelector('li.menu .submenu').classList.remove('show');

                                if (document.querySelector('li.menu.active .submenu')) {
                                    document.querySelector('li.menu.active .submenu').classList.add('recent-submenu');
                                    document.querySelector('li.menu.active').querySelector('.collapse.submenu.recent-submenu').classList.add('show');
                                    document.querySelector('.collapse.submenu.recent-submenu').parentNode.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'true');
                                }
                                
                            } else if (e === 'mouseleave') {
                                getMenuList = document.querySelectorAll('li.menu');
                                getMenuList.forEach(element => {

                                    var submenuShowEle = element.querySelector('.collapse.submenu.show');

                                    if (submenuShowEle) {
                                        submenuShowEle.classList.remove('show');
                                    }


                                    var submenuExpandedToggleEle = element.querySelector('.dropdown-toggle[aria-expanded="true"]');

                                    if (submenuExpandedToggleEle) {
                                        submenuExpandedToggleEle.setAttribute('aria-expanded', 'false');
                                    }
                                    
                                });
                            }
                        }
                    }
                    
                });
            });

        },
        offToggleSidebarSubmenu: function () {
            // $('.sidebar-wrapper').off('mouseenter mouseleave');
        },
        overlay: function() {
            document.querySelector('#dismiss, .overlay').addEventListener('click', function () {
                // hide sidebar
                Dom.class.mainContainer.classList.add('sidebar-closed');
                Dom.class.mainContainer.classList.remove('sbar-open');
                // hide overlay
                Dom.class.overlay.classList.remove('show');
                Dom.main.classList.remove('sidebar-noneoverflow');
            });            
        },
        search: function() {

            if (Dom.class.search) {
                
                Dom.class.search.addEventListener('click', function(event) {
                    this.classList.add('show-search');
                    Dom.class.searchOverlay.classList.add('show');
                    document.querySelector('body').classList.add('search-active');
                });
                
                Dom.class.searchOverlay.addEventListener('click', function(event) {
                    this.classList.remove('show');
                    Dom.class.search.classList.remove('show-search');
                    document.querySelector('body').classList.remove('search-active');
                });
                
                document.querySelector('.search-close').addEventListener('click', function(event) {
                    event.stopPropagation();
                    Dom.class.searchOverlay.classList.remove('show');
                    Dom.class.search.classList.remove('show-search');
                    document.querySelector('body').classList.remove('search-active');
                    document.querySelector('.search-form-control').value = ''
                });
            }

        },
        themeToggle: function (layoutName) {

            var togglethemeEl = document.querySelector('.theme-toggle');
            if (!togglethemeEl) return;
            var getBodyEl = document.body;
            
            togglethemeEl.addEventListener('click', function() {

                var getLocalStorageValue = sessionStorage.getItem("_LayoutDark");
                var parseObj = JSON.parse(getLocalStorageValue);

                if (parseObj) {
                    document.body.classList.remove('dark')
                    // document.querySelector('.navbar-logo').setAttribute('src', Settings._layout_logo_light)
                    sessionStorage.setItem("_LayoutDark", false)
                } else {
                    document.body.classList.add('dark')
                    // document.querySelector('.navbar-logo').setAttribute('src', Settings._layout_logo_dark)
                    sessionStorage.setItem("_LayoutDark", true)
                }
            })
            
        },
        profileSidebar: function() {
            let profileImage = document.querySelector('.user-profile-dropdown .user');
            if (!profileImage) return;
            let profileSidebarOverlay = document.querySelector('.psidebar-overlay');
            // let profileBody = document.body;

            profileImage.addEventListener('click', function() {
                document.body.classList.add('profile-sidebar-active');
                profileSidebarOverlay.classList.add('show');
            })
        },
        profileSidebarClose: function() {
            let profileClose = document.querySelector('.profile-close span');
            let profileSidebarOverlay = document.querySelector('.psidebar-overlay');
            // let profileBody = document.body;

            if (profileClose) {
                profileClose.addEventListener('click', function() {
                    document.body.classList.remove('profile-sidebar-active');
                    profileSidebarOverlay.classList.remove('show');
                })
            }

            if (profileSidebarOverlay) {
                profileSidebarOverlay.addEventListener('click', function() {
                    document.body.classList.remove('profile-sidebar-active');
                    profileSidebarOverlay.classList.remove('show');
                })
            }
        },

    }

    var inBuiltfunctionality = {

        themeColor: function() {
            // Loop through key-value pairs
            Object.entries(Colors).forEach(([key, value]) => {
                sessionStorage.setItem(`${key}`, `${value}`)
            });
            return _ThemeColors = Colors;
        },

        setLayoutName: function() {
            let _get_Layout_name = Settings._layout_name;
            let slugify = _get_Layout_name.toLowerCase().replace(/\s+/g, '-');
            
            sessionStorage.setItem("_LayoutName", `${_get_Layout_name}`);
            sessionStorage.setItem("_LayoutName_Slugify", `${slugify}`);

            document.body.classList.add(`_${slugify}_`);
        },
        
        mainCatActivateScroll: function() {

            if (document.querySelector('.menu-categories')) {
            
                const ps = new PerfectScrollbar('.menu-categories', {
                    wheelSpeed:.5,
                    swipeEasing:!0,
                    minScrollbarLength:40,
                    maxScrollbarLength:300
                });

            }
        },

        profileScroll: function() {
            if (document.querySelector('.profile-scroll')) {
                const profileScroll = new PerfectScrollbar('.profile-scroll', {
                    wheelSpeed:.5,
                    swipeEasing:!0,
                    minScrollbarLength:40,
                    maxScrollbarLength:300
                });
            }
        },

        notificationScroll: function() {

            if (document.querySelector('.notification-scroll')) {
                const notificationS = new PerfectScrollbar('.notification-scroll', {
                    wheelSpeed:.5,
                    swipeEasing:!0,
                    minScrollbarLength:40,
                    maxScrollbarLength:300
                });
            }
            
        },

        messageScroll: function() {

            if (document.querySelector('.message-scroll')) {
                const notificationS = new PerfectScrollbar('.message-scroll', {
                    wheelSpeed:.5,
                    swipeEasing:!0,
                    minScrollbarLength:40,
                    maxScrollbarLength:300
                });
            }
            
        },

        preventScrollBody: function() {
            var nonScrollableElement = document.querySelectorAll('#sidebar, .user-profile-dropdown .dropdown-menu, .notification-dropdown .dropdown-menu,  .language-dropdown .dropdown-menu')

            var preventScrolling = function(e) {
                e = e || window.event;
                if (e.preventDefault)
                    e.preventDefault();
                e.returnValue = false;  

                nonScrollableElement.scrollTop -= e. wheelDeltaY; 
            }

            nonScrollableElement.forEach(preventScroll => {

                preventScroll.addEventListener('mousewheel', preventScrolling);
                preventScroll.addEventListener('DOMMouseScroll', preventScrolling);
                
            });
        },

        searchKeyBind: function() {

            if (Dom.class.search) {
                Mousetrap.bind('ctrl+/', function() {
                    // Select modal element
                    const myModalEl = document.getElementById('searchDialog');
                    
                    // Initialize Bootstrap modal instance
                    const myModal = new bootstrap.Modal(myModalEl);
                    
                    // Show the modal
                    myModal.show();

                    return false;
                });
            }
            
        },

        bsTooltip: function() {
            var bsTooltip = document.querySelectorAll('.bs-tooltip')
            for (let index = 0; index < bsTooltip.length; index++) {
                var tooltip = new bootstrap.Tooltip(bsTooltip[index])
            }
        },

        bsPopover: function() {
            var bsPopover = document.querySelectorAll('.bs-popover')
            for (let index = 0; index < bsPopover.length; index++) {
                var popover = new bootstrap.Popover(bsPopover[index])
            }
        },

        onCheckandChangeSidebarActiveClass: function() {
            if (document.body.classList.contains('alt-menu')) {
                document.querySelector('.sidebar-wrapper li.menu.active [aria-expanded="true"]').setAttribute('aria-expanded', 'false');
            }
        },

        MaterialRippleEffect: function() {
            let getAllBtn = document.querySelectorAll('button.btn, a.btn');
            
            getAllBtn.forEach(btn => {    
                if (!btn.classList.contains('_no--effects')) {
                    btn.classList.add('_effect--ripple');
                }                
            });
    
            if (document.querySelector('._effect--ripple')) {
                Waves.attach('._effect--ripple', 'waves-light');
                Waves.init();
            }
        },
        functionalDropdown: function() {
            var getDropdownElement = document.querySelectorAll('.more-dropdown .dropdown-item');
            for (var i = 0; i < getDropdownElement.length; i++) {
                getDropdownElement[i].addEventListener('click', function() {
                    document.querySelectorAll('.more-dropdown .dropdown-toggle > span')[0].innerText = this.getAttribute('data-value');
                })
            }
        },
        EnableNavBarPopper: function() {
            window.bootstrap.Dropdown.prototype._detectNavbar = function(){ return false; };
        },        
        codeHighlighter: function() {
            if (document.querySelector('.snippet-container')) {
            
                var codeSnippetTab = document.querySelectorAll('.snippet-tab');
        
                function randomString(length, chars) {
                    var result = '';
                    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
                    return result;
                }
                
                var SnippetContainerInput = document.querySelectorAll('.snippet-collapsable > .snippet-collapse-trigger .switch .switch-input');
                var SnippetContainerLabel = document.querySelectorAll('.snippet-collapsable > .snippet-collapse-trigger .switch .switch-label');
        
                // Changing switch element ID and its lable for attribute dynamically 
                
                SnippetContainerInput.forEach((SInput,index) => {
                    
                    var _SnippetInput_ID = SInput.id
                    var _SnippetInput_Label = SnippetContainerLabel[index].getAttribute('for');
        
                    var _UniqueID = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
                    
                    SInput.id = _SnippetInput_ID + '-' + _UniqueID;
                    SnippetContainerLabel[index].setAttribute('for', _SnippetInput_Label + '-' + _UniqueID)
                    
                    // console.log(_SnippetInput_ID)
                    // console.log(_SnippetInput_Label)
                });
        
                // Changing switch element ID and its lable for attribute dynamically 
                    
        
                var codeSnippetTab = document.querySelectorAll('.snippet-tab');
        
                codeSnippetTab.forEach((codeSnippet, index) => {
        
                    var _GetCodeSnippet_DataTarget = codeSnippet.getAttribute('data-bs-target');
                    var _GetTabPane = document.querySelectorAll('.code-snippet .tab-pane');
                    var _GetTabPane_ID = _GetTabPane[index].id;
                    var _RandomId = randomString(7, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
                    var _GetClipbaordElement_Attribute = codeSnippet.getAttribute('data-clipboard-element');
        
                    // console.log(_RandomId)
                    // console.log(_GetClipbaordElement_Attribute)
        
                    var _GetSnippetClipboardCopyEl = codeSnippet.parentNode.parentNode.parentNode.querySelector(`.snippet-jsClipboard-btn .${_GetClipbaordElement_Attribute}`)
                    
                    // console.log(_GetSnippetClipboardCopyEl)
        
                    var _GetClipboardTarget_Attribute = _GetSnippetClipboardCopyEl.getAttribute('data-clipboard-target');
                    // Update Clipboard Target ID
                    _GetSnippetClipboardCopyEl.setAttribute('data-clipboard-target', _GetClipboardTarget_Attribute+'_'+_RandomId);
        
                    // console.log(_GetClipboardTarget_Attribute)
        
                    var _GetCodeSnippet_EL = codeSnippet.closest('.snippet-container').querySelector('.code-snippet')
        
                    // console.log(_GetCodeSnippet_EL)
        
                    var _TabPaneCodeElement = _GetCodeSnippet_EL.querySelector(_GetClipboardTarget_Attribute)
                    // Update Tab Pane Code ID
                    _TabPaneCodeElement.id = _GetClipboardTarget_Attribute.substring(1)+'_'+_RandomId;
                    // console.log(_TabPaneCodeElement)
                    
                    codeSnippet.setAttribute('data-bs-target', _GetCodeSnippet_DataTarget + '-' + _RandomId);
                    _GetTabPane[index].id = _GetCodeSnippet_DataTarget.substring(1) + '-' + _RandomId;
                    
                });
                
        
                for (let index = 0; index < codeSnippetTab.length; index++) {
                    codeSnippetTab[index].addEventListener('show.bs.tab', function (event) {
                        event.target // newly activated tab
                        event.relatedTarget // previous active tab
                        
                        getClipboardElementAttribute = event.target.getAttribute('data-clipboard-element');
                        getPreviousClipboardElementAttribute = event.relatedTarget.getAttribute('data-clipboard-element');
                        showClipboardElement = event.target.closest('.tab-container').querySelector(`.${getClipboardElementAttribute}`).classList.add('show')
                        hideClipboardElement = event.relatedTarget.closest('.tab-container').querySelector(`.${getPreviousClipboardElementAttribute}`).classList.remove('show')
                        
                    })
                }
        
                getCodeCollapsableBtn = document.querySelectorAll('.switch-input');
                        
                for (let index = 0; index < getCodeCollapsableBtn.length; index++) {
                    
                    getCodeCollapsableBtn[index].addEventListener('click', function() {
                        if (this.checked) {
                            this.closest('.snippet-container').classList.add('show');
                        } else {
                            this.closest('.snippet-container').classList.remove('show');
                        }
                        
                    })
                }
            }
            
            if (document.querySelector('.snippetClipboard')) {
                new ClipboardJS('.snippetClipboard');
            }
        },
        themeCustomizer: function() {
            setTimeout(() => {
                // let _getThemeCustomizer = document.querySelector('.theme-customizor-container');
                let _getThemeTrigger = document.querySelector('.theme-customizer-trigger');
                let _getThemeCustomizerOverlay = document.querySelector('.main-container .tc-overlay');
                
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
        },
        monochrome: function() {

            if (sessionStorage.getItem("_LayoutMonochrome") === null) {

                var _Monochrome = Settings._layout_monochrome;
         
                if (_Monochrome) {
                    document.body.classList.add('layout-theme-monochrome');
                    // document.body.setAttribute('data-rtl', 'true');
                } else {
                    document.body.classList.remove('layout-theme-monochrome');
                    // document.body.removeAttribute('data-rtl');
                }

                sessionStorage.setItem('_LayoutMonochrome', _Monochrome);

                return _core_Monochrome_ = _Monochrome;

            } else {

                var _Monochrome = Settings._layout_monochrome;

                let _get_Layout_Monochrome = sessionStorage.getItem('_LayoutMonochrome');
                let _convertToParse_Monochrome = JSON.parse(_get_Layout_Monochrome)
         
                if (_convertToParse_Monochrome) {
                    document.body.classList.add('layout-theme-monochrome');
                    // document.body.setAttribute('data-rtl', 'true');
                } else {
                    document.body.classList.remove('layout-theme-monochrome');
                    // document.body.removeAttribute('data-rtl');
                }

                // sessionStorage.setItem('_LayoutMonochrome', _Monochrome);

                return _core_Monochrome_ = _convertToParse_Monochrome;
                
            }
            
            
        },
        boxed: function() {

            // sessionStorage.getItem("username");

            // console.log(sessionStorage.getItem("username"))
            
            if (sessionStorage.getItem("_LayoutBoxed") === null) {                
                var _Boxed = Settings._layout_boxed;

                if (_Boxed) {
                    if (document.body.getAttribute('layout') !== 'full-width') {
                        document.body.classList.add('layout-boxed');
                        if (document.querySelector('.header-container')) {
                            // document.querySelector('.header-container').classList.add('container-xxl');
                        }
                        if (document.querySelector('.middle-content')) {
                            document.querySelector('.middle-content').classList.add('container-xxl');
                        }
                    } else {
                        document.body.classList.remove('layout-boxed');
                        if (document.querySelector('.header-container')) {
                            document.querySelector('.header-container').classList.remove('container-xxl');
                        }
                        if (document.querySelector('.middle-content')) {
                            document.querySelector('.middle-content').classList.remove('container-xxl');
                        }
                    }
                } else {
                    document.body.classList.remove('layout-boxed');
                    if (document.querySelector('.header-container')) {
                        document.querySelector('.header-container').classList.remove('container-xxl');
                    }
                    if (document.querySelector('.middle-content')) {
                        document.querySelector('.middle-content').classList.remove('container-xxl');
                    }

                    // if (document.body.getAttribute('layout') !== 'boxed') {
                    //     document.body.classList.remove('layout-boxed');
                    //     if (document.querySelector('.header-container')) {
                    //         document.querySelector('.header-container').classList.remove('container-xxl');
                    //     }
                    //     if (document.querySelector('.middle-content')) {
                    //         document.querySelector('.middle-content').classList.remove('container-xxl');
                    //     }
                    // } else {
                    //     document.body.classList.add('layout-boxed');
                    //     if (document.querySelector('.header-container')) {
                    //         // document.querySelector('.header-container').classList.add('container-xxl');
                    //     }
                    //     if (document.querySelector('.middle-content')) {
                    //         document.querySelector('.middle-content').classList.add('container-xxl');
                    //     }
                    // }
                    
                }
                
                sessionStorage.setItem('_LayoutBoxed', _Boxed);

                return _core_Boxed_ = _Boxed;
            } else {                
                let _get_Layout_Boxed = sessionStorage.getItem('_LayoutBoxed');
                let _convertToParse = JSON.parse(_get_Layout_Boxed)

                if (_convertToParse) {
                    if (document.body.getAttribute('layout') !== 'full-width') {
                        document.body.classList.add('layout-boxed');
                        if (document.querySelector('.header-container')) {
                            // document.querySelector('.header-container').classList.add('container-xxl');
                        }
                        if (document.querySelector('.middle-content')) {
                            document.querySelector('.middle-content').classList.add('container-xxl');
                        }
                    } else {
                        document.body.classList.remove('layout-boxed');
                        if (document.querySelector('.header-container')) {
                            document.querySelector('.header-container').classList.remove('container-xxl');
                        }
                        if (document.querySelector('.middle-content')) {
                            document.querySelector('.middle-content').classList.remove('container-xxl');
                        }
                    }
                } else {
                    document.body.classList.remove('layout-boxed');
                    if (document.querySelector('.header-container')) {
                        document.querySelector('.header-container').classList.remove('container-xxl');
                    }
                    if (document.querySelector('.middle-content')) {
                        document.querySelector('.middle-content').classList.remove('container-xxl');
                    }

                    // if (document.body.getAttribute('layout') !== 'boxed') {
                    //     document.body.classList.remove('layout-boxed');
                    //     if (document.querySelector('.header-container')) {
                    //         document.querySelector('.header-container').classList.remove('container-xxl');
                    //     }
                    //     if (document.querySelector('.middle-content')) {
                    //         document.querySelector('.middle-content').classList.remove('container-xxl');
                    //     }
                    // } else {
                    //     document.body.classList.add('layout-boxed');
                    //     if (document.querySelector('.header-container')) {
                    //         // document.querySelector('.header-container').classList.add('container-xxl');
                    //     }
                    //     if (document.querySelector('.middle-content')) {
                    //         document.querySelector('.middle-content').classList.add('container-xxl');
                    //     }
                    // }
                    
                }
                return _core_Boxed_ = _convertToParse;
            }

            // return _core_Monochrome_ = _Boxed;
            
        },
        mode: function() {
            if (sessionStorage.getItem("_LayoutDark") === null) {                
                var _DarkMode = Settings._layout_darkMode;

                if (_DarkMode) {
                    document.body.classList.add('dark');
                    // document.body.setAttribute('data-rtl', 'true');
                    // document.querySelector('.navbar-logo').setAttribute('src', Settings._layout_logo_dark)
                } else {
                    document.body.classList.remove('dark');
                    // document.body.setAttribute('data-rtl', 'true');
                    // document.querySelector('.navbar-logo').setAttribute('src', Settings._layout_logo_light)
                }
                
                sessionStorage.setItem('_LayoutDark', _DarkMode);

                return _core_DarkMode_ = _DarkMode;
            } else {                
                let _get_Layout_DarkMode = sessionStorage.getItem('_LayoutDark');
                let _convertToParse = JSON.parse(_get_Layout_DarkMode)

                if (_convertToParse) {
                    document.body.classList.add('dark');
                    // document.body.setAttribute('data-rtl', 'true');
                    // document.querySelector('.navbar-logo').setAttribute('src', Settings._layout_logo_dark)
                } else {
                    document.body.classList.remove('dark');
                    // document.body.setAttribute('data-rtl', 'true');
                    // document.querySelector('.navbar-logo').setAttribute('src', Settings._layout_logo_light)                    
                }

                return _core_DarkMode_ = _convertToParse;
            }
            
            
        },

        // Functionlaity used to search when the modal is open

        SearchFunctionality: function() {
            const searchInput = document.getElementById('searchInput');
        
            searchInput.addEventListener('input', function () {
                
                const query = this.value.toLowerCase().trim();
        
                // Get all search-list-items inside .search-list
                const listItems = document.querySelectorAll('.searchable-list-content .searchable-list .search-list-item');
        
                listItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                // Show or hide based on match
                if (text.includes(query)) {
                    // item.style.display = 'flex'; // or 'block' if you remove d-flex
                    document.querySelector('.search-content .search-row-one').style.display = "flex"
                    document.querySelector('.search-content .search-row-two').style.display = "none"
                    document.querySelector('.modal-search-container .search-content').style.padding = "65px"
                    item.setAttribute('style', 'display:flex !important');
                } else {
                    // item.style.display = 'none';
                    document.querySelector('.search-content .search-row-one').style.display = "none"
                    document.querySelector('.search-content .search-row-two').style.display = "flex"
                    document.querySelector('.modal-search-container .search-content').style.padding = "25px"
                    item.setAttribute('style', 'display:none !important');
                }
                });
            });
        },
        
        dynaicFooterDate : function() {
            document.querySelector(".dynamic-year").textContent = new Date().getFullYear();
        }
        
    }

    var _mobileResolution = {
        onRefresh: function() {
            var windowWidth = window.innerWidth;
            if ( windowWidth <= MediaSize.md ) {
                categoryScroll.scrollCat();
                toggleFunction.sidebar();
            }
        },
        
        onResize: function() {
            window.addEventListener('resize', function(event) {
                event.preventDefault();
                var windowWidth = window.innerWidth;
                if ( windowWidth <= MediaSize.md ) {
                    toggleFunction.offToggleSidebarSubmenu();
                }
            });
        }
        
    }

    var _desktopResolution = {
        onRefresh: function() {
            var windowWidth = window.innerWidth;
            if ( windowWidth > MediaSize.md ) {
                categoryScroll.scrollCat();
                toggleFunction.sidebar();
                toggleFunction.onToggleSidebarSubmenu();
            }
        },
        
        onResize: function() {
            window.addEventListener('resize', function(event) {
                event.preventDefault();
                var windowWidth = window.innerWidth;
                if ( windowWidth > MediaSize.md ) {
                    toggleFunction.onToggleSidebarSubmenu();
                }
            });
        }
        
    }

    function sidebarFunctionality() {
        function sidebarCloser() {

            if (window.innerWidth <= 991 ) {

                if (!document.querySelector('body').classList.contains('alt-menu')) {
                    Dom.id.container.classList.add("sidebar-closed");
                    Dom.class.overlay.classList.remove('show');
                    // console.log('sdfsf')
                    sessionStorage.setItem('_LayoutAltMenu', false);
                } else {
                    // console.log('111')
                    sessionStorage.setItem('_LayoutAltMenu', true);
                    Dom.class.navbar.classList.remove("expand-header");
                    Dom.class.overlay.classList.remove('show');
                    Dom.id.container.classList.remove('sbar-open');
                    Dom.main.classList.remove('sidebar-noneoverflow');
                }

                // sessionStorage.setItem('_LayoutAltMenu', _DarkMode);

                // if (!Settings._layout_altMenu) {
                //     document.body.classList.remove('alt-menu');
                //     Dom.id.container.classList.add("sidebar-closed");
                //     Dom.class.overlay.classList.remove('show');
                // } else {
                //     document.body.classList.add('alt-menu');
                //     Dom.class.navbar.classList.remove("expand-header");
                //     Dom.class.overlay.classList.remove('show');
                //     Dom.id.container.classList.remove('sbar-open');
                //     Dom.main.classList.remove('sidebar-noneoverflow');
                // }

            } else if (window.innerWidth > 991 ) {

                // if (!Settings._layout_altMenu) {

                //     document.body.classList.remove('alt-menu');
                //     Dom.id.container.classList.remove("sidebar-closed");
                //     Dom.class.navbar.classList.remove("expand-header");
                //     Dom.class.overlay.classList.remove('show');
                //     Dom.id.container.classList.remove('sbar-open');
                //     Dom.main.classList.remove('sidebar-noneoverflow');
                // } else {
                //     document.body.classList.add('alt-menu');
                //     Dom.main.classList.add('sidebar-noneoverflow');
                //     Dom.id.container.classList.add("sidebar-closed");
                //     Dom.class.navbar.classList.add("expand-header");
                //     Dom.class.overlay.classList.add('show');
                //     Dom.id.container.classList.add('sbar-open');
                //     document.querySelector('.sidebar-wrapper [aria-expanded="true"]').parentNode.querySelector('.collapse').classList.remove('show');
                // }

                if (!document.querySelector('body').classList.contains('alt-menu')) {
                    // console.log('sdfsf')
                    Dom.id.container.classList.remove("sidebar-closed");
                    Dom.class.navbar.classList.remove("expand-header");
                    Dom.class.overlay.classList.remove('show');
                    Dom.id.container.classList.remove('sbar-open');
                    Dom.main.classList.remove('sidebar-noneoverflow');
                    sessionStorage.setItem('_LayoutAltMenu', false);
                } else {
                    // console.log('111')
                    sessionStorage.setItem('_LayoutAltMenu', true);
                    Dom.main.classList.add('sidebar-noneoverflow');
                    Dom.id.container.classList.add("sidebar-closed");
                    Dom.class.navbar.classList.add("expand-header");
                    Dom.class.overlay.classList.add('show');
                    Dom.id.container.classList.add('sbar-open');
                    document.querySelector('.sidebar-wrapper [aria-expanded="true"]').parentNode.querySelector('.collapse').classList.remove('show');
                }
            }
        }

        function sidebarMobCheck() {
            if (window.innerWidth <= 991 ) {

                if ( document.querySelector('.main-container').classList.contains('sbar-open') ) {
                    return;
                } else {
                    sidebarCloser()
                }
            } else if (window.innerWidth > 991 ) {
                sidebarCloser();
            }
        }

        sidebarCloser();

        window.addEventListener('resize', function(event) {
            sidebarMobCheck();
        });

    }

    return {
        init: function(Layout) {
            toggleFunction.overlay();
            toggleFunction.search();
            toggleFunction.themeToggle(Layout);
            toggleFunction.profileSidebar();
            toggleFunction.profileSidebarClose();
            
            /*
                Desktop Resoltion fn
            */
            _desktopResolution.onRefresh();
            _desktopResolution.onResize();

            /*
                Mobile Resoltion fn
            */
            _mobileResolution.onRefresh();
            _mobileResolution.onResize();

            sidebarFunctionality();

            /*
                In Built Functionality fn
            */
            inBuiltfunctionality.themeColor();
            inBuiltfunctionality.setLayoutName();
            inBuiltfunctionality.mainCatActivateScroll();
            inBuiltfunctionality.profileScroll();
            inBuiltfunctionality.notificationScroll();
            inBuiltfunctionality.messageScroll();
            inBuiltfunctionality.preventScrollBody();
            inBuiltfunctionality.searchKeyBind();
            inBuiltfunctionality.bsTooltip();
            inBuiltfunctionality.bsPopover();
            inBuiltfunctionality.onCheckandChangeSidebarActiveClass();
            inBuiltfunctionality.MaterialRippleEffect();
            inBuiltfunctionality.functionalDropdown();
            inBuiltfunctionality.EnableNavBarPopper();
            inBuiltfunctionality.codeHighlighter();
            inBuiltfunctionality.themeCustomizer();

            inBuiltfunctionality.monochrome();
            inBuiltfunctionality.boxed();
            inBuiltfunctionality.mode();
            inBuiltfunctionality.SearchFunctionality();
            inBuiltfunctionality.dynaicFooterDate();

        }
    }

}();

window.addEventListener('DOMContentLoaded', function() {
    CORKUI.init('layout');
})