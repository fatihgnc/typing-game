exports.renderHome = (req, res) => {
    // console.log(1)
    res.render('index.ejs', { 
        title: 'Home',
        redirectMsg: null
    })
}

exports.renderPlay = (req, res) => {
    if(!req.query.username) {
        return res.render('index.ejs', { 
            title: 'Home',
            redirectMsg: 'You should enter a username first!'
        })
    }
    res.render('play.ejs', { title: 'Play' })
}