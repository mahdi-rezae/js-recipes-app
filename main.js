const ele = document.querySelector('.fav-box ul');
const searchBtn = document.querySelector('.search-box i');
const searchInput = document.querySelector('.search-box input');
const mealBox = document.querySelector('.meal-box');
const favBox = document.querySelector('.fav-box ul');
const popup = document.querySelector('.meal-info-back');

searchBtn.addEventListener('click', () => {
    searchInput.classList.toggle('active');
    searchBtn.classList.toggle('active');
});

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

ele.addEventListener('mousedown', mouseDownHandler);

getRandomMeal();
fetchFavMeal();

async function getRandomMeal() {
    let randomMeal;
    await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
        .then(res => res.json())
        .then(data => randomMeal = data.meals[0]);

    addRandomMeal(randomMeal);
}

async function getMealId(id) {
    let mealID;
    await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then(res => res.json())
        .then(data => mealID = data.meals[0]);

    return mealID;
}

async function getSearchMeal(term) {
    let searchMeal;
    await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`)
        .then(res => res.json())
        .then(data => searchMeal = data.meals);

    return searchMeal;
}

let pos = { top: 0, left: 0, x: 0, y: 0 };

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

function mouseMoveHandler(e) {
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;

    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;
};

function mouseUpHandler() {
    ele.removeEventListener('mousemove', mouseMoveHandler);
    ele.removeEventListener('mouseup', mouseUpHandler);

    ele.style.cursor = 'grab';
    ele.style.removeProperty('user-select');
};


function addRandomMeal(randomMeal) {
    const meal = document.createElement('div');
    meal.classList.add('meal');
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
    
    mealBox.appendChild(meal);

    const favBtn = document.querySelector('.fav-btn');
    favBtn.addEventListener('click', () => {
        if (favBtn.classList.contains('active')) {
            removeMealFromLS(randomMeal.idMeal);
            favBtn.classList.remove('active');
        } else {
            addMealToLS(randomMeal.idMeal);
            favBtn.classList.add('active');
        }

        fetchFavMeal();
    });

    meal.addEventListener('click', () => {
        mealPopup(randomMeal);
    });
}

async function fetchFavMeal() {
    favBox.innerHTML = '';

    const mealIDs = getMealFromLS();

    for (let i = 0; i < mealIDs.length; i++) {
        const mealID = await getMealId(mealIDs[i]);

        showFavMeal(mealID);
    }
}

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
        
    favBox.appendChild(favMeal);

    const btn = favMeal.querySelector('.remove-btn');
    btn.addEventListener('click', () => {
        removeMealFromLS(mealID.idMeal);
        fetchFavMeal();
    });

    favMeal.addEventListener('click', () => {
        mealPopup(mealID);
    });
}

function mealPopup(mealData) {
    popup.innerHTML = '';

    let ingredient = [];

    for (let i = 1; i <= 20; i++) {
        if (mealData['strIngredient' + i]) {
            ingredient.push(`${mealData['strIngredient' + i]} - ${mealData['strMeasure' + i]}`);
        }
    }

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

    popup.appendChild(mealInfo);

    popup.style.display = 'flex';

    const close = document.querySelector('.meal-info > .remove-btn');
    close.addEventListener('click', () => {
        popup.style.display = 'none';
    });
}

function addMealToLS(mealId) {
    const mealIds = getMealFromLS();

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLS(mealId) {
    const mealIds = getMealFromLS();

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)));
}

function getMealFromLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds == null ? [] : mealIds;
}