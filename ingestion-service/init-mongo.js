db.createUser({
  user: "myadmin",
  pwd: "mypassword",
  roles: [
    {
      role: "root",
      db: "canon",
    },
  ],
});
