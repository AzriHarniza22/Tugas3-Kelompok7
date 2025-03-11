const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sample database 
let items = [
  { 
    id: 1, 
    name: "Naruto", 
    genre: "Shonen", 
    author: "Masashi Kishimoto", 
    yearStarted: 1999,
    yearEnded: 2014,
    episodes: 720,
    rating: 4.5,
    imageUrl: "/api/placeholder/300/200?text=Naruto"
  },
  { 
    id: 2, 
    name: "One Piece", 
    genre: "Adventure", 
    author: "Eiichiro Oda",
    yearStarted: 1999,
    yearEnded: null,
    episodes: 1000,
    rating: 4.8,
    imageUrl: "/api/placeholder/300/200?text=One+Piece"
  },
  { 
    id: 3, 
    name: "Attack on Titan", 
    genre: "Action", 
    author: "Hajime Isayama",
    yearStarted: 2009,
    yearEnded: 2021,
    episodes: 87,
    rating: 4.7,
    imageUrl: "/api/placeholder/300/200?text=Attack+on+Titan"
  },
];

// Untuk menyimpan favorites user
let favorites = [];

// Styling untuk tampilan lebih rapih
const style = `
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f4f4f4; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    ul { list-style: none; padding: 0; }
    li { background: white; margin: 10px 0; padding: 10px; border-radius: 5px; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1); }
    a, button { text-decoration: none; padding: 5px 10px; margin: 5px; display: inline-block; border-radius: 5px; }
    a { background: #007bff; color: white; }
    button { background: #dc3545; color: white; border: none; cursor: pointer; }
    .favorite { background: gold; color: black; }
    .search { background: #28a745; color: white; }
    form { display: inline; }
    input { margin: 5px; padding: 8px; border: 1px solid #ccc; border-radius: 5px; }
    .stats { background: #17a2b8; color: black; padding: 10px; border-radius: 5px; margin: 10px 0; }
    .filter-section { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
    .star { color: gold; cursor: pointer; font-size: 1.5em; }
    .tags span { background: #6c757d; color: white; padding: 3px 8px; border-radius: 10px; margin-right: 5px; }
    .card { background: white; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin: 15px 0; padding: 15px; }
    .chart-container { width: 100%; height: 300px; max-width: 600px; margin: 0 auto; position: relative; }
    .dashboard-container { display: flex; flex-wrap: wrap; justify-content: space-between; }
    .dashboard-card { flex: 1; min-width: 300px; margin: 10px; }
    .flex-container { display: flex; flex-wrap: wrap; gap: 20px; }
    .flex-item { flex: 1; min-width: 300px; }
    .search-highlight { background-color: #ffff00; }
    .anime-image { width: 100%; height: 200px; object-fit: cover; border-radius: 5px; margin-bottom: 10px; }
    .anime-card { display: flex; flex-direction: column; }
    .anime-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .anime-details { display: flex; gap: 20px; }
    .anime-cover { flex: 0 0 300px; }
    .anime-info { flex: 1; }
  </style>
`;

// Chart library
const chartScript = `
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
`;

