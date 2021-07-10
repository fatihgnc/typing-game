const closeIcon = $('.close-menu-icon')
const menu = $('.menu')
const menuIcon = $('.menu-icon')

$(document).ready(() => {
    // opening menu
    menuIcon.on('click', e => {
        e.preventDefault()

        menu.css('display', 'flex')
    })

    // closing menu
    closeIcon.on('click', e => {
        e.preventDefault()

        menu.css('display', 'none')
    })
})