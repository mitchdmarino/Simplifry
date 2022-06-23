const categoryForm = document.querySelector('#createCat')
const addButton = document.querySelector('#createCategory')
let hidden = true 
addButton.addEventListener('click', () => {
    if (hidden) {
        categoryForm.classList.remove('hidden')
        hidden = false
    } else {
        categoryForm.classList.add('hidden')
        hidden = true
    }
})