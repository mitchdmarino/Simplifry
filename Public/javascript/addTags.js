const addTagButton = document.querySelector('#addTagButton')
const addTagForm = document.querySelector('#addTagForm')
    addTagButton.addEventListener('click', () => {
        addTagForm.classList.remove('hidden')
        addTagButton.classList.add('hidden')
    })