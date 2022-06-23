const addTagButton = document.querySelector('#addTagButton')
const addTagForm = document.querySelector('#addTagForm')

let hidden = true 
addTagButton.addEventListener('click', () => {
    if (hidden) {
        addTagForm.classList.remove('hidden')
        hidden = false
    } else {
        addTagForm.classList.add('hidden')
        hidden = true
    }
})