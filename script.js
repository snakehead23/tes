// script.js (Revisi Final untuk Halaman Utama - index.html)

// --- KONFIGURASI PENTING ---
// GANTI DENGAN API KEY ANDA YANG SEBENARNYA!
const API_KEY = 'bda883e3019106157c9a9c5cfe3921bb';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// --- ELEMEN DOM DARI index.html ---
const heroBgImg = document.getElementById('hero-bg-img');
const heroTitle = document.getElementById('hero-title');
const heroSynopsis = document.getElementById('hero-synopsis');
const searchIcon = document.getElementById('search-icon');
const searchInput = document.getElementById('search-input');
const mainContent = document.getElementById('main-content');
const searchResultsSection = document.getElementById('search-results-section');
const searchResultsGrid = document.getElementById('search-results-grid');

/**
 * Fungsi umum untuk mengambil data dari API TMDb.
 * @param {string} endpoint - Endpoint API yang dituju (misal: 'trending/movie/week').
 * @param {string} queryParams - Parameter tambahan untuk URL (misal: 'query=joker').
 * @returns {Promise<Object|null>} - Data hasil atau null jika gagal.
 */
async function fetchFromAPI(endpoint, queryParams = "") {
    const url = `https://api.themoviedb.org/3/${endpoint}?api_key=${API_KEY}&language=id-ID&${queryParams}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Gagal mengambil data dari TMDb:", error);
        return null;
    }
}

/**
 * Membuat sebuah elemen kartu (poster film).
 * @param {Object} movie - Objek data film dari TMDb.
 * @returns {HTMLElement|null} - Elemen div kartu atau null jika tidak ada poster.
 */
function createMovieCard(movie) {
    // Jangan buat kartu jika film tidak memiliki gambar poster.
    if (!movie.poster_path) return null;

    const card = document.createElement('div');
    card.classList.add('card');
    
    const img = document.createElement('img');
    img.src = `${IMAGE_BASE_URL}w500${movie.poster_path}`;
    img.alt = movie.title;
    
    // Ketika kartu diklik, panggil fungsi handleCardClick dengan ID film.
    card.addEventListener('click', () => handleCardClick(movie.id));
    
    card.appendChild(img);
    return card;
}

/**
 * Mengisi kontainer (carousel atau grid) dengan kartu-kartu film.
 * @param {string} containerId - ID elemen kontainer.
 * @param {Array} movies - Array objek data film.
 */
function populateContainer(containerId, movies) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = ''; // Kosongkan kontainer sebelum diisi.
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        if (card) container.appendChild(card); // Hanya tambahkan kartu jika berhasil dibuat.
    });
}

/**
 * Menampilkan hasil pencarian film dalam format grid.
 * @param {Array} movies - Array film dari hasil pencarian.
 */
function displaySearchResults(movies) {
    searchResultsGrid.innerHTML = '';
    if (movies.length === 0) {
        searchResultsGrid.innerHTML = '<p>Tidak ada hasil yang ditemukan untuk pencarian Anda.</p>';
        return;
    }
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        if (card) searchResultsGrid.appendChild(card);
    });
}

/**
 * Mengatur tampilan utama (hero section) dengan data film pertama.
 * @param {Array} movies - Array objek data film.
 */
function setHeroSection(movies) {
    if (movies && movies.length > 0) {
        const heroMovie = movies[0]; // Ambil film pertama sebagai hero.
        heroBgImg.src = `${IMAGE_BASE_URL}original${heroMovie.backdrop_path}`;
        heroTitle.textContent = heroMovie.title;
        heroSynopsis.textContent = heroMovie.overview;
    }
}

// --- LOGIKA UTAMA: PENANGANAN KLIK POSTER ---
/**
 * Fungsi yang dijalankan ketika poster film diklik.
 * Ini menggantikan fungsi modal yang lama.
 * @param {number} movieId - ID film yang diklik.
 */
function handleCardClick(movieId) {
    // Arahkan pengguna ke halaman detail, membawa ID film sebagai parameter URL.
    window.location.href = `detail.html?id=${movieId}`;
}


// --- EVENT LISTENERS ---

// Event listener untuk ikon pencarian.
searchIcon.addEventListener('click', () => {
    searchInput.classList.toggle('active');
    searchInput.focus();
});

// Event listener untuk input pencarian (saat pengguna mengetik).
searchInput.addEventListener('keyup', async (event) => {
    const query = event.target.value.trim();

    if (query) {
        // Jika ada teks pencarian, sembunyikan konten utama dan tampilkan hasil.
        mainContent.style.display = 'none';
        searchResultsSection.style.display = 'block';
        const searchData = await fetchFromAPI('search/movie', `query=${encodeURIComponent(query)}`);
        if (searchData) displaySearchResults(searchData.results);
    } else {
        // Jika teks pencarian kosong, tampilkan lagi konten utama.
        mainContent.style.display = 'block';
        searchResultsSection.style.display = 'none';
    }
});


// --- INISIALISASI HALAMAN ---
/**
 * Fungsi utama yang dijalankan saat halaman pertama kali dimuat.
 */
async function initializePage() {
    // Ambil data untuk setiap kategori carousel.
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

// Jalankan fungsi inisialisasi setelah seluruh konten HTML selesai dimuat.
document.addEventListener('DOMContentLoaded', initializePage);
