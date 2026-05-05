/**
 * @function CHAT_UI
 * 
 * @param {object} options
 * 
 */

const CHAT_UI = function(options) {

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
   * @function ActivateMSGList
   * @param {  } options
   */
  this.ActivateMSGList = function() {

      let _getAllChatList = document.querySelectorAll('.user-list-box .person');
      
      _getAllChatList.forEach(chatList => {
          
          chatList.addEventListener('click', function() {
              
              let __GetCurrentElement = this;
              
              let _JSON_ = JSON.parse(__GetCurrentElement.dataset.chatInfo);

              let _getActiveContact = document.querySelector('.user-list-box .person.active');
        
              
              if (_getActiveContact) {
                  document.querySelector('.user-list-box .person.active').classList.remove('active')
              }
              
              
              Dom._class.chatboxContent.initialScreenEl.style.display = 'none';
              Dom._class.chatboxContent.OnSelectMetaUserEl.classList.add('chat-active');
              Dom._class.chatboxContent.OnSelectChatFooterEl.classList.add('chat-active');
              
              __GetCurrentElement.classList.add('active')


              if (_JSON_.profile) {
                  Dom._class.chatboxContent.acUserImageEl.style.display = 'inline-block';
                  Dom._class.chatboxContent.acUserInitialsEl.style.display = 'none';
                  Dom._class.chatboxContent.acUserImageEl.src = `../src/assets/img/profile/${_JSON_.profileImage}`;

                  if (_JSON_.status === 'online') {
                      Dom._class.chatboxContent.acUserImageEl.parentNode.classList.add('avatar-indicators');
                      Dom._class.chatboxContent.acUserImageEl.parentNode.classList.add('avatar-online');
                      Dom._class.chatboxContent.acUserImageEl.parentNode.classList.remove('avatar-offline');
                  } else if (_JSON_.status === 'offline') {
                      Dom._class.chatboxContent.acUserImageEl.parentNode.classList.add('avatar-indicators');
                      Dom._class.chatboxContent.acUserImageEl.parentNode.classList.add('avatar-offline');
                      Dom._class.chatboxContent.acUserImageEl.parentNode.classList.remove('avatar-online');
                  } else if (_JSON_.status === 'not-available') {
                      Dom._class.chatboxContent.acUserImageEl.parentNode.classList.remove('avatar-indicators');
                      Dom._class.chatboxContent.acUserImageEl.parentNode.classList.remove('avatar-online');
                      Dom._class.chatboxContent.acUserImageEl.parentNode.classList.remove('avatar-offline');
                  }
                  
                  
              } else {
                  Dom._class.chatboxContent.acUserInitialsEl.style.display = 'flex';
                  Dom._class.chatboxContent.acUserImageEl.style.display = 'none';
                  Dom._class.chatboxContent.acUserInitialsEl.innerText = _JSON_.firstName.charAt(0) + _JSON_.lastName.charAt(0);
              }
              Dom._class.chatboxContent.acUserNameEl.innerText = _JSON_.firstName + ' ' + _JSON_.lastName;
              Dom._class.chatboxContent.acUserOccupationEl.innerText = _JSON_.occupation;


              /**
               * 
               *  Trigger the Active Chat window
               * 
               */
                  document.querySelector('.chat-conversation-box-scroll .chat').classList.add('active-chat')
              

              document.querySelector('.chat-box .chat-box-inner').style.height = '100%';
              
              const chatBoxScroll = new PerfectScrollbar('.chat-conversation-box', {
                  // suppressScrollX : true
              });

              document.querySelector('.user-list-box').classList.remove('user-list-box-show');
              document.querySelector('.chatoverlay').classList.remove('show');
              
          })
      });

      
  }

  /**
   * @function Base
   * @param {  } options
   */
  this.MessageInput = function() {

      document.querySelector('.chat-msg-input').addEventListener('keydown', function(e) {
          if(e.key === 'Enter') {
              let chatInput = this;
              let chatMessageValue = chatInput.value;
              
              if (chatMessageValue === '') { return; }
              $messageHtml = `<div class="msg">
                  <div class="msg-content outgoing">
                      ${chatMessageValue}
                  </div>
                  <div class="msg-timestamp outgoing">
                  ${dayjs().format('hh')}:${dayjs().format('mm')} ${dayjs().format('a')}
                  </div>
              </div>`;
              
              let appendMessage = this.closest('.chat-system').querySelector('.active-chat').insertAdjacentHTML('beforeend', $messageHtml);
              
              const getScrollContainer = document.querySelector('.chat-conversation-box');


              
              getScrollContainer.scrollTop = getScrollContainer.scrollHeight;
              let clearChatInput = chatInput.value = '';
          }
      })
  }


  /**
   * @function ContactListScroll
   * @param { } option
   */    
  this.ContactListScroll = function() {
      const contactListScroll = new PerfectScrollbar('.people', {
          suppressScrollX : true
      });
          
  }

  /**
   * @function ToggleContactList
   * @param { } option
   * @info - this function is for mobile view
   */    
  this.ToggleContactList = function() {

      let _hamburger = document.querySelector('.hamburger');
      let _chatoverlay =  document.querySelector('.chatoverlay');
      let _userListBox = document.querySelector('.user-list-box')

      _hamburger.addEventListener('click', function() {
          _userListBox.classList.toggle('user-list-box-show');
          _chatoverlay.classList.toggle('show');
      })

      _chatoverlay.addEventListener('click', function() {
          this.classList.remove('show');
          _userListBox.classList.remove('user-list-box-show');
      })



  }


  /**
   * @function SearchContact
   * @param { } option
   * @info - this function is for mobile view
   */    
   this.SearchContact = function() {

          // Declare variables
      // var input, filter, ul, li, a, i, txtValue;
      contactSearchInput = document.querySelector('.contact-search-input');

      contactSearchInput.addEventListener('keyup', function() {

          let input = this.value; 
          input=input.toLowerCase();
          
          let activeChats = document.querySelector('.active-chats');
          let contacts_list = document.querySelector('.contacts-list');
          
          let activeChatsList = activeChats.querySelectorAll('.person');
          let contactsChatList = contacts_list.querySelectorAll('.person');

          // Check inside all active users
          
          for (i = 0; i < activeChatsList.length; i++) { 
              if (!activeChatsList[i].innerHTML.toLowerCase().includes(input)) {
                  activeChatsList[i].style.display="none";
                  activeChatsList[i].classList.add('result-item');
              } else {
                  activeChatsList[i].style.display="inline-block";
                  activeChatsList[i].classList.remove('result-item');
              }
          }
          
          
          // Check inside all non active user
          for (i = 0; i < contactsChatList.length; i++) {    
              if (!contactsChatList[i].innerHTML.toLowerCase().includes(input)) {
                  contactsChatList[i].style.display="none";
                  contactsChatList[i].classList.add('result-item');                    
              } else {
                  contactsChatList[i].style.display="inline-block";
                  contactsChatList[i].classList.remove('result-item');
              }
          }

          activeChatsList.forEach((el, i) => {

              if (el.classList.contains('result-item')) {

                  let activeChats_update = document.querySelector('.active-chats').querySelectorAll('.result-item');

                  if (activeChatsList.length === activeChats_update.length) {
                      console.log('both are hidden display the msg');
                      activeChats.querySelector('.no-results').style.display = 'block';
                  } else {
                      console.log('one is hidden or none is hidden remove the msg');
                      activeChats.querySelector('.no-results').style.display = 'none';
                  }
              } else {
                  activeChats.querySelector('.no-results').style.display = 'none';
              }
          })

          contactsChatList.forEach((el, i) => {
              
              if (el.classList.contains('result-item')) {

                  let contactsChatList_update = document.querySelector('.contacts-list').querySelectorAll('.result-item');

                  if (contactsChatList.length === contactsChatList_update.length) {
                      console.log('both are hidden display the msg');
                      contacts_list.querySelector('.no-results').style.display = 'block';
                  } else {
                      console.log('one is hidden or none is hidden remove the msg');
                      contacts_list.querySelector('.no-results').style.display = 'none';
                  }
              } else {
                  contacts_list.querySelector('.no-results').style.display = 'none';
              }
          })

      })
      

  }


  /**
   * @function ChatProfile
   * @param { } option
   * @info - this function is for mobile view
   */
  this.ChatProfile = function() {
      
      let sbar_toggle = document.querySelector('.chat-profile-info-sidebar-toggle');

      let profileSidebar = document.querySelector('.chat-profile-info-sidebar')

      let profileSidebarOverlay = document.querySelector('.chatoverlay')
      
      sbar_toggle.addEventListener('click', function() {

          profileSidebar.classList.toggle('show');
          profileSidebarOverlay.classList.toggle('show');

      })

      profileSidebarOverlay.addEventListener('click', function() {
          this.classList.remove('show');
          profileSidebar.classList.remove('show');
      })

  }


  /**
   * @function ChatProfileSidebar
   * @param { } option
   * @info - this function is for mobile view
   */
    this.ChatProfileSidebar = function() {

        themeCustomizerScroll = new PerfectScrollbar('.app-chat-scroll', {
            wheelSpeed:.5,
            swipeEasing:!0,
            minScrollbarLength:40,
            maxScrollbarLength:300,
            suppressScrollX : true
        });    

    }



  /**
   * @access Init Functions
   * @param
   * @functions 
   */

  this.MessageInput();
  this.ActivateMSGList();
  this.ContactListScroll();
  this.ToggleContactList();
  this.SearchContact();
  this.ChatProfile();
  this.ChatProfileSidebar();
  
}

/**
*  @access CHAT_UI()
*/

let chat_UI = new CHAT_UI();