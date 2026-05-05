const faqCollapseContent = document.querySelectorAll('.faqCollapseContent')

faqCollapseContent.forEach(element => {
    
    element.addEventListener('hide.bs.collapse', event => {
        element.closest('.card').classList.remove('shown');      
    })
    
    element.addEventListener('show.bs.collapse', event => {
        element.closest('.card').classList.add('shown');    
    })
});
