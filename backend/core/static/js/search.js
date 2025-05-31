import { user, books, logout } from "../main.js";
console.log(user, books);


let inputsearch = document.getElementById("search");
let inputcategory = document.getElementById("category");
let inputavailability = document.getElementById("availability");
let inputsort = document.getElementById("sort");
const container = document.querySelector(".book_search .book-section .book-grid");

// Function to render book cards
function renderBooks(bookArray) {
    container.innerHTML = ""; // Clear old content

    bookArray.forEach((book) => {
        const maindiv = document.createElement("div");
        maindiv.classList.add("book-card");

        // Image
        const imagediv = document.createElement("div");
        imagediv.classList.add("book-image");
        const image = document.createElement("img");
        image.src = book.cover;
        image.alt = `${book.name} cover`;
        imagediv.appendChild(image);
        maindiv.appendChild(imagediv);

        // Availability
        const avalibdiv = document.createElement("div");
        avalibdiv.innerHTML = book.isAvailable ? "Available" : "Not Available";
        avalibdiv.classList.add(book.isAvailable ? "avaliable" : "not-avaliable");
        maindiv.appendChild(avalibdiv);

        // Title
        const titlediv = document.createElement("h3");
        titlediv.innerHTML = book.name;
        maindiv.appendChild(titlediv);

        // Description
        const p1 = document.createElement("p");
        p1.innerHTML = book.description;
        maindiv.appendChild(p1);

        // Author
        const p2 = document.createElement("p");
        p2.innerHTML = `<strong>Author:</strong> ${book.author}`;
        maindiv.appendChild(p2);

        // Learn more link
        const link = document.createElement("a");
        link.classList.add("learn-more");
        link.href = `../bookDetails/${book.id}`;
        link.innerHTML = "Learn More";
        maindiv.appendChild(link);

        container.appendChild(maindiv);
    });
}



// Show all books on first load
renderBooks(books);


function filterBooks() {
    const nameValue = inputsearch.value.trim().toLowerCase();
    const categoryValue = inputcategory.value.toLowerCase();
    const availvalue = inputavailability.value.toLowerCase();

    const filtered = books.filter((book) => {
        const matchesName = book.name.toLowerCase().includes(nameValue) || book.author.toLowerCase().includes(nameValue);
        const matchesCategory = categoryValue === "" || book.genre.toLowerCase() === categoryValue;
        const matchesAvail = book.isAvailable;

        if (availvalue === "") {
            return matchesName && matchesCategory;
        } else if (availvalue === "available") {
            return matchesName && matchesCategory && matchesAvail;
        } else {
            return matchesName && matchesCategory && !matchesAvail;
        }
    });
    // Sorting
    const sortValue = inputsort.value;
    if (sortValue === "title") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortValue === "author") {
        filtered.sort((a, b) => a.author.localeCompare(b.author));
    } else if (sortValue === "latest") {
        filtered.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    }
    renderBooks(filtered);
}

inputsearch.addEventListener("input", filterBooks);
inputcategory.addEventListener("change", filterBooks);
inputavailability.addEventListener("change", filterBooks);
inputsort.addEventListener("change", filterBooks);






const authButtons = document.getElementById('auth-buttons');
console.log(authButtons);
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





