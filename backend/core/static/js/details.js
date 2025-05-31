import { books, storeBooks, storeUser, user, fetchBooks, logout, fetchUser } from "../main.js";

// Get the query string from the current URL
const queryString = window.location.search;
const params = new URLSearchParams(queryString);
// const id = params.get("id");
//http://127.0.0.1:8000/bookDetails/1/
const id = window.location.pathname.split('/')[2]; // Get the last part of the URL

// Find the book
const book = books.find(b => b.id === parseInt(id));

// Get container
const container = document.querySelector(".book-cardo");

if (book && container) {
    // Book image section
    const imageDiv = document.createElement("div");
    imageDiv.className = "book-imageo";

    const img = document.createElement("img");
    img.src = book.cover;
    img.alt = "Book Cover";

    imageDiv.appendChild(img);

    // Book info section
    const infoDiv = document.createElement("div");
    infoDiv.className = "book-info";

    const title = document.createElement("h1");
    title.className = "title";
    title.textContent = book.name;

    const author = document.createElement("p");
    author.className = "author";
    author.textContent = `by ${book.author}`;

    const genre = document.createElement("p");
    genre.className = "genre";
    genre.textContent = `Genre: ${book.genre}`;

    const language = document.createElement("p");
    language.className = "language";
    language.textContent = `Language: ${book.language}`;

    const release = document.createElement("p");
    release.className = "release_date";
    release.textContent = `Release date: ${formatDate(book.releaseDate)}`;

    const desc = document.createElement("p");
    desc.className = "description";
    desc.textContent = book.description;

    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "buttons";

    const hasUserBorrowed = user.userBooks.some(rb => rb.book_id === book.id);

	let button;
	if (hasUserBorrowed) {
		button = createUnborrowButton(book);
	} else if (!book.isAvailable) {
		button = createUnavailableButton();
	} else {
		button = createBorrowButton(book);
	}

	buttonsDiv.appendChild(button);

    // Append all info
    infoDiv.appendChild(title);
    infoDiv.appendChild(author);
    infoDiv.appendChild(genre);
    infoDiv.appendChild(language);
    infoDiv.appendChild(release);
    infoDiv.appendChild(desc);
	
	if (user && user.is_admin) {
		const adminbuttons = document.createElement("div");
		adminbuttons.className = "buttons";
		const editBtn = document.createElement("button");
		editBtn.className = "btn green"; // Use a different style class if desired
		editBtn.textContent = "Edit";
		editBtn.onclick = () => {
			window.location.href = `/addBook/${book.id}`; // Define this function to handle editing
		};


		const deleteBtn = document.createElement("button");
		deleteBtn.className = "btn red"; // Use a different style class if desired
		deleteBtn.textContent = "Delete";
		deleteBtn.onclick = () => {
			$.ajax({
					url: `/api/books/${book.id}/`,
					type: 'DELETE',
					success: function(data) {
						if (data.status === 'success') {
							fetchBooks().then(function() {
								storeBooks();
								fetchUser();
								window.location.href = "/search/"
							});
						} else {
							alert('Error: ' + (data.message || 'Unknown error'));
						}
					},
					error: function(xhr, status, error) {
						alert("An error occurred while deleting the book.");
					}
				});

		};

		adminbuttons.appendChild(editBtn);
		adminbuttons.appendChild(deleteBtn);
		buttonsDiv.appendChild(adminbuttons);
	}
    
	infoDiv.appendChild(buttonsDiv);
	
    // Append to container
    container.appendChild(imageDiv);
    container.appendChild(infoDiv);
} else {
    container.textContent = "Book not found.";
}

// Helper: Format Date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
}

// Helper: borrow book
// async function borrowBook(bookId) {
//     const book = books.find(b => b.id === bookId);
//     book.is_available = false;
//     try {
//         const response = await fetch(`/api/books/update/${bookId}/`, {
//             method: 'PUT',
//             headers: { // convert the data i send to json string
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(book)
//         });

//         const data = await response.json();

//         if (response.ok && data.status === 'success') {
//             // Send POST request to record the borrow
//             const borrowResponse = await fetch('/api/borrow/', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     user_id: user.id, // assuming user is defined globally
//                     book_id: bookId
//                 })
//             });

