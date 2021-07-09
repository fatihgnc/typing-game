$(function () {
    const $ctaHeader = $('.cta-header')
    const $ctaButton = $('.cta-btn')
    const $registrationForm = $('.registration')
    const $inputUsername = $registrationForm.find('#registration__username')
    const $registrationSubmitButton = $registrationForm.find('#registration__submit')
    const $registrationStatusMessage = $registrationForm.find('.registration__status-msg')
    const $successMessage = 'Succesfully registered, you will be redirected to game page in 3 seconds...'
    const $failureColor = '#744747'
    const headerToDisplay = 'How fast can you type?'.split('')

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
    function addUser(statusMsg) {
        const $username = $inputUsername.val()

        $.post({
            url: '/user/add',
            method: 'POST',
            data: { username: $username },
            success: (data, status, jqxhr) => {
                statusMsg.text($successMessage)
                statusMsg.css({
                    background: 'gray',
                    opacity: 1
                })
                setTimeout(() => window.location.href = `/play?username=${$username}`, 3000)
            },
            error: (jqxhr, status, err) => {
                const $failureMessage = jqxhr.responseText
                statusMsg.text($failureMessage)
                statusMsg.css({
                    background: $failureColor,
                    opacity: 1
                })
                // console.log(status, jqxhr.responseText, $username)
            }
        })
    }
    
    $registrationSubmitButton.on('click', e => {
        addUser($registrationStatusMessage)
    })
})