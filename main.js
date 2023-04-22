// select elements from the DOM
const ele = document.querySelector('.fav-box ul');
const searchBtn = document.querySelector('.search-box i');
const searchInput = document.querySelector('.search-box input');
const mealBox = document.querySelector('.meal-box');
const favBox = document.querySelector('.fav-box ul');
const popup = document.querySelector('.meal-info-back');

// toggle the search input box when the search icon is clicked
searchBtn.addEventListener('click', () => {
    searchInput.classList.toggle('active');
    searchBtn.classList.toggle('active');
});

// search for a meal when enter is pressed in the search input box
searchInput.addEventListener('keyup', async (e) => {
    if (e.keyCode === 13) {
        mealBox.innerHTML = '';
        const val = searchInput.value;
        const meals = await getSearchMeal(val);
        meals.forEach( meal => {
            addRandomMeal(meal);
            console.log(meal);
        });
        mealBox.style.height = '350px';
        for (let i = 0; i < meals.length; i++) {
            const ribbon = document.querySelectorAll('.ribbon');
            ribbon[i].innerText = 'Search Recipes';
        }
    }
});

// add the mouse down event listener to the favorite meal box to enable scrolling
ele.addEventListener('mousedown', mouseDownHandler);

// get a random meal and fetch favorite meals when the page loads
getRandomMeal();
fetchFavMeal();

// asynchronous function to get a random meal from the meal database
async function getRandomMeal() {
    let randomMeal;
    await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
        .then(res => res.json())
        .then(data => randomMeal = data.meals[0]);
    addRandomMeal(randomMeal);
}

// asynchronous function to get a meal by its ID from the meal database
async function getMealId(id) {
    let mealID;
    await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then(res => res.json())
        .then(data => mealID = data.meals[0]);
    return mealID;
}

// asynchronous function to search for meals in the meal database
async function getSearchMeal(term) {
    let searchMeal;
    await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`)
        .then(res => res.json())
        .then(data => searchMeal = data.meals);
    return searchMeal;
}

// object to store the current scroll position and mouse position
let pos = { top: 0, left: 0, x: 0, y: 0 };

// mouse down event handler to enable scrolling
function mouseDownHandler(e) {
    pos = {
        left: ele.scrollLeft,
        top: ele.scrollTop,
        x: e.clientX,
        y: e.clientY,
    };
    ele.addEventListener('mousemove', mouseMoveHandler);
    ele.addEventListener('mouseup', mouseUpHandler);
    ele.style.cursor = 'grabbing';
    ele.style.userSelect = 'none';
};

// mouse move event handler to enable scrolling
function mouseMoveHandler(e) {
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;
    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;
};

// mouse up event handler to disable scrolling
function mouseUpHandler() {
    ele.removeEventListener('mousemove', mouseMoveHandler);
    ele.removeEventListener('mouseup', mouseUpHandler);
    ele.style.cursor = 'grab';
    ele.style.removeProperty('user-select');
};

function addRandomMeal(randomMeal) {
    // Create a new <div> element with class "meal"
    const meal = document.createElement('div');
    meal.classList.add('meal');
    
    // Set the innerHTML of the <div> element to display information about the random meal
    meal.innerHTML = `
      <span class="ribbon">
        Random Recipes
      </span>
      <div class="meal-header">
        <img src="${randomMeal.strMealThumb}"
          alt="${randomMeal.strMeal}">
      </div>
      <div class="meal-body">
        <h4>${randomMeal.strMeal}</h4>
        <button class="fav-btn">
          <i class="fas fa-heart"></i>
        </button>
      </div>
    `;
    
    // Append the <div> element to the "mealBox" element in the DOM
    mealBox.appendChild(meal);
  
    // Add an event listener to the "fav-btn" button that toggles between adding and removing the meal from localStorage
    const favBtn = document.querySelector('.fav-btn');
    favBtn.addEventListener('click', () => {
      if (favBtn.classList.contains('active')) {
        removeMealFromLS(randomMeal.idMeal);
        favBtn.classList.remove('active');
      } else {
        addMealToLS(randomMeal.idMeal);
        favBtn.classList.add('active');
      }
      // Refresh the list of favorite meals after adding or removing a meal
      fetchFavMeal();
    });
  
    // Add an event listener to the <div> element that displays the meal popup when clicked
    meal.addEventListener('click', () => {
      mealPopup(randomMeal);
    });
}
  
// Fetch and display all favorite meals from localStorage
async function fetchFavMeal() {
    favBox.innerHTML = '';
  
    const mealIDs = getMealFromLS();
  
    for (let i = 0; i < mealIDs.length; i++) {
      const mealID = await getMealId(mealIDs[i]);
  
      showFavMeal(mealID);
    }
}
  
// Display a single favorite meal in the DOM
function showFavMeal(mealID) {
    const favMeal = document.createElement('li');
  
    favMeal.innerHTML = `
      <img src="${mealID.strMealThumb}"
        alt="${mealID.strMeal}">
      <span>${mealID.strMeal}</span>
      <button class="remove-btn">
        <i class="fas fa-circle-xmark"></i>
      </button>
    `;
    
    // Append the <li> element to the "favBox" element in the DOM
    favBox.appendChild(favMeal);
  
    // Add an event listener to the "remove-btn" button that removes the meal from localStorage and refreshes the list of favorite meals
    const btn = favMeal.querySelector('.remove-btn');
    btn.addEventListener('click', () => {
      removeMealFromLS(mealID.idMeal);
      fetchFavMeal();
    });
  
    // Add an event listener to the <li> element that displays the meal popup when clicked
    favMeal.addEventListener('click', () => {
      mealPopup(mealID);
    });
}

// This function creates a popup that displays information about a meal.
function mealPopup(mealData) {
    // Clear any existing content in the popup
    popup.innerHTML = '';

    let ingredient = [];

    // Collect all the ingredients and their measurements for the meal
    for (let i = 1; i <= 20; i++) {
        if (mealData['strIngredient' + i]) {
            ingredient.push(`${mealData['strIngredient' + i]} - ${mealData['strMeasure' + i]}`);
        }
    }

    // Create the HTML for the meal info section of the popup
    const mealInfo = document.createElement('div');
    mealInfo.classList.add('meal-info');
    mealInfo.innerHTML = `
        <div class="info-header">
            <img src="${mealData.strMealThumb}"
                alt="${mealData.strMeal}">
            <div class="details">
                <h2>${mealData.strMeal}</h2>
                <h4>Ingredients:</h4>
                <ul>
                    ${ingredient.map(ing => `<li>${ing}</li>`).join('')}
                </ul>
            </div>
        </div>
        <div class="info-body">
            <p>${mealData.strInstructions}</p>
        </div>
        <button class="remove-btn">
            <i class="fas fa-circle-xmark"></i>
        </button>
    `;

    // Add the meal info section to the popup and display it
    popup.appendChild(mealInfo);
    popup.style.display = 'flex';

    // Add a click event listener to the close button to hide the popup when clicked
    const close = document.querySelector('.meal-info > .remove-btn');
    close.addEventListener('click', () => {
        popup.style.display = 'none';
    });
}

// This function adds a meal ID to the user's local storage
function addMealToLS(mealId) {
    const mealIds = getMealFromLS();
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

// This function removes a meal ID from the user's local storage
function removeMealFromLS(mealId) {
    const mealIds = getMealFromLS();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)));
}

// This function retrieves an array of meal IDs from the user's local storage, or an empty array if there are none
function getMealFromLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    return mealIds == null ? [] : mealIds;
}