//             const borrowData = await borrowResponse.json();

//             if (borrowResponse.ok && borrowData.message === 'Book borrowed successfully') {
//                 await fetchBooks();
//                 storeBooks();
//                 // window.location.href = "profile/";
//             } else {
//                 console.log('Borrow Error: ' + (borrowData.error || 'Unknown error'));
//             }
//         } else {
//             console.log('Error: ' + (data.message || 'Unknown error'));
//         }
//     } catch (error) {
//         console.log('An error occurred while updating the book: ' + error.message);
//     }
// }

function borrowBook(bookId) {
	const book = books.find(b => b.id === bookId);
	
	book.is_available = false;
    return $.ajax({
		url: `/api/books/update/${bookId}/`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(book)
    })
    .then(function(data) {
		if (data.status !== 'success') throw new Error(data.message || 'Update failed');
        return $.ajax({
			url: '/api/borrow/',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
				user_id: user.id,
                book_id: bookId
            })
        });
    })
    .then(function(borrowData) {
		if (borrowData.message !== 'Book borrowed successfully') {
			throw new Error(borrowData.error || 'Borrow failed');
        }
		fetchUser();
		// user.userBooks.push({ book_id: bookId, status: 'borrowed' });
        return fetchBooks();
    })
    .then(function() {
        storeBooks();
        // window.location.href = "profile/";
    })
    .catch(function(error) {
        console.error('Error:', error.message);
    });
}

function unborrowBook(bookId) {
    const book = books.find(b => b.id === bookId);
	
	book.is_available = true;
    return $.ajax({
		url: `/api/books/update/${bookId}/`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(book)
    })
    .then(() => {
		return $.ajax({
			url: '/api/unborrow/',
            type: 'DELETE',
            contentType: 'application/json',
            data: JSON.stringify({
				user_id: user.id,
                book_id: bookId
            })
        });
    })
    .then((res) => {
		if (res.status !== 'success') throw new Error(res.message || 'Unborrow failed');
		// user.userBooks = user.userBooks.filter(b => b.id !== bookId);
		fetchUser();
        return fetchBooks();
    })
    .then(() => {
        storeBooks();
    })
    .catch((error) => {
        console.error('Unborrow Error:', error.message);
    });
}


function createBorrowButton(book) {
	const button = document.createElement("button");
	button.className = "btn primary";
	button.textContent = "Borrow";

	button.onclick = () => {
		borrowBook(book.id).then(() => {
			// Replace with Unborrow button after borrowing
			const newBtn = createUnborrowButton(book);
			button.replaceWith(newBtn);
		});
		button.disabled = true;
		button.textContent = "Not Available";
		button.style.backgroundColor = "rgb(150, 150, 150)";
		button.style.cursor = "not-allowed";
	};

	return button;
}

function createUnborrowButton(book) {
	const button = document.createElement("button");
	button.className = "btn gray";
	button.textContent = "Unborrow";

	button.onclick = () => {
		unborrowBook(book.id).then(() => {
			// Replace with Borrow button after unborrowing
			const newBtn = createBorrowButton(book);
			button.replaceWith(newBtn);
		});
		button.disabled = true;
		button.textContent = "Borrow";
		button.style.backgroundColor = "rgb(10,10,10)";
		button.style.cursor = "pointer";
	};

	return button;
}

function createUnavailableButton() {
	const button = document.createElement("button");
	button.className = "btn primary";
	button.textContent = "Not Available";
	button.disabled = true;
	button.style.backgroundColor = "rgb(150, 150, 150)";
	button.style.cursor = "not-allowed";
	return button;
}


const authButtons = document.getElementById('auth-buttons');

if (user && authButtons) {
    authButtons.innerHTML = `<button class="logout-btn" id="logoutBtn">Logout</button>`;
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        logout(authButtons)
    });
} else {
    authButtons ? authButtons.innerHTML = `
                <a href="../signup" class="signup-btn">Sign Up</a>
                <a href="../login" class="signin-btn">Sign In</a>
            `: null;
}