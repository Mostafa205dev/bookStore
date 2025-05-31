// login.js
import { user, loadUser, storeUser, checkPassword, fetchUser} from "../main.js";

const form = document.querySelector("form");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("pass");

form.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("pass").value;

		$.ajax({
			url: "/login/",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify({
				email: email,
				password: password
			}),
			success: function(data) {
				if (data.status === "success") {
					let reader_id = data.reader_id;

					fetchUser().then(status => {
						if(status){
							window.location.href = "/profile/";
						}
					});
				} else {
					alert("❌ Login failed: " + data.message);
				}
			},
			error: function(xhr, status, error) {
				alert("❌ Error: " + error);
			}
		});

    });
