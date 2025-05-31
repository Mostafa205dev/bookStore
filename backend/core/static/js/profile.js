import { user, books, logout } from "../main.js";

async function loadProfileAndBooks() {
	try {
		const [profileRes, booksRes] = await Promise.all([
			$.ajax({
				url: "/profilereq/",
				method: "GET",
				dataType: "json"
			}),
			$.ajax({
				url: "/api/books/",
				method: "GET",
				dataType: "json"
			})
	]);

		
        const profile = await profileRes;
        const booksRaw = await booksRes;
        const books = JSON.parse(booksRaw.books);
		
        if (profile.status === "error") {
			alert("Not logged in");
            window.location = "/login";
            return;
        }
		
        // Clear existing profile header if exists
        const profileHeader = document.querySelector('.profile-header');
        profileHeader.innerHTML = ''; 
		
        const profilePic = document.createElement('img');
        profilePic.src = "/static/images/profile.png";
        profilePic.alt = 'Profile Picture';
        profilePic.classList.add('profile-pic');
		
        const profileInfo = document.createElement('div');
        profileInfo.classList.add('profile-info');
		
        const userName = document.createElement('h2');
        userName.textContent = `${profile.first_name} ${profile.last_name}`;
		
        const userEmail = document.createElement('p');
        userEmail.textContent = profile.email;
		
        const joinedSince = new Date(profile.joined_date);
        const formattedDate = joinedSince.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        const userMemberSince = document.createElement('p');
        userMemberSince.textContent = `Member since ${formattedDate}`;
		
        const userRole = document.createElement('p');
        userRole.textContent = `Role: ${profile.is_admin ? 'Admin' : 'User'}`;
		
        profileInfo.append(userName, userEmail, userMemberSince, userRole);
        profileHeader.append(profilePic, profileInfo);
		
        // Render Borrowed Books
        const container = document.querySelector('.book-grid');
        container.innerHTML = ""; // Clear old book cards
		
        profile.userBooks.forEach(entry => {
			const bookObj = books.find(b => b.pk === entry.book_id);
            if (!bookObj) return;
			
            const book = bookObj.fields;
            const card = document.createElement('div');
            card.className = 'book-card';
			
            card.innerHTML = `
			<div class="book-image">
			<img src="${book.cover}" alt="${book.name} cover">
			</div>
			<h3>${book.name}</h3>
			<p>Due: ${entry.return_date}</p>
			<p>Status: ${entry.status}</p>
			<a href="/bookDetails/${entry.book_id}" class="learn-more">
			${entry.status === 'pending' ? 'Renew' : entry.status === 'overdue' ? 'Pay Fine' : 'Details'}
			</a>
            `;
            container.appendChild(card);
        });
		
    } catch (err) {
		console.error("Error loading profile/books:", err);
        alert("Something went wrong loading your profile.");
    }
}

loadProfileAndBooks();

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