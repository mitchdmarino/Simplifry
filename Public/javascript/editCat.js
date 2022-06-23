const editForm = document.querySelector('#editCat')
const editButton = document.querySelector('#editCatButton')


let hidden = true 
editButton.addEventListener('click', () => {
    if (hidden) {
        editForm.classList.remove('hidden')
        hidden = false
    } else {
        editForm.classList.add('hidden')
        hidden = true
    }
})