// Halaman utama dengan daftar perintah
app.get("/", (req, res) => {
    // Hitung genre untuk stats dashboard 
    const genres = {};
    items.forEach(item => {
      genres[item.genre] = (genres[item.genre] || 0) + 1;
    });
    
    const genreStats = Object.entries(genres)
      .map(([genre, count]) => `<li>${genre}: ${count} anime</li>`)
      .join("");
    
    // Bagian Featured anime (menampilkan top rated anime)
    const featuredAnime = [...items]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
      .map(item => `
        <div class="card">
          <img src="${item.imageUrl}" alt="${item.name}" class="anime-image">
          <h3>${item.name} ${'★'.repeat(Math.round(item.rating))}</h3>
          <p>${item.genre} - ${item.episodes} episodes</p>
          <a href="/items/${item.id}">View Details</a>
        </div>
      `).join('');
    
    res.send(`
      ${style}
      ${chartScript}
      <h1>Welcome to the Anime API</h1>
      
      <div class="dashboard-container">
        <div class="dashboard-card card">
          <h2>Dashboard Summary</h2>
          <div class="stats">
            <p>Total Anime: ${items.length}</p>
            <p>Genres:</p>
            <ul>${genreStats}</ul>
          </div>
        </div>
        
        <div class="dashboard-card card">
          <h2>Genre Distribution</h2>
          <div class="chart-container">
            <canvas id="genreChart"></canvas>
          </div>
        </div>
      </div>
      
      <h2>Featured Anime</h2>
      <div class="flex-container">
        ${featuredAnime}
      </div>
      
      <h2>Available Routes:</h2>
      <ul>
        <li><a href="/items">View all anime</a></li>
        <li><a href="/add">Add new anime</a></li>
        <li><a href="/favorites">View favorites</a></li>
        <li><a href="/stats">View statistics</a></li>
        <li><a href="/api/items">API: Get all items (JSON)</a></li>
      </ul>
      
      <script>
        // Create a pie chart for genres
        const ctx = document.getElementById('genreChart').getContext('2d');
        const genreLabels = [${Object.keys(genres).map(g => `"${g}"`).join(', ')}];
        const genreCounts = [${Object.values(genres).join(', ')}];
        
        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: genreLabels,
            datasets: [{
              label: 'Anime by Genre',
              data: genreCounts,
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'right'
              }
            }
          }
        });
      </script>
    `);
  });

// JSON API endpoint untuk semua item
app.get("/api/items", (req, res) => {
    res.json(items);
  });

// JSON API endpoint for a item spesifik
app.get("/api/items/:id", (req, res) => {
    const item = items.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  });

