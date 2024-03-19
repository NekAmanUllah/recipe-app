import React, { useState, useEffect } from 'react';
import './body.css';
import { jsPDF } from 'jspdf';

export function Body() {
  // Define recipes state
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [edamamRecipes, setEdamamRecipes] = useState([]);

  // Edamam API credentials
  const appId = 'c3d8ac7d';
  const appKey = '23cbabc8c422d56d797b3388515bcc0d';

  // Fetch recipes from Edamam API based on search query
  useEffect(() => {
    if (searchQuery) {
      fetch(`https://api.edamam.com/search?q=${searchQuery}&app_id=${appId}&app_key=${appKey}`)
        .then(response => response.json())
        .then(data => {
          setEdamamRecipes(data.hits.map(hit => hit.recipe));
        })
        .catch(error => console.error('Error fetching data:', error));
    }
  }, [searchQuery]);

  // Handle form submit
  const handleSubmit = (event) => {
    event.preventDefault();

    const nameInput = document.querySelector('#recipe-name');
    const ingrInput = document.querySelector('#recipe-ingredients');
    const methodInput = document.querySelector('#recipe-method');
    const name = nameInput.value.trim();
    const ingredients = ingrInput.value.trim().split(',').map(i => i.trim());
    const method = methodInput.value.trim();

    if (name && ingredients.length > 0 && method) {
      const newRecipe = { name, ingredients, method };
      setRecipes([...recipes, newRecipe]);

      // Clear form inputs
      nameInput.value = '';
      ingrInput.value = '';
      methodInput.value = '';
    }
  };

  // Handle recipe deletion
  const handleDelete = (index) => {
    const updatedRecipes = recipes.filter((_, i) => i !== index);
    setRecipes(updatedRecipes);
  };

  // Search recipes by search query
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Function to generate and download PDF for a single recipe
  const downloadRecipePDF = (recipe) => {
    const doc = new jsPDF();
    let yPos = 10;

    doc.text(recipe.name, 10, yPos);
    yPos += 10;
    doc.text("Ingredients:", 10, yPos);
    yPos += 5;
    recipe.ingredients.forEach(ingr => {
      doc.text("- " + ingr, 15, yPos);
      yPos += 5;
    });
    doc.text("Method:", 10, yPos);
    yPos += 5;
    doc.text(recipe.method, 15, yPos);
    yPos += 20;

    doc.save(`${recipe.name}.pdf`);
  };

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container">
      {/* Add recipes form */}
      <div className="left-column">
        <h3>Add Recipe</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="recipe-name">Name:</label>
          <input type="text" id="recipe-name" required />
          <br />
          <label htmlFor="recipe-ingredients">Ingredients:</label>
          <textarea
            id="recipe-ingredients"
            rows={5}
            required
            defaultValue={""}
          />
          <br />
          <label htmlFor="recipe-method">Method:</label>
          <textarea id="recipe-method" rows={5} required defaultValue={""} />
          <br />
          <button type="submit">Add Recipe</button>
        </form>
      </div>
      {/* Search bar/view recipes list */}
      <div className="right-column">
        <div id="search-section">
          <h3>Recipes List</h3>
          <label htmlFor="search-box">Search:</label>
          <input
            type="text"
            id="search-box"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div id="recipe-list">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe, index) => (
              <div key={index} className="recipe">
                <h3>{recipe.name}</h3>
                <p><strong>Ingredients:</strong></p>
                <ul>
                  {recipe.ingredients.map((ingr, i) => (
                    <li key={i}>{ingr}</li>
                  ))}
                </ul>
                <p><strong>Method:</strong></p>
                <p>{recipe.method}</p>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(index)}
                >
                  Delete
                </button>
                <button onClick={() => downloadRecipePDF(recipe)}>Download PDF</button>
              </div>
            ))
          ) : (
            <div id="no-recipes">You have no recipes.</div>
          )}
          {/* Display Edamam recipes */}
          {edamamRecipes.length > 0 && (
            <div>
              <h3>Edamam Recipes</h3>
              {edamamRecipes.map((recipe, index) => (
                <div key={index} className="recipe">
                  <h3>{recipe.label}</h3>
                  <p><strong>Ingredients:</strong></p>
                  <ul>
                    {recipe.ingredientLines.map((ingr, i) => (
                      <li key={i}>{ingr}</li>
                    ))}
                  </ul>
                  <p><strong>Source:</strong> {recipe.source}</p>
                  <p><strong>Calories:</strong> {Math.round(recipe.calories)}</p>
                  <p><strong>Yield:</strong> {recipe.yield}</p>
                  <button onClick={() => downloadRecipePDF(recipe)}>Download PDF</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
