$(function () {
    const localUsername = localStorage.getItem('username')
    const menuButtons = document.querySelector('.menu-buttons')
    const playButton = document.querySelector('.menu-buttons a:nth-child(2)')

    if (localUsername) {
        const logoutAnchor = document.createElement('a')
        const textNode = document.createTextNode('çıkış yap')
        logoutAnchor.appendChild(textNode)
        logoutAnchor.setAttribute('href', '/?redirectMsg=başarıyla çıkış yapıldı!')
        menuButtons.appendChild(logoutAnchor)
        logoutAnchor.addEventListener('click', () => localStorage.removeItem('username'))
        playButton.setAttribute('href', `/play?username=${localUsername}`)
    } else {
        playButton.setAttribute('href', '/play')
    }
})