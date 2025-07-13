import axios from 'axios';
import { Movie, TMDBMovie, TMDBGenre, TMDBVideo } from '@yournxtwatch/shared';

export class TMDBService {
  private baseUrl = 'https://api.themoviedb.org/3';
  private apiKey = process.env.TMDB_API_KEY || '';

  constructor() {
    if (!this.apiKey) {
      console.warn('TMDB_API_KEY not set. Using mock data.');
    }
  }

  async getMoviesByGenre(genre: string, count: number = 20): Promise<Movie[]> {
    if (!this.apiKey) {
      return this.getMockMovies(genre, count);
    }

    try {
      // First get the genre ID
      const genreId = await this.getGenreId(genre);
      if (!genreId) {
        return this.getMockMovies(genre, count);
      }

      // Fetch movies by genre
      const response = await axios.get(`${this.baseUrl}/discover/movie`, {
        params: {
          api_key: this.apiKey,
          with_genres: genreId,
          sort_by: 'popularity.desc',
          include_adult: false,
          include_video: false,
          page: 1,
          language: 'en-US'
        }
      });

      const movies: Movie[] = response.data.results
        .slice(0, count)
        .map((tmdbMovie: TMDBMovie) => this.transformTMDBMovie(tmdbMovie));

      return movies;
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      return this.getMockMovies(genre, count);
    }
  }

  async getMovieDetails(movieId: number): Promise<Movie | null> {
    if (!this.apiKey) {
      return this.getMockMovieDetails(movieId);
    }

    try {
      const [movieResponse, videosResponse] = await Promise.all([
        axios.get(`${this.baseUrl}/movie/${movieId}`, {
          params: {
            api_key: this.apiKey,
            language: 'en-US'
          }
        }),
        axios.get(`${this.baseUrl}/movie/${movieId}/videos`, {
          params: {
            api_key: this.apiKey,
            language: 'en-US'
          }
        })
      ]);

      const movie = this.transformTMDBMovie(movieResponse.data);
      
      // Get trailer URL
      const trailer = videosResponse.data.results.find((video: TMDBVideo) => 
        video.type === 'Trailer' && video.site === 'YouTube'
      );
      
      if (trailer) {
        movie.trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
      }

      return movie;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return this.getMockMovieDetails(movieId);
    }
  }

  private async getGenreId(genreName: string): Promise<number | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/genre/movie/list`, {
        params: {
          api_key: this.apiKey,
          language: 'en-US'
        }
      });

      const genre = response.data.genres.find((g: TMDBGenre) => 
        g.name.toLowerCase() === genreName.toLowerCase()
      );

      return genre ? genre.id : null;
    } catch (error) {
      console.error('Error fetching genres:', error);
      return null;
    }
  }

  private transformTMDBMovie(tmdbMovie: TMDBMovie): Movie {
    return {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      overview: tmdbMovie.overview,
      posterPath: tmdbMovie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
        : '',
      backdropPath: tmdbMovie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${tmdbMovie.backdrop_path}`
        : '',
      releaseDate: tmdbMovie.release_date,
      voteAverage: tmdbMovie.vote_average,
      genres: [], // Will be populated by genre IDs if needed
      streamingInfo: [] // Mocked for now
    };
  }

  private getMockMovies(genre: string, count: number): Movie[] {
    const mockMovies: Movie[] = [
      {
        id: 1,
        title: 'The Shawshank Redemption',
        overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        posterPath: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
        backdropPath: 'https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
        releaseDate: '1994-09-22',
        voteAverage: 9.3,
        genres: [genre],
        streamingInfo: [
          { platform: 'Netflix', url: 'https://netflix.com', type: 'stream' },
          { platform: 'Amazon Prime', url: 'https://amazon.com', type: 'rent', price: '$3.99' }
        ]
      },
      {
        id: 2,
        title: 'The Godfather',
        overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        posterPath: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        backdropPath: 'https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
        releaseDate: '1972-03-14',
        voteAverage: 9.2,
        genres: [genre],
        streamingInfo: [
          { platform: 'Paramount+', url: 'https://paramountplus.com', type: 'stream' }
        ]
      },
      {
        id: 3,
        title: 'The Dark Knight',
        overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        posterPath: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        backdropPath: 'https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
        releaseDate: '2008-07-18',
        voteAverage: 9.0,
        genres: [genre],
        streamingInfo: [
          { platform: 'HBO Max', url: 'https://hbomax.com', type: 'stream' }
        ]
      }
    ];

    // Generate more mock movies if needed
    for (let i = 4; i <= count; i++) {
      mockMovies.push({
        id: i,
        title: `Mock Movie ${i}`,
        overview: `This is a mock movie for testing purposes. Genre: ${genre}`,
        posterPath: 'https://via.placeholder.com/500x750/666666/FFFFFF?text=Mock+Movie',
        backdropPath: 'https://via.placeholder.com/1920x1080/666666/FFFFFF?text=Mock+Backdrop',
        releaseDate: '2023-01-01',
        voteAverage: Math.random() * 5 + 5,
        genres: [genre],
        streamingInfo: [
          { platform: 'Mockflix', url: 'https://mockflix.com', type: 'stream' }
        ]
      });
    }

    return mockMovies;
  }

  private getMockMovieDetails(movieId: number): Movie | null {
    const mockMovies = this.getMockMovies('Drama', 20);
    return mockMovies.find(movie => movie.id === movieId) || null;
  }
} 