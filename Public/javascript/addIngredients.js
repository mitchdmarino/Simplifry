const addButton = document.querySelector('#addButton')


function addIngredient () {
    const container = document.querySelector('#ingredientContainer')
    console.log('function is running')
    
    container.innerHTML += 
    "<label for='ingredientName'>ingrname</label><input name='ingredientName' id='ingredientName' type='text'></br><label for='ingredientMeasure'>measure</label><input name='ingredientMeasure' id='ingredientMeasure' type='text'></br><label for='ingredientQuantity'>quantity</label><input name='ingredientQuantity' id='ingredientQuantity' type='text'></br>"
}

addButton.addEventListener('click', addIngredient)


