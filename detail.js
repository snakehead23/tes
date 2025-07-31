// detail.js

document.addEventListener('DOMContentLoaded', () => {
    // --- KONFIGURASI ---
    const API_KEY = 'bda883e3019106157c9a9c5cfe3921bb'; 
    
    // --- ELEMEN DOM ---
    const detailContent = document.getElementById('detail-content');
    const loadingIndicator = document.getElementById('loading');
    const playerFrame = document.getElementById('movie-player');
    const detailTitle = document.getElementById('detail-title');
    const detailMeta = document.getElementById('detail-meta');
    const detailSynopsis = document.getElementById('detail-synopsis');

    /**
     * Mengambil ID film dari parameter URL (contoh: detail.html?id=123)
     */
    function getMovieIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    /**
     * Mengambil detail film dari TMDb menggunakan ID-nya.
     */
    async function fetchMovieDetails(movieId) {
        const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=id-ID`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Film tidak ditemukan');
            return await response.json();
        } catch (error) {
            console.error("Gagal mengambil detail film:", error);
            return null;
        }
    }

    /**
     * Fungsi "Tebakan Terbaik" untuk membuat slug dari judul dan tahun film.
     * Ini adalah bagian yang paling mungkin gagal.
     * Contoh: "Avengers: Endgame" (2019) -> "avengers-endgame-2019"
     */
    function createVidfastSlug(title, releaseDate) {
        const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
        const cleanedTitle = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Hapus karakter non-alfanumerik kecuali spasi dan strip
            .trim()
            .replace(/\s+/g, '-'); // Ganti spasi dengan strip
        
        return `${cleanedTitle}-${year}`;
    }

    /**
     * Fungsi utama untuk memuat dan menampilkan halaman.
     */
    async function loadPage() {
        const movieId = getMovieIdFromUrl();
        if (!movieId) {
            loadingIndicator.textContent = 'ID Film tidak valid.';
            return;
        }

        const movieDetails = await fetchMovieDetails(movieId);

        if (movieDetails) {
            // Ubah judul tab browser
            document.title = `${movieDetails.title} | Streaming`;

            // Buat slug dan URL untuk player
            const vidfastSlug = createVidfastSlug(movieDetails.title, movieDetails.release_date);
            const playerUrl = `https://vidfast.pro/movie/${vidfastSlug}`;
            
            // Atur sumber iframe
            playerFrame.src = playerUrl;

            // Isi konten detail film
            detailTitle.textContent = movieDetails.title;
            detailSynopsis.textContent = movieDetails.overview || 'Sinopsis tidak tersedia.';
            const year = movieDetails.release_date ? movieDetails.release_date.substring(0, 4) : 'N/A';
            const rating = movieDetails.vote_average ? movieDetails.vote_average.toFixed(1) : 'N/A';
            detailMeta.textContent = `⭐ ${rating} | ${year} | ${movieDetails.genres.map(g => g.name).join(', ')}`;
            
            // Tampilkan konten dan sembunyikan loading
            loadingIndicator.style.display = 'none';
            detailContent.style.display = 'block';

        } else {
            loadingIndicator.textContent = 'Gagal memuat detail film. Mungkin film ini tidak ada atau terjadi kesalahan jaringan.';
        }
    }

    // Jalankan fungsi utama
    loadPage();
});
