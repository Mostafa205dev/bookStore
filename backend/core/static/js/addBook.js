import { user, books, storeBooks, fetchBooks, loadBooks,logout } from "../main.js"

let form = document.querySelector(".form-container")
let nametext = document.querySelector("#bookname")
let authortext = document.querySelector("#authorname")
let categorytext = document.querySelector("#category")
let desc = document.querySelector("#desc")
const input = document.getElementById('coverInput');
const preview = document.getElementById('coverPreview');

const urlParams = new URLSearchParams(window.location.search);

let bookId = window.location.pathname.split('/')[2]; // Get the last part of the URL

const confirmBtn = document.querySelector(".submit-btn")
form.addEventListener("submit", function (evt) {
    evt.preventDefault()
    addBook()
})

input.addEventListener('change', function () {
    const file = this.files[0];
    const reader = new FileReader()

    reader.onload = function () {
        const base64 = reader.result

        preview.src = base64
    }
    if (file) {
        preview.style.display = "block";
        reader.readAsDataURL(file)
    }
});

if (bookId) {
    const book = books.find(b => b.id == bookId);
    if (book) {
        nametext.value = book.name;
        authortext.value = book.author;
        categorytext.value = book.genre;
        desc.value = book.description;
        preview.src = book.cover;
        preview.style.display = "block";
    }  
}


// async function addBook() {

//     // Create book object with consistent field names
//     let book = {
//         name: nametext.value,
//         author: authortext.value,
//         year: 1925,
//         genre: categorytext.value,
//         cover: preview.src,
//         description: desc.value,
//         rating: 0,
//         reviews: 0,
//         language: "English",
//         release_date: "1925-04-10",  // Changed to match backend
//         is_available: true,          // Changed to match backend
//         history: {}
//     }
//     // Validation (using correct variable name)
//     if (!book.name || !book.author || !book.genre || !book.description) {
//         alert('Please fill in all required fields');
//         return;
//     }
    
//     if (bookId > 0) {
//         book.id = bookId;
//         try {
//             const response = await fetch(`/api/books/update/${bookId}/`, {
//                 method: 'PUT',
//                 headers: { // convert the data i send to json string
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(book)
//             });

//             const data = await response.json();

//             if (response.ok && data.status === 'success') {
//                 await fetchBooks();
//                 storeBooks();
//                 window.location.href = "/listAdmin";
//             } else {
//                 console.log('Error: ' + (data.message || 'Unknown error'));
//             }
//         } catch (error) {
//             console.log('An error occurred while updating the book: ' + error.message);
//         }
//     } else if(bookId == 0) {
//         try {
//             const response = await fetch('/api/books/add/', {
//                 method: 'POST',
//                 headers: { // convert the data i send to json string
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(book)
//             });

//             const data = await response.json();

//             if (response.ok && data.status === 'success') {
//                 await fetchBooks();
//                 storeBooks();
//                 window.location.href = "/listAdmin";
//             } else {
//                 alert('Error: ' + (data.message || 'Unknown error'));
//             }
//         } catch (error) {
//             alert('An error occurred while adding the book: ' + error.message);
//         }
//     }


// }


async function addBook() {
    // Create book object with consistent field names
    let book = {
        name: nametext.value,
        author: authortext.value,
        year: 1925,
        genre: categorytext.value,
        cover: preview.src,
        description: desc.value,
        rating: 0,
        reviews: 0,
        language: "English",
        release_date: "1925-04-10",  
        is_available: true,          
        history: {}
    };
    
    // Validation 
    if (!book.name || !book.author || !book.genre || !book.description) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (bookId > 0) {
        book.id = bookId;
        try {
            $.ajax({
                url: `/api/books/update/${bookId}/`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(book),
                success: function(data) {
                    if (data.status === 'success') {
                        fetchBooks().then(function() {
                            storeBooks();
                            window.location.href = "/listAdmin";
                        });
                    } else {
                        console.log('Error: ' + (data.message || 'Unknown error'));
                    }
                },
                error: function(xhr, status, error) {
                    console.log('An error occurred while updating the book: ' + error);
                }
            });
        } catch (error) {
            console.log('An error occurred while updating the book: ' + error.message);
        }
    } else if (bookId == 0) {
        try {
            $.ajax({
                url: '/api/books/add/',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(book),
                success: function(data) {
                    if (data.status === 'success') {
                        fetchBooks().then(function() {
                            storeBooks();
                            window.location.href = "/listAdmin";
                        });
                    } else {
                        alert('Error: ' + (data.message || 'Unknown error'));
                    }
                },
                error: function(xhr, status, error) {
                    alert('An error occurred while adding the book: ' + error);
                }
            });
        } catch (error) {
            alert('An error occurred while adding the book: ' + error.message);
        }
    }
}


const authButtons = document.getElementById('auth-buttons');
if (user && authButtons) {
    authButtons.innerHTML = `<button class="logout-btn" id="logoutBtn">Logout</button>`;
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        logout(authButtons);
    });
} else {
    authButtons ? authButtons.innerHTML = `
                <a href="../../signup" class="signup-btn">Sign Up</a>
                <a href="../../login" class="signin-btn">Sign In</a>
            `: null;
}