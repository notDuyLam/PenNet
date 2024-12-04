const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// config hbs
const hbs = require('./config/handlebarsConfig');
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');


const user = {
    id: 1,
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmjxkzji2G1q-FKeA842yBCrz5xOW_HpfdOQ&s",
    cover_photo: "https://event.danang.vn/wp-content/uploads/2023/06/background-gala-dinner-dep-19-800x377.jpg",
    name: "Nguyễn Văn A",
    followers: [32,47],
    following: [12,13],
    posts: 4
}

app.get('/', (req, res) => {
    // res.send('Hello World!');
    res.render('home', {user: user});
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});