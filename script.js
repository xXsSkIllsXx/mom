document.addEventListener('DOMContentLoaded', () => {
    const originalYieldAmountInput = document.getElementById('originalYieldAmount');
    const originalYieldUnitSelect = document.getElementById('originalYieldUnit');
    const desiredYieldAmountInput = document.getElementById('desiredYieldAmount');
    const desiredYieldUnitSelect = document.getElementById('desiredYieldUnit');
    const addIngredientBtn = document.getElementById('addIngredient');
    const calculateBtn = document.getElementById('calculateBtn');
    const originalIngredientsDiv = document.getElementById('originalIngredients');
    const scaledIngredientsDiv = document.getElementById('scaledIngredients');

    const commonUnits = [
        'kg', 'g', 'mg',
        'liter', 'ml', 'cl',
        'cups', 'tbsp', 'tsp',
        'glasses', 'servings', 'items', 'pieces', 'units', 'dashes', 'pinches',
        'cloves', 'sprigs', 'leaves', 'slices', 'cans', 'packs', 'bottles', 'drops',
        'oz', 'lb', 'fl oz', 'pint', 'quart', 'gallon'
    ];

    let ingredientCounter = 0; // To give unique IDs to each ingredient row

    // Function to add a new ingredient input row
    const addIngredientRow = (initialName = '', initialAmount = '', initialUnit = 'g') => {
        ingredientCounter++;
        const ingredientRow = document.createElement('div');
        ingredientRow.className = 'ingredient-row';
        ingredientRow.dataset.id = ingredientCounter; // Unique ID for removal

        ingredientRow.innerHTML = `
            <input type="text" class="ingredient-name-input" placeholder="Ingredient Name" value="<span class="math-inline">\{initialName\}"\>
            <input type="number" class="ingredient-amount-input" placeholder="Amount" value="{initialAmount}" min="0.01" step="0.01">
<select class="ingredient-unit-select">
${commonUnits.map(unit => <option value="${unit}" ${unit === initialUnit ? 'selected' : ''}>${unit}</option>).join('')}
<option value="none" ${initialUnit === 'none' ? 'selected' : ''}>No Unit (e.g., eggs)</option>
</select>
<button type="button" class="remove-ingredient-btn">Remove</button>
`;
       originalIngredientsDiv.appendChild(ingredientRow);

        // Add event listener to the newly created remove button
        ingredientRow.querySelector('.remove-ingredient-btn').addEventListener('click', (event) => {
            event.target.closest('.ingredient-row').remove();
            // Optionally, recalculate if inputs change for a more reactive feel
            // calculateScaledIngredients();
        });
    };

    // Initialize with one empty ingredient row on load
    addIngredientRow();

    // Event listener for "Add Ingredient" button
    addIngredientBtn.addEventListener('click', () => addIngredientRow());

    // Function to perform the scaling calculation
    const calculateScaledIngredients = () => {
        scaledIngredientsDiv.innerHTML = ''; // Clear previous results

        const originalYieldAmount = parseFloat(originalYieldAmountInput.value);
        const originalYieldUnit = originalYieldUnitSelect.value;
        const desiredYieldAmount = parseFloat(desiredYieldAmountInput.value);
        const desiredYieldUnit = desiredYieldUnitSelect.value;

        // Basic validation
        if (isNaN(originalYieldAmount) || originalYieldAmount <= 0) {
            scaledIngredientsDiv.innerHTML = '<p style="color: #dc3545;">Please enter a valid positive number for Original Recipe Yield.</p>';
            return;
        }
        if (isNaN(desiredYieldAmount) || desiredYieldAmount <= 0) {
            scaledIngredientsDiv.innerHTML = '<p style="color: #dc3545;">Please enter a valid positive number for Desired Amount.</p>';
            return;
        }

        // Check if original and desired units match for a simple ratio
        if (originalYieldUnit !== desiredYieldUnit) {
            scaledIngredientsDiv.innerHTML = `<p style="color: #ffc107;">
                Warning: Original recipe yield unit (<span class="math-inline">\{originalYieldUnit\}\) and desired amount unit \(</span>{desiredYieldUnit}) do not match.
                The calculation will proceed based on a simple numerical ratio, assuming equivalent conversion factors.
                For precise results, ensure units are consistent or convert them manually.
            </p>`;
        }

        const scalingFactor = desiredYieldAmount / originalYieldAmount;

        const ingredients = [];
        document.querySelectorAll('.ingredient-row').forEach(row => {
            const nameInput = row.querySelector('.ingredient-name-input');
            const amountInput = row.querySelector('.ingredient-amount-input');
            const unitSelect = row.querySelector('.ingredient-unit-select');

            const name = nameInput.value.trim();
            const amount = parseFloat(amountInput.value);
            const unit = unitSelect.value;

            if (name && !isNaN(amount) && amount > 0) {
                ingredients.push({ name, amount, unit });
            } else if (name || !isNaN(amount)) { // Warn for incomplete rows
                console.warn(`Skipping incomplete ingredient row: Name: "${name}", Amount: <span class="math-inline">\{amount\}, Unit\: "</span>{unit}"`);
            }
        });

        if (ingredients.length === 0) {
            scaledIngredientsDiv.innerHTML = '<p>Please add at least one ingredient to calculate.</p>';
            return;
        }

        const scaledList = document.createElement('ul');
        ingredients.forEach(ingredient => {
            const scaledAmount = ingredient.amount * scalingFactor;
            const formattedScaledAmount = parseFloat(scaledAmount.toFixed(4)); // Limit decimals

            const listItem = document.createElement('li');
            if (ingredient.unit === 'none') {
                listItem.innerHTML = `<strong>${ingredient.name}:</strong> ${formattedScaledAmount} (no unit)`;
            } else {
                listItem.innerHTML = `<strong>${ingredient.name}:</strong> ${formattedScaledAmount} ${ingredient.unit}`;
            }
            scaledList.appendChild(listItem);
        });

        scaledIngredientsDiv.appendChild(scaledList);
    };

    // Event listener for "Calculate" button
    calculateBtn.addEventListener('click', calculateScaledIngredients);

    // Optional: Recalculate on input changes for a more dynamic feel
    // This can be heavy if many inputs, so we'll keep it on button click for now.
    // You could add `input` event listeners to all input fields and selects
    // originalYieldAmountInput.addEventListener('input', calculateScaledIngredients);
    // originalYieldUnitSelect.addEventListener('change', calculateScaledIngredients);
    // desiredYieldAmountInput.addEventListener('input', calculateScaledIngredients);
    // desiredYieldUnitSelect.addEventListener('change', calculateScaledIngredients);
    // originalIngredientsDiv.addEventListener('input', calculateScaledIngredients); // This would need delegation
});
