









/**
 * @function GPT_AI
 * 
 * @param {object} options
 * 
 */

const GPT_AI = function(options) {

    let OPTIONS = {

    }
  
    // console.log(OPTIONS._Menu)
  
    let Dom = {
        _el: {
        },
        _id: {
            
        },
        _class: {
            chatboxContent: {
                initialScreenEl: document.querySelector('.chat-not-selected'),
                OnSelectMetaUserEl: document.querySelector('.chat-box-inner .chat-meta-user'),
                OnSelectChatFooterEl: document.querySelector('.chat-box-inner .chat-footer'),
                acUserImageEl: document.querySelector('.ac_user-image .avatar img'),
                acUserInitialsEl: document.querySelector('.ac_user-image .avatar .avatar-title'),
                acUserNameEl: document.querySelector('.ac_user-name .name'),
                acUserOccupationEl: document.querySelector('.ac_user-name .occupation'),
            }
        }
    }
  
    let Locations = {
        _assets: '../src/assets/',
        _plugins: '../src/plugins/',
    }
  
    this.Components = function() {
        return _components = {
            Dom,
            Locations
        };
    }
  
  
    /**
     * @function SidebarClose
     * @param {  } options
     */
    this.SidebarClose = function() {
        document.querySelector('.gpt-sidebar-close').addEventListener('click', function() {
            document.body.classList.remove('chatbot-sidebar-show')
        })
    }



    /**
     * @function SidebarOpen
     * @param {  } options
     */
    this.SidebarOpen = function() {
        document.querySelector('.gpt-sidebar-open').addEventListener('click', function() {
            document.body.classList.add('chatbot-sidebar-show')
        })
    }



    /**
     * @function overlayDismiss
     * @param {  } options
     */

    this.overlayDismiss = function() {
        document.querySelector('.chatbot-overlay').addEventListener('click', function() {
            document.body.classList.remove('chatbot-sidebar-show')
        })
    }
    

    
    /**
     * @function copyClipBoard
     * @param {  } options
     */
    this.copyClipBoard = function() {
        new ClipboardJS('.jsclipboard');
    },

    
    
    /**
     * @function SidebarScroll
     * @param {  } options
     */
    this.SidebarScroll = function() {
        const gptListScroll = new PerfectScrollbar('.chatbot-list-scrollable', {
            suppressScrollX : true
        });
    }


    /**
     * @function gtpChatScroll
     * @param {  } options
     */

    this.gtpChatScroll = function() {
        const gtpChatScroll = new PerfectScrollbar('.chatbot-conversation', {
            suppressScrollX : true
        });
    }



    /**
     * @function gptSearchFunctionality
     * @param {  } options
     */

    this.gptSearchFunctionality = function() {
        // const searchInput = document.getElementById('gpt-searchInput');
    
        // searchInput.addEventListener('input', function () {
            
        //     const query = this.value.toLowerCase().trim();
    
        //     // Get all search-list-items inside .search-list
        //     const listItems = document.querySelectorAll('.gpt-searchable-list-content .searchable-list .search-list-item');
    
        //     listItems.forEach(item => {
        //     const text = item.textContent.toLowerCase();
        //     // Show or hide based on match
        //     if (text.includes(query)) {
        //         // item.style.display = 'flex'; // or 'block' if you remove d-flex
        //         document.querySelector('.gpt-search-content .search-row-one').style.display = "flex"
        //         document.querySelector('.gpt-search-content .search-row-two').style.display = "none"
        //         // document.querySelector('.gpt-modal-search-container .gpt-search-content').style.padding = "65px"
        //         item.setAttribute('style', 'display:flex !important');
        //         // item.setAttribute('style', 'display:none !important');
        //     } else {
        //         // item.style.display = 'none';
        //         document.querySelector('.gpt-search-content .search-row-one').style.display = "none"
        //         document.querySelector('.gpt-search-content .search-row-two').style.display = "flex"
        //         // document.querySelector('.gpt-modal-search-container .gpt-search-content').style.padding = "25px"
        //         item.setAttribute('style', 'display:none !important');
        //         // item.setAttribute('style', 'display:flex !important');
        //     }
        //     });
        // });


        const searchInput = document.getElementById('gpt-searchInput');

        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase().trim();
            const searchRowOne = document.querySelector('.gpt-search-content .search-row-one');
            const searchRowTwo = document.querySelector('.gpt-search-content .search-row-two');
            const listItems = document.querySelectorAll('.gpt-searchable-list-content .search-list-item');

            let hasMatch = false;

            listItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.style.display = 'flex';
                    hasMatch = true;
                } else {
                    item.style.display = 'none';
                }
            });

            if (query && hasMatch) {
                searchRowOne.style.display = 'none';
                searchRowTwo.style.display = 'flex';
            } else {
                searchRowOne.style.display = 'flex';
                searchRowTwo.style.display = 'none';
            }
        });

        
    }
    
    
    

    
    /**
     * @function windowResize
     * @param {  } options
     */

    this.windowResize_Refresh = function() {
        // const gtpChatScroll = new PerfectScrollbar('.chatbot-conversation', {
        //     suppressScrollX : true
        // });

        function enableDisableSidebar() {
            if (window.innerWidth < 1200) {

                document.body.classList.remove("chatbot-sidebar-show");
                
            } else {
                document.body.classList.add("chatbot-sidebar-show");
                
            }
        }
        
        enableDisableSidebar();

        window.addEventListener("resize", () => {
            enableDisableSidebar();            
        });
    }
  

  
  
    /**
     * @access Init Functions
     * @param
     * @functions 
     */
  
    // this.MessageInput();
    this.SidebarClose();
    this.SidebarOpen();
    this.SidebarScroll();
    this.gtpChatScroll();
    this.gptSearchFunctionality();
    this.overlayDismiss();
    this.copyClipBoard();
    this.windowResize_Refresh();
    // this.ContactListScroll();
    // this.ToggleContactList();
    // this.SearchContact();
    // this.ChatProfile();
    // this.ChatProfileSidebar();
    
  }
  
  /**
  *  @access GPT_AI()
  */
  
  let gpt_ai = new GPT_AI();