$(function () {
    const $ctaHeader = $('.cta-header')
    const $ctaButton = $('.cta-btn')
    const $registrationForm = $('.registration')
    const $inputUsername = $registrationForm.find('#registration__username')
    const $registrationSubmitButton = $registrationForm.find('#registration__submit')
    const $registrationStatusMessageElem = $registrationForm.find('.registration__status-msg')
    const $redirectMsgSpan = $('.redirect-msg')
    const $successMessage = 'Succesfully registered, you will be redirected to game page in 3 seconds...'
    const $failureColor = '#744747'
    const headerToDisplay = 'How fast can you type?'.split('')

    if ($redirectMsgSpan) {
        setTimeout(() => $redirectMsgSpan.hide(), 3000)
    }

    function typeWriterAnimation(header) {
        let i = 0
        setInterval(() => {
            $ctaHeader.append(header[i])
            i++

            if (i > header.length) {
                setTimeout(() => {
                    $ctaHeader.empty()
                    i = 0
                }, 2000)
            }

        }, 250)
    }

    typeWriterAnimation(headerToDisplay)

    $ctaButton.on('click', e => {
        e.preventDefault()

        $registrationForm.css('display', 'block')
    })

    // ajax call to /user/add
    function addUser(statusMsgElem) {
        const $username = $inputUsername.val()

        $.post({
            url: '/user/add',
            method: 'POST',
            data: { username: $username },
            success: (data, status, jqxhr) => {
                const currUser = localStorage.getItem('username')

                if(!currUser) {
                    localStorage.setItem('username', $username)
                } else {
                    statusMsgElem.text('you should log out first')
                    statusMsgElem.css({
                        background: $failureColor,
                        display: 'block'
                    })
                    
                    return
                }
                
                // console.log(status)
                statusMsgElem.text($successMessage)
                statusMsgElem.css({
                    background: 'gray',
                    display: 'block'
                })

                setTimeout(() => window.location.href = `/play?username=${$username}`, 3000)
            },
            error: (jqxhr, status, err) => {
                // console.log(status)
                const $failureMessage = jqxhr.responseText
                statusMsgElem.text($failureMessage)
                statusMsgElem.css({
                    background: $failureColor,
                    display: 'block'
                })
            }
        })
    }

    $registrationSubmitButton.on('click', e => {
        e.preventDefault()
        addUser($registrationStatusMessageElem)
        if ($registrationStatusMessageElem.text()) {
            setTimeout(() => $registrationStatusMessageElem.css('display', 'none'), 3000)
        }
    })
})