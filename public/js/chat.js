const socket = io()


// Elements
const $messageForm = document.getElementById('message-form')
const $messageFormInput = $messageForm.querySelectorAll('input')[0]
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Template
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New messsge element
    const $newMessage = $messages.lastElementChild

    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible Height
    const visibleHeight = $messages.offsetHeight

    // Height of message container
    const containerHeight = $messages.scrollHeight

    // How far have I scroll
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight - scrollOffset < 20) {   // containerHeight - newMessageHeight <= scrollOffset
        $messages.scrollTop = $messages.scrollHeight
    }
    console.log(containerHeight - newMessageHeight)
}

socket.on('message', (serverMessage) => {
    console.log(serverMessage)
    const html = Mustache.render($messageTemplate, {
        username: toTitleCase(serverMessage.username),
        message: serverMessage.text,
        createdAt: moment(serverMessage.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render($locationMessageTemplate, {
        username: toTitleCase(message.username),
        url: message.url,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    users = users.map((user) => toTitleCase(user.username))
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // Disable button
    $messageFormButton.setAttribute('disabled', 'disabled')

    let clientMessage = e.target.elements.message.value

    socket.emit('userMessage', clientMessage, (error) => {

        // Enable button and remove input value
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        
        if (error) {
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    // Disable Button
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        let { latitude, longitude } = position.coords

        socket.emit('sendLocation', { latitude, longitude }, () => {

            // Enable Button
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})


// adding 'Typing Feature'
const sendTypingResponse = () => {
    let typedText = $messageFormInput.value
    if (typedText.length) {
        console.log(typedText)
        return socket.emit('typing-sent', true)
    }
    console.log('empty text')
    socket.emit('typing-sent', false)
}

$messageFormInput.addEventListener('input', () => {

    sendTypingResponse()
})

$messageForm.addEventListener('submit', (e) => {

    setTimeout(() => sendTypingResponse(), 100)
})

socket.on('typing-recieved', (isUserTyping, username) => {
    username = toTitleCase(username)
    if (isUserTyping) {
        // console.log(isUserTyping)
        return $messageFormInput.setAttribute('placeholder', `${username} is typing...`)
    }
    $messageFormInput.setAttribute('placeholder', 'Message')
})






socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})








// Utility Functions
const toTitleCase = (str) => {
    return str.replace(
      /\w\S*/g,
      (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }