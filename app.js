require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { compareSync } = require("bcrypt");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

app.use(
	session({
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/minorPDB");

const userSchema = new mongoose.Schema({
	username: String,
	password: String,
	role: {
		type: String,
		default: "patient",
	},
	name: String,
	aadharNo: String,
	dob: String,
	gender: String,
	contactNumber: Number,
	email: String,
	bloodGroup: String,
	height: Number,
	weight: Number,
	healthCondition: String,
	diagnoses: [],
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var role;

app.get("/", (req, res) => {
	res.render("home", { role: role });
});

app.get("/login", (req, res) => {
	res.render("login", { role: role });
});

app.get("/login-doctor", (req, res) => {
	res.render("login-doctor", { role: role });
});

app.get("/register", (req, res) => {
	res.render("register", { role: role });
});

// app.get("/secrets", (req, res) => {
// 	if (req.isAuthenticated()) {
// 		User.findById(req.user.id).then((foundUser) => {
// 			if (foundUser) {
// 				res.render("secrets", { userWithSecret: foundUser });
// 			}
// 		});
// 	} else {
// 		res.redirect("/login");
// 	}
// });

app.get("/diagnose-history", (req, res) => {
	if (req.isAuthenticated()) {
		User.findById(req.user.id).then((foundUser) => {
			if (foundUser) {
				res.render("diagnose-history", {
					diagnoses: foundUser.diagnoses,
					role: role,
				});
			}
		});
	} else {
		res.redirect("/login");
	}
});

app.get("/diagnose-history/:date", (req, res) => {
	if (req.isAuthenticated()) {
		User.findById(req.user.id).then((foundUser) => {
			if (foundUser) {
				const temp = _.lowerCase(req.params.date);
				foundUser.diagnoses.forEach((diagnose) => {
					const curr = _.lowerCase(diagnose.date);
					if (curr === temp) {
						res.render("diagnoses", {
							diagnose: diagnose,
							role: role,
							foundUser: foundUser,
						});
					}
				});
			}
		});
	} else {
		res.redirect("/login");
	}
});

app.get("/edit-basic-data", (req, res) => {
	if (role === "doctor" && !req.isAuthenticated()) {
		res.redirect("home-doctor");
	}
	if (req.isAuthenticated()) {
		User.findById(req.user.id).then((foundUser) => {
			if (foundUser) {
				res.render("edit-basic-data", {
					userWithSecret: foundUser,
					role: role,
				});
			}
		});
	} else {
		res.redirect("/login");
	}
});

app.get("/new-diagnose", (req, res) => {
	if (role === "doctor") {
		res.render("new-diagnose", { role: role });
	} else {
		res.redirect("/login-doctor");
	}
});

app.get("/home-doctor", (req, res) => {
	if (role === "doctor") {
		res.render("home-doctor", { role: role });
	} else {
		res.redirect("/login-doctor");
	}
});

app.get("/submit", (req, res) => {
	if (req.isAuthenticated()) {
		res.render("submit");
	} else {
		res.redirect("/login");
	}
});

app.get("/display-data", (req, res) => {
	if (role === "doctor" && !req.isAuthenticated()) {
		res.redirect("home-doctor");
	}
	if (req.isAuthenticated() || role === "doctor") {
		User.findById(req.user.id)
			.then((foundUser) => {
				if (foundUser) {
					res.render("display-data", { role: role, foundUser: foundUser });
				}
			})
			.catch((err) => {
				console.log(err.message);
			});
	} else {
		res.redirect("/login");
	}
});

app.post("/edit-basic-data", (req, res) => {
	if (req.isAuthenticated()) {
		User.findById(req.user.id)
			.then((foundUser) => {
				if (foundUser) {
					if (req.body.name !== "") foundUser.name = req.body.name;
					if (req.body.aadharNo !== "") foundUser.aadharNo = req.body.aadharNo;
					if (req.body.dob !== "") foundUser.dob = req.body.dob;
					if (req.body.gender !== "") foundUser.gender = req.body.gender;
					if (req.body.contactNo !== "")
						foundUser.contactNumber = req.body.contactNo;
					if (req.body.email !== "") foundUser.email = req.body.email;
					if (req.body.bloodGroup !== "")
						foundUser.bloodGroup = req.body.bloodGroup;
					if (req.body.height !== "") foundUser.height = req.body.height;
					if (req.body.weight !== "") foundUser.weight = req.body.weight;
					if (req.body.healthCondition !== "")
						foundUser.healthCondition = req.body.healthCondition;

					foundUser.save().then(() => {
						res.redirect("/display-data");
					});
				}
			})
			.catch((err) => {
				console.log(err.message);
			});
	} else {
		res.redirect("/login");
	}
});

app.post("/submit", (req, res) => {
	const submittedSecret = req.body.secret;

	User.findById(req.user.id)
		.then((foundUser) => {
			if (foundUser) {
				// foundUser.secret = submittedSecret;
				foundUser.secret.push(submittedSecret);
				foundUser.save().then(() => {
					res.redirect("/secrets");
				});
			}
		})
		.catch((err) => {
			console.log(err.message);
		});
});

app.get("/logout", function (req, res, next) {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
		role = "";
		res.redirect("/");
	});
});

app.post("/register", (req, res) => {
	User.register(
		{ username: req.body.username },
		req.body.password,
		function (err, users) {
			if (err) {
				console.log(err);
				res.redirect("/register");
			} else {
				passport.authenticate("local")(req, res, () => {
					res.redirect("/");
				});
			}
		}
	);
});

app.post("/login", (req, res) => {
	const user = new User({
		username: req.body.username,
		password: req.body.password,
	});

	req.login(user, (err) => {
		if (err) {
			console.log(err);
		} else {
			passport.authenticate("local")(req, res, () => {
				res.redirect("/display-data");
			});
		}
	});
});

app.post("/login-doctor", (req, res) => {
	username = req.body.username;
	password = req.body.password;

	if (username === "doctor1") {
		if (password === "doc123") {
			role = "doctor";
			res.redirect("/home-doctor");
		} else {
			console.log("Incorrect Password");
			res.redirect("/login-doctor");
		}
	} else {
		console.log("Username not found");
		res.redirect("/login-doctor");
	}
});

app.post("/new-diagnose", (req, res) => {
	if (role === "doctor") {
		User.findById(req.user.id).then((foundUser) => {
			if (foundUser) {
				const diagnose = {
					date: req.body.date,
					diseaseInfo: req.body.diseaseInfo,
					docName: req.body.docName,
					medicine: req.body.medicine,
					remark: req.body.remark,
					// uploaded files as object
					// doctor details as object
				};

				foundUser.diagnoses.push(diagnose); // need to fetch patient detailss

				foundUser.save().then(() => {
					res.redirect("/diagnose-history");
				});
				// res.redirect("/diagnose-history");
			}
		});
	} else {
		res.redirect("/login-doctor");
	}
});

app.listen(3000, () => {
	console.log("Server started on port 3000.");
});
