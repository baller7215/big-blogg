import express from "express";
import bodyParser from "body-parser";
import jsdom from "jsdom";
import jquery from "jquery";

const app = express();
const port = 3000;
const dom = new jsdom.JSDOM("");
const jqueryApp = jquery(dom.window);

class Posts {
    constructor(title, contents, id) {
        this.title = title;
        this.contents = contents
        this.date = 0
        this.id = id
    }
}

let posts = [];
let update = true;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

function updatePosts(req, res, next) {
    if (Object.keys(req.body).length > 0 && req.body['inputTitle'] != '' && req.body['postContents'] != '') {
        const postIndex = posts.indexOf(posts.find(element => element.id == parseInt(req.body['postId'])));
        const newPost = new Posts(req.body['inputTitle'], req.body['postContents'], req.body['postId']);
        if (postIndex < 0) {
            posts.push(newPost);
        }
        else {
            posts = [
                ...posts.slice(0, postIndex),
                newPost,
                ...posts.slice(postIndex + 1)
            ];
        }
        update = true;
    } else {
        update = false;
    }
    
    next();
}

app.get("/", (req, res) => {
    res.render("index.ejs", {
        postList : posts
    });
});


app.get("/compose", (req, res) => {
    res.render("compose.ejs", {
        postId : posts.length + 1
    });
});

app.get("/edit/:postId", (req, res) => {
    const curPostId = req.params.postId;
    const post = posts.find((element) => element.id == curPostId)

    if (post) {
        res.render("compose.ejs", {
            editPost : post,
            postId : curPostId
        });
    }
})

app.use(updatePosts);

app.post("/submit", (req, res) => {
    if (update) {
        res.render("index.ejs", {
            postList : posts
        });
    } else {
        res.render("compose.ejs", {
            postId : posts.length + 1
        });
    }
})

app.post("/delete", function(req, res, next) {
    const postIndex = posts.indexOf(posts.find(element => element.id == parseInt(req.body['postId'])));
    // console.log(`post index: ${postIndex}`)
    deletePost(postIndex);
    next(); {

    }
    res.render("index.ejs", {
        postList : posts
    })
})

function deletePost(postIndex) {
    // console.log('delete post');
    posts = [
        ...posts.slice(0, postIndex),
        ...posts.slice(postIndex + 1)
    ];

    // decrease the post id for the posts that come after the deleted post
    // console.log(posts)
    for (let i = postIndex; i < posts.length; i++) {
        posts[i].id -= 1;
    }
    // console.log(posts)
}



app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
