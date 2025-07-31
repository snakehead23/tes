// script.js

// --- KONFIGURASI PENTING ---
const API_KEY = 'bda883e3019106157c9a9c5cfe3921bb'; 
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// --- ELEMEN DOM ---
const heroBgImg = document.getElementById('hero-bg-img');
const heroTitle = document.getElementById('hero-title');
const heroSynopsis = document.getElementById('hero-synopsis');
const searchIcon = document.getElementById('search-icon');
const searchInput = document.getElementById('search-input');
const mainContent = document.getElementById('main-content');
const searchResultsSection = document.getElementById('search-results-section');
const searchResultsGrid = document.getElementById('search-results-grid');

// Elemen Modal
const modal = document.getElementById('movie-modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close-btn');

// --- FUNGSI API ---
async function fetchFromAPI(endpoint) {
    const url = `https://api.themoviedb.org/3/${endpoint}?api_key=${API_KEY}&language=id-ID`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Gagal mengambil data dari TMDb:", error);
        return null;
    }
}

// --- FUNGSI TAMPILAN ---
function createMovieCard(movie) {
    if (!movie.poster_path) return null; // Lewati film tanpa poster

    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.movieId = movie.id; // Simpan ID film untuk diklik

    const img = document.createElement('img');
    img.src = `${IMAGE_BASE_URL}w500${movie.poster_path}`;
    img.alt = movie.title;
    
    card.appendChild(img);
    card.addEventListener('click', () => handleCardClick(movie.id));
    return card;
}

function populateContainer(containerId, movies) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        if (card) container.appendChild(card);
    });
}

function displaySearchResults(movies) {
    searchResultsGrid.innerHTML = '';
    if (movies.length === 0) {
        searchResultsGrid.innerHTML = '<p>Tidak ada hasil yang ditemukan.</p>';
        return;
    }
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        if (card) searchResultsGrid.appendChild(card);
    });
}

function setHeroSection(movies) {
    if (movies && movies.length > 0) {
        const heroMovie = movies[0];
        heroBgImg.src = `${IMAGE_BASE_URL}original${heroMovie.backdrop_path}`;
        heroTitle.textContent = heroMovie.title;
        heroSynopsis.textContent = heroMovie.overview;
    }
}

// --- LOGIKA MODAL ---
async function handleCardClick(movieId) {
    const movieDetails = await fetchFromAPI(`movie/${movieId}`);
    const movieVideos = await fetchFromAPI(`movie/${movieId}/videos`);
    
    if (movieDetails) {
        displayModal(movieDetails, movieVideos.results);
    }
}

function displayModal(details, videos) {
    const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const trailerHtml = trailer ? 
        `<a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank" class="trailer-btn">Tonton Trailer</a>` : 
        '<p>Trailer tidak tersedia.</p>';

    modalBody.innerHTML = `
        <div class="modal-bg" style="background-image: url(${IMAGE_BASE_URL}original${details.backdrop_path})"></div>
        <div class="modal-details">
            <h2 class="modal-title">${details.title}</h2>
            <div class="modal-meta">
                <span class="modal-rating">⭐ ${details.vote_average.toFixed(1)}</span>
                <span>${details.release_date.substring(0, 4)}</span>
                <span>${Math.floor(details.runtime / 60)}j ${details.runtime % 60}m</span>
            </div>
            <p class="modal-genres">${details.genres.map(g => g.name).join(', ')}</p>
            <p class="modal-synopsis">${details.overview}</p>
            ${trailerHtml}
        </div>
    `;
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
    modalBody.innerHTML = ''; // Kosongkan konten agar tidak menumpuk
}

// --- EVENT LISTENERS ---
searchIcon.addEventListener('click', () => {
    searchInput.classList.toggle('active');
    searchInput.focus();
});

searchInput.addEventListener('keyup', async (event) => {
    const query = event.target.value.trim();
    if (query) {
        mainContent.style.display = 'none';
        searchResultsSection.style.display = 'block';
        const searchData = await fetchFromAPI(`search/movie&query=${encodeURIComponent(query)}`);
        if(searchData) displaySearchResults(searchData.results);
    } else {
        mainContent.style.display = 'block';
        searchResultsSection.style.display = 'none';
    }
});

closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        closeModal();
    }
});

// --- INISIALISASI HALAMAN ---
async function initializePage() {
    const trendingData = await fetchFromAPI('trending/movie/week');
    if (trendingData) {
        setHeroSection(trendingData.results);
        populateContainer('trending-carousel', trendingData.results);
    }

    const topRatedData = await fetchFromAPI('movie/top_rated');
    if (topRatedData) populateContainer('top-rated-carousel', topRatedData.results);

    const upcomingData = await fetchFromAPI('movie/upcoming');
    if (upcomingData) populateContainer('upcoming-carousel', upcomingData.results);
}

document.addEventListener('DOMContentLoaded', initializePage);
