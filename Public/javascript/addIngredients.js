const ingredientForm = document.querySelector('#add-ingredient')
const addButton = document.querySelector('#addIngredient')
let hidden = true 
addButton.addEventListener('click', () => {
    if (hidden) {
        ingredientForm.classList.remove('hidden')
        hidden = false
    } else {
        ingredientForm.classList.add('hidden')
        hidden = true
    }
})