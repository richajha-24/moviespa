const api_key = 'e96d6bf3';
const moviesGrid = document.getElementById('movies-grid');
const movieModal = document.getElementById('movie-modal');
const movieDetails = document.getElementById('movie-details');
const wishlistModal = document.getElementById('wishlist-modal');
const wishlistContent = document.getElementById('wishlist-content');
const wishlistBtn = document.getElementById('wishlist-btn');
const closeBtns = document.querySelectorAll('.close');
const searchInput = document.getElementById('search-input');

const defaultMovies = ['Inception', 'The Matrix', 'Interstellar', 'The Dark Knight', 'Avatar'];

let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

document.addEventListener('DOMContentLoaded', () => {
    fetchDefaultMovies();
});

function fetchMovies(query = '') {
    const url = `http://www.omdbapi.com/?s=${query}&apikey=${api_key}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Response === 'True') {
                displayMovies(data.Search);
            } else {
                console.log(data.Error);
            }
        })
        .catch(error => console.error('Error:', error));
}

function fetchDefaultMovies() {
    defaultMovies.forEach(title => fetchMovies(title));
}

function displayMovies(movies) {
    moviesGrid.innerHTML = '';
    movies.forEach(movie => {
        const movieBox = document.createElement('div');
        movieBox.classList.add('box');
        movieBox.innerHTML = `
            <img src="${movie.Poster}" alt="${movie.Title}">
            <div class="moviesDetails">
                <h5>${movie.Title}</h5>
                <p>${movie.Year}</p>
            </div>
            <button class="wishlist-btn ${wishlist.some(item => item.imdbID === movie.imdbID) ? 'filled' : ''}" data-id="${movie.imdbID}">&#9825;</button>
        `;
        moviesGrid.appendChild(movieBox);
    });
    addWishlistEventListeners();
}

function addWishlistEventListeners() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const movieId = e.target.dataset.id;
            const isFilled = e.target.classList.toggle('filled');
            if (isFilled) {
                addToWishlist(movieId);
            } else {
                removeFromWishlist(movieId);
            }
        });
    });
}

function addToWishlist(movieId) {
    fetch(`http://www.omdbapi.com/?i=${movieId}&apikey=${api_key}`)
        .then(response => response.json())
        .then(movie => {
            if (movie.Response === 'True') {
                if (!wishlist.some(item => item.imdbID === movie.imdbID)) {
                    wishlist.push(movie);
                    localStorage.setItem('wishlist', JSON.stringify(wishlist));
                }
                updateWishlist();
            } else {
                console.log(movie.Error);
            }
        });
}

function removeFromWishlist(movieId) {
    wishlist = wishlist.filter(item => item.imdbID !== movieId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlist();
}

function updateWishlist() {
    wishlistContent.innerHTML = '';
    wishlist.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.classList.add('box');
        movieItem.innerHTML = `
            <img src="${movie.Poster}" alt="${movie.Title}">
            <div class="moviesDetails">
                <h5>${movie.Title}</h5>
                <p>${movie.Year}</p>
            </div>
        `;
        wishlistContent.appendChild(movieItem);
    });
}

function openModal(movieId) {
    fetch(`http://www.omdbapi.com/?i=${movieId}&apikey=${api_key}`)
        .then(response => response.json())
        .then(movie => {
            if (movie.Response === 'True') {
                movieDetails.innerHTML = `
                    <h2>${movie.Title}</h2>
                    <img src="${movie.Poster}" alt="${movie.Title}">
                    <p>${movie.Plot}</p>
                    <p><strong>Year:</strong> ${movie.Year}</p>
                    <p><strong>Rated:</strong> ${movie.Rated}</p>
                    <p><strong>Director:</strong> ${movie.Director}</p>
                    <p><strong>Actors:</strong> ${movie.Actors}</p>
                `;
                movieModal.style.display = 'flex';
            }
        });
}

function closeModals() {
    movieModal.style.display = 'none';
    wishlistModal.style.display = 'none';
}

searchInput.addEventListener('input', (e) => {
    fetchMovies(e.target.value);
});

wishlistBtn.addEventListener('click', () => {
    updateWishlist();
    wishlistModal.style.display = 'flex';
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', closeModals);
});

moviesGrid.addEventListener('click', (e) => {
    const movieBox = e.target.closest('.box');
    if (movieBox) {
        const movieId = movieBox.querySelector('.wishlist-btn').dataset.id;
        openModal(movieId);
    }
});
