// signup.js
import { user, storeUser, loadUser, hashPassword } from "../main.js";

const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const form = document.querySelector("form");

const emailInput = document.getElementById("email");
const passInput = document.querySelectorAll("input[type='password']")[0];
const confirmInput = document.querySelectorAll("input[type='password']")[1];
const roleSelect = document.getElementById("sel");


 document.getElementById("signupForm").addEventListener("submit", function (e) {
            e.preventDefault();

            const first_name = document.getElementById("first-name").value;
            const last_name = document.getElementById("last-name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("pass").value;
            const confirmPass = document.getElementById("confirm-pass").value;
            const role = document.getElementById("sel").value;

            if (password !== confirmPass) {
                alert("❌ Passwords do not match!");
                return;
            }
			if (password.length < 8) {
				alert("❌ Password must be at least 8 characters long!");
				return;
			}
			if (!password.includes("#") && !password.includes("@") && !password.includes("$")) {
				alert("❌ Password must contain at least one special character (#, @, $)!");
				return;
			}


			const fileInput = document.getElementById("profile-pic");
			let profilePicBase64 = "";

if (fileInput && fileInput.files && fileInput.files[0]) {
	const reader = new FileReader();
	reader.onload = function (e) {
		profilePicBase64 = e.target.result;

		$.ajax({
			url: "/signup/",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify({
				first_name: first_name,
				last_name: last_name,
				email: email,
				profile_pic: profilePicBase64,
				password: password,
				role: role
			}),
			success: function(data) {
				const responseDiv = $("#response");
				if (data.status === "success") {
					responseDiv.text("✅ Account created successfully!").css("color", "green");
					window.location.href = "/login/"
				} else {
					responseDiv.text("❌ " + data.message).css("color", "red");
				}
			},
			error: function(xhr, status, error) {
				$("#response").text("❌ Error: " + error).css("color", "red");
			}
		});
		};
		reader.readAsDataURL(fileInput.files[0]);
		} else {
			// No file selected, send an empty string
			$.ajax({
				url: "/signup/",
				method: "POST",
				contentType: "application/json",
				data: JSON.stringify({
					first_name: first_name,
					last_name: last_name,
					email: email,
					profile_pic: profilePicBase64,
					password: password,
					role: role
				}),
				success: function(data) {
				const responseDiv = $("#response");
					if (data.status === "success") {
						responseDiv.text("✅ Account created successfully!").css("color", "green");
						window.location.href = "/login/"
					} else {
						responseDiv.text("❌ " + data.message).css("color", "red");
					}
				},
				error: function(xhr, status, error) {
					$("#response").text("❌ Error: " + error).css("color", "red");
				}
			});
		}

        });