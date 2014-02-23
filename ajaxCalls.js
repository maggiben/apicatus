// Create
$.post("/user", {username: "admin", password: "admin"}).then(function(r){console.log(r)})
// read
$.get("/user").then(function(r){console.log(r)})
// update
$.ajax({url: "/user", data: {email: "caca@caca.com"}, type: 'put'}).then(function(r){console.log(r)})
// delete
$.ajax({url: "/users", type: "delete"}).then(function(r){console.log(r)})

// ABM
$.post("/user/signin", {username: "admin", password: "admin"}).then(function(r){console.log(r)})


// DIGESTORS

// signin
$.post("/user/signin", {username: "admin", password: "admin"}).then(function(r){console.log(r)})
// read
$.get("/digestors").then(function(r){console.log(r)})
// update

// delete
$.ajax({url: "/digestors", type: "delete"}).then(function(r){console.log(r)})