// Placeholder image API 
app.get("/api/placeholder/:width/:height", (req, res) => {

    const width = req.params.width;
    const height = req.params.height;
    const text = req.query.text || 'Anime';
    
    res.set('Content-Type', 'image/svg+xml');
    res.send(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#3498db"/>
        <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
      </svg>
    `);
  });

// Halaman daftar anime  sorting, filtering, and searching
app.get("/items", (req, res) => {
    let filteredItems = [...items];
    const { genre, sort, q } = req.query;
    
    // Apply search if specified
    if (q) {
      const searchTerm = q.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.author.toLowerCase().includes(searchTerm) ||
        item.genre.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply genre filter if specified
    if (genre) {
      filteredItems = filteredItems.filter(item => 
        item.genre.toLowerCase() === genre.toLowerCase()
      );
    }
    
    // Apply sorting if specified
    if (sort) {
      switch(sort) {
        case 'name':
          filteredItems.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'rating':
          filteredItems.sort((a, b) => b.rating - a.rating);
          break;
        case 'year':
          filteredItems.sort((a, b) => a.yearStarted - b.yearStarted);
          break;
      }
    }
    
    // Get all unique genres for filter options
    const genres = [...new Set(items.map(item => item.genre))];
    const genreOptions = genres.map(g => 
      `<option value="${g}" ${genre === g ? 'selected' : ''}>${g}</option>`
    ).join('');
    
    // Function to highlight search term in text
    const highlightSearchTerm = (text, searchTerm) => {
      if (!searchTerm) return text;
      
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      return text.replace(regex, '<span class="search-highlight">$1</span>');
    };
    
    let itemList = filteredItems.map(item => {
      const isFavorite = favorites.includes(item.id);
      
      // Highlight search terms if search is active
      const highlightedName = q ? highlightSearchTerm(item.name, q) : item.name;
      const highlightedAuthor = q ? highlightSearchTerm(item.author, q) : item.author;
      const highlightedGenre = q ? highlightSearchTerm(item.genre, q) : item.genre;
      
      return `
        <div class="card anime-card">
          <img src="${item.imageUrl}" alt="${item.name}" class="anime-image">
          <h3>${highlightedName} ${isFavorite ? '⭐' : ''}</h3>
          <div class="tags">
            <span>${highlightedGenre}</span>
            <span>${item.yearStarted}${item.yearEnded ? ' - ' + item.yearEnded : ' - Present'}</span>
          </div>
          <p>By ${highlightedAuthor}</p>
          <p>Episodes: ${item.episodes}</p>
          <p>Rating: ${'★'.repeat(Math.round(item.rating))}</p>
          <div class="action-buttons">
            <a href="/items/${item.id}">View</a>
            <a href="/edit/${item.id}">Edit</a>
            <form action="/delete/${item.id}" method="POST" style="display:inline;">
              <button type="submit">Delete</button>
            </form>
            <form action="${isFavorite ? '/unfavorite' : '/favorite'}/${item.id}" method="POST" style="display:inline;">
              <button type="submit" class="${isFavorite ? 'favorite' : ''}">${isFavorite ? 'Unfavorite' : 'Favorite'}</button>
            </form>
          </div>
        </div>
      `;
    }).join("");
    
    res.send(`
      ${style}
      <h1>Anime List</h1>
      
      <div class="filter-section">
        <form action="/items" method="GET">
          <input type="text" name="q" placeholder="Search by name, author, or genre" value="${q || ''}" style="width: 300px;">
          <button type="submit" class="search">Search</button>
          
          <label for="genre" style="margin-left: 20px;">Filter by Genre:</label>
          <select name="genre" id="genre">
            <option value="">All Genres</option>
            ${genreOptions}
          </select>
          
          <label for="sort">Sort by:</label>
          <select name="sort" id="sort">
            <option value="">Default</option>
            <option value="name" ${sort === 'name' ? 'selected' : ''}>Name</option>
            <option value="rating" ${sort === 'rating' ? 'selected' : ''}>Rating</option>
            <option value="year" ${sort === 'year' ? 'selected' : ''}>Year</option>
          </select>
          
          <button type="submit">Apply</button>
          ${(q || genre || sort) ? `<a href="/items" style="background: #6c757d;">Reset Filters</a>` : ''}
        </form>
      </div>
      
      ${q ? `<p>Found ${filteredItems.length} results for "${q}"</p>` : ''}
      
      <div class="anime-grid">${itemList.length ? itemList : '<div>No anime found</div>'}</div>
      <a href="/">Back to Home</a>
    `);
  });

// Halaman statistik
app.get("/stats", (req, res) => {
    // Calculate statistics
    const totalAnime = items.length;
    const avgRating = items.reduce((sum, item) => sum + item.rating, 0) / totalAnime;
    const avgEpisodes = Math.round(items.reduce((sum, item) => sum + item.episodes, 0) / totalAnime);
    
    // Count by genre
    const genreCounts = {};
    items.forEach(item => {
      genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
    });
    
    const genreStats = Object.entries(genreCounts)
      .map(([genre, count]) => `<li>${genre}: ${count} anime (${Math.round(count/totalAnime*100)}%)</li>`)
      .join("");
    
    res.send(`
      ${style}
      ${chartScript}
      <h1>Anime Statistics</h1>
      
      <div class="flex-container">
        <div class="flex-item card">
          <h2>Overall Stats</h2>
          <p>Total Anime: ${totalAnime}</p>
          <p>Average Rating: ${avgRating.toFixed(2)}/5</p>
          <p>Average Episodes: ${avgEpisodes}</p>
        </div>
        
        <div class="flex-item card">
          <h2>Genre Distribution</h2>
          <ul>${genreStats}</ul>
        </div>
      </div>
      
      <div class="flex-container">
        <div class="flex-item card">
          <h2>Genre Chart</h2>
          <div class="chart-container">
            <canvas id="genreChart"></canvas>
          </div>
        </div>
        
        <div class="flex-item card">
          <h2>Ratings Distribution</h2>
          <div class="chart-container">
            <canvas id="ratingsChart"></canvas>
          </div>
        </div>
      </div>
      
      <a href="/">Back to Home</a>
      
      <script>
        // Create a pie chart for genres
        const genreCtx = document.getElementById('genreChart').getContext('2d');
        const genreLabels = [${Object.keys(genreCounts).map(g => `"${g}"`).join(', ')}];
        const genreCounts = [${Object.values(genreCounts).join(', ')}];
        
        new Chart(genreCtx, {
          type: 'pie',
          data: {
            labels: genreLabels,
            datasets: [{
              label: 'Anime by Genre',
              data: genreCounts,
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 15
                }
              }
            }
          }
        });
        
        // Create a bar chart for ratings
        const ratingsCtx = document.getElementById('ratingsChart').getContext('2d');
        const ratingsData = [0, 0, 0, 0, 0]; // For ratings 1-5
        
        ${items.map(item => `ratingsData[Math.round(${item.rating}) - 1]++;`).join('\n')}
        
        new Chart(ratingsCtx, {
          type: 'bar',
          data: {
            labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
            datasets: [{
              label: 'Number of Anime',
              data: ratingsData,
              backgroundColor: 'rgba(54, 162, 235, 0.7)'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
              y: {
                beginAtZero: true,
                stepSize: 1
              }
            }
          }
        });
      </script>
    `);
  });

// Halaman detail anime
app.get("/items/:id", (req, res) => {
    const item = items.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).send(`${style}<h1>Item not found</h1><a href='/'>Back to Home</a>`);
    
    const isFavorite = favorites.includes(item.id);
    
    res.send(`
      ${style}
      <div class="card" style="max-width: 800px; margin: 0 auto;">
        <div class="anime-details">
          <div class="anime-cover">
            <img src="${item.imageUrl}" alt="${item.name}" style="width: 100%; border-radius: 8px;">
          </div>
          <div class="anime-info">
            <h1>${item.name} ${isFavorite ? '⭐' : ''}</h1>
            <div class="tags">
              <span>${item.genre}</span>
              <span>${item.yearStarted}${item.yearEnded ? ' - ' + item.yearEnded : ' - Present'}</span>
            </div>
            <p><strong>Author:</strong> ${item.author}</p>
            <p><strong>Episodes:</strong> ${item.episodes}</p>
            <p><strong>Rating:</strong> ${'★'.repeat(Math.round(item.rating))} (${item.rating}/5)</p>
            <p><strong>Aired:</strong> ${item.yearStarted}${item.yearEnded ? ' to ' + item.yearEnded : ' to Present'}</p>
            
            <div class="action-buttons">
              <a href="/edit/${item.id}">Edit</a>
              <form action="/delete/${item.id}" method="POST" style="display:inline;">
                <button type="submit">Delete</button>
              </form>
              <form action="${isFavorite ? '/unfavorite' : '/favorite'}/${item.id}" method="POST" style="display:inline;">
                <button type="submit" class="${isFavorite ? 'favorite' : ''}">${isFavorite ? 'Unfavorite' : 'Favorite'}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="/items">Back to Anime List</a>
        <a href="/">Back to Home</a>
      </div>
    `);
  });

// Halaman favorit
app.get("/favorites", (req, res) => {
  const favoriteItems = items.filter(item => favorites.includes(item.id));
  
  let itemList = favoriteItems.map(item => 
    `<div class="card anime-card">
      <img src="${item.imageUrl}" alt="${item.name}" class="anime-image">
      <h3>${item.name}</h3>
      <p>${item.genre} - By ${item.author}</p>
      <p>Rating: ${'★'.repeat(Math.round(item.rating))}</p>
      <a href="/items/${item.id}">View</a>
      <form action="/unfavorite/${item.id}" method="POST" style="display:inline;">
        <button type="submit" class="favorite">Unfavorite</button>
      </form>
    </div>`
  ).join("");
  
  res.send(`
    ${style}
    <h1>Your Favorite Anime</h1>
    <div class="anime-grid">${itemList.length ? itemList : '<div>No favorites yet</div>'}</div>
    <a href="/">Back to Home</a>
  `);
});

// Halaman tambah anime 
app.get("/add", (req, res) => {
  res.send(`
    ${style}
    <div class="card" style="max-width: 600px; margin: 0 auto;">
      <h1>Add New Anime</h1>
      <form action="/items" method="POST">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <input type="text" name="name" placeholder="Name" required>
          <input type="text" name="genre" placeholder="Genre" required>
          <input type="text" name="author" placeholder="Author" required>
          <input type="number" name="yearStarted" placeholder="Year Started" required>
          <input type="number" name="yearEnded" placeholder="Year Ended (empty if ongoing)">
          <input type="number" name="episodes" placeholder="Episodes" required>
          <input type="number" name="rating" step="0.1" min="0" max="5" placeholder="Rating (0-5)" required>
        </div>
        <button type="submit" style="margin-top: 15px;">Add</button>
      </form>
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <a href="/">Back to Home</a>
    </div>
  `);
});

// Halaman edit anime 
app.get("/edit/:id", (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).send(`${style}<h1>Item not found</h1><a href='/'>Back to Home</a>`);
  
  res.send(`
    ${style}
    <div class="card" style="max-width: 600px; margin: 0 auto;">
      <h1>Edit ${item.name}</h1>
      <img src="${item.imageUrl}" alt="${item.name}" style="width: 300px; height: 200px; object-fit: cover; margin: 0 auto 20px; display: block; border-radius: 8px;">
      <form action="/items/${item.id}" method="POST">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <input type="text" name="name" value="${item.name}" required>
          <input type="text" name="genre" value="${item.genre}" required>
          <input type="text" name="author" value="${item.author}" required>
          <input type="number" name="yearStarted" value="${item.yearStarted}" required>
          <input type="number" name="yearEnded" value="${item.yearEnded || ''}" placeholder="Leave empty if ongoing">
          <input type="number" name="episodes" value="${item.episodes}" required>
          <input type="number" name="rating" step="0.1" min="0" max="5" value="${item.rating}" required>
        </div>
        <button type="submit" style="margin-top: 15px;">Update</button>
      </form>
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <a href="/items">Back to Anime List</a>
      <a href="/">Back to Home</a>
    </div>
  `);
});

// Tambah ke favorit
app.post("/favorite/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (!favorites.includes(id)) {
    favorites.push(id);
  }
  res.redirect(req.headers.referer || "/items");
});

// Hapus dari favorit
app.post("/unfavorite/:id", (req, res) => {
  const id = parseInt(req.params.id);
  favorites = favorites.filter(itemId => itemId !== id);
  res.redirect(req.headers.referer || "/favorites");
});


// API untuk menambahkan item baru
app.post("/items", (req, res) => {
  const newItem = {
    id: items.length ? Math.max(...items.map(i => i.id)) + 1 : 1,
    name: req.body.name,
    genre: req.body.genre,
    author: req.body.author,
    yearStarted: parseInt(req.body.yearStarted),
    yearEnded: req.body.yearEnded ? parseInt(req.body.yearEnded) : null,
    episodes: parseInt(req.body.episodes),
    rating: parseFloat(req.body.rating),
    imageUrl: `/api/placeholder/300/200?text=${encodeURIComponent(req.body.name)}`
  };
  items.push(newItem);
  res.redirect("/items");
});

// API untuk memperbarui item
app.post("/items/:id", (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).send("Item not found");
  
  const oldName = item.name;
  item.name = req.body.name;
  item.genre = req.body.genre;
  item.author = req.body.author;
  item.yearStarted = parseInt(req.body.yearStarted);
  item.yearEnded = req.body.yearEnded ? parseInt(req.body.yearEnded) : null;
  item.episodes = parseInt(req.body.episodes);
  item.rating = parseFloat(req.body.rating);
  
  // Update image URL if name changed
  if (oldName !== item.name) {
    item.imageUrl = `/api/placeholder/300/200?text=${encodeURIComponent(item.name)}`;
  }
  
  res.redirect("/items");
});

// API untuk menghapus item
app.post("/delete/:id", (req, res) => {
  items = items.filter(i => i.id !== parseInt(req.params.id));
  favorites = favorites.filter(id => id !== parseInt(req.params.id));
  res.redirect("/items");
});

// Bulk import API 
app.post("/api/import", (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: "Expected an array of items" });
  }
  
  try {
    const newItems = req.body.map(item => ({
      id: items.length ? Math.max(...items.map(i => i.id)) + 1 : 1,
      name: item.name,
      genre: item.genre,
      author: item.author,
      yearStarted: parseInt(item.yearStarted) || 2000,
      yearEnded: item.yearEnded ? parseInt(item.yearEnded) : null,
      episodes: parseInt(item.episodes) || 0,
      rating: parseFloat(item.rating) || 0,
      imageUrl: `/api/placeholder/300/200?text=${encodeURIComponent(item.name)}`
    }));
    
    items = [...items, ...newItems];
    res.status(201).json({ message: `${newItems.length} items imported successfully` });
  } catch (err) {
    res.status(400).json({ error: "Invalid data format" });
  }
});

// Export fitur (JSON download)
app.get("/export", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=anime-data.json');
  res.json(items);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});