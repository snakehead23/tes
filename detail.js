// detail.js (Revisi Final untuk Halaman Detail)

document.addEventListener('DOMContentLoaded', () => {
    // --- KONFIGURASI ---
    // GANTI DENGAN API KEY ANDA YANG SEBENARNYA!
    const API_KEY = 'bda883e3019106157c9a9c5cfe3921bb'; 
    
    // --- ELEMEN DOM DARI detail.html ---
    const detailContent = document.getElementById('detail-content');
    const loadingIndicator = document.getElementById('loading');
    const streamButtonContainer = document.getElementById('stream-button-container');
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
     * Fungsi "Tebakan Terbaik" untuk membuat slug URL dari judul dan tahun film.
     * Ini adalah bagian yang paling mungkin gagal jika judulnya rumit.
     * Contoh: "Avengers: Endgame" (2019) -> "avengers-endgame-2019"
     */
    function createStreamingSlug(title, releaseDate) {
        const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
        const cleanedTitle = title
            .toLowerCase()
            .replace(/&/g, 'and')       // Ganti '&' dengan 'and'
            .replace(/[^\w\s-]/g, '')   // Hapus karakter non-alfanumerik kecuali spasi dan strip
            .trim()
            .replace(/\s+/g, '-');      // Ganti spasi dengan strip
        
        // Gabungkan judul yang sudah dibersihkan dengan tahun
        return `${cleanedTitle}-${year}`;
    }

    /**
     * Fungsi utama untuk memuat dan menampilkan halaman.
     */
    async function loadPage() {
        const movieId = getMovieIdFromUrl();
        if (!movieId) {
            loadingIndicator.textContent = 'ID Film tidak valid atau tidak ditemukan.';
            return;
        }

        const movieDetails = await fetchMovieDetails(movieId);

        if (movieDetails) {
            // Ubah judul tab browser sesuai nama film
            document.title = `${movieDetails.title} | Info & Streaming`;

            // 1. Buat "slug" (bagian akhir URL) dari detail film
            const streamingSlug = createStreamingSlug(movieDetails.title, movieDetails.release_date);
            
            // 2. Di sinilah link https://vidfast.pro/movie/ dimasukkan dan digabung dengan slug
            const streamingUrl = `https://vidfast.pro/movie/${streamingSlug}`;
            
            // 3. Buat Tombol Streaming secara dinamis
            const streamButton = document.createElement('a');
            streamButton.href = streamingUrl;
            streamButton.textContent = "▶️ Tonton Sekarang";
            streamButton.className = 'stream-button';
            streamButton.target = '_blank'; // Wajib untuk membuka di tab baru
            streamButton.rel = 'noopener noreferrer'; // Praktik keamanan untuk link eksternal
            streamButtonContainer.appendChild(streamButton);

            // 4. Isi sisa konten detail film
            detailTitle.textContent = movieDetails.title;
            detailSynopsis.textContent = movieDetails.overview || 'Sinopsis untuk film ini tidak tersedia.';
            
            const year = movieDetails.release_date ? movieDetails.release_date.substring(0, 4) : 'N/A';
            const rating = movieDetails.vote_average ? movieDetails.vote_average.toFixed(1) : 'N/A';
            const genres = movieDetails.genres.map(g => g.name).join(', ');
            detailMeta.textContent = `⭐ ${rating} | ${year} | ${genres}`;
            
            // 5. Tampilkan konten dan sembunyikan pesan "Memuat..."
            loadingIndicator.style.display = 'none';
            detailContent.style.display = 'block';

        } else {
            // Jika film tidak ditemukan setelah fetch API
            loadingIndicator.textContent = 'Gagal memuat detail film. Silakan coba lagi nanti.';
        }
    }

    // Jalankan seluruh proses saat halaman dimuat
    loadPage();
});
