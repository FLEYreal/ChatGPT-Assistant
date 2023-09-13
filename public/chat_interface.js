// Connect to lib
const socket = io.connect();

// Get Object from hidden span with id "env", it contains OBJECT with valuable data
// (which isn't valuable enough to hide it)
const env = JSON.parse(document.getElementById('env').textContent.trim())

const lang = JSON.parse(document.getElementById('lang').textContent.trim())

let last_gpt_message = '';

// Can user send message
let sendMessage = true;

// Get basic tags to work with
const form = document.querySelector('.send-message-form')
const input = document.querySelector('.send-message-input')
const chat_box = document.querySelector('.chat')
const error_box = document.querySelector('.error_box')
const restart_button = document.querySelector('.restart-chat-button')
const stop_button = document.querySelector('.stop-chat-button')
let codeMessages = document.querySelectorAll('code')

// Add copy handler to each code element to be able to copy it on click
for (let i = 0; codeMessages.length > i; i++) codeMessages[i].addEventListener('click', handleCopy)

// Function to display message
async function createMessage(type = 'user', text = '') {

    setTimeout(async () => {
        // Styles from config
        const config_style = await fetch(`${env.ip}:${env.port}/config/styles`)
            .then(res => res.json())

        // Shortcuts not to type long names
        const gpt = config_style.messages.gpt.color
        const user = config_style.messages.user.color

        // Create all components of the message
        const message_box = document.createElement('div')
        const profile_picture_section = document.createElement('div')
        const profile_picture = document.createElement('div')
        const text_section = document.createElement('div')

        // Add all styles && classes
        message_box.classList.add(`${type}-message`)
        message_box.classList.add(`message`)

        profile_picture_section.classList.add(`section-${type}-profile-picture`)
        profile_picture_section.classList.add(`section-profile-picture`)

        profile_picture.classList.add(`${type}-profile-picture`)
        profile_picture.classList.add(`profile-picture`)

        text_section.classList.add(`section-${type}-message-text`)
        text_section.classList.add(`section-message-text`)

        // Setup styles from config
        if (type === 'user') {
            message_box.style.backgroundColor = user.background
            text_section.style.color = user.font
        }
        else {
            message_box.style.backgroundColor = gpt.background
            text_section.style.color = gpt.font
        }

        // Display name
        profile_picture.textContent = type === 'user' ? 'User' : 'GPT'

        // Append and display all components
        profile_picture_section.append(profile_picture)

        text_section.textContent = String(text)

        message_box.append(profile_picture_section)
        message_box.append(text_section)

        chat_box.append(message_box)
    }, type === 'user' ? 0 : 100)

}

// Function to add chunks of GPT message
function streamingMessage(chunk) {

    // Text
    let text = String(chunk)

    last_gpt_message += text

    // Get all gpt messages
    const text_sections = document.querySelectorAll('.section-gpt-message-text')

    // Get last gpt message
    const text_section = text_sections[text_sections.length - 1]

    // Add span tag for appearance animation
    const chunk_block = document.createElement('span')
    chunk_block.classList.add('chunk-appearance')

    chunk_block.innerHTML = text

    // Add chunk to text wrapper
    text_section.append(chunk_block)
}

// Function to copy code
function handleCopy(e) {
    console.log('clicked!', e.target.textContent)
}

// Works when message to GPT submitted
function handleSubmit(e) {

    // Prevent Default Actions of Form (Page Reloads)
    e.preventDefault()

    if (sendMessage) {
        // User can't send 2nd message until gpt answers
        sendMessage = false

        // Show "Stop Generating" button
        stop_button.classList.toggle('none')
        stop_button.classList.add('appearance')

        setTimeout(() => {
            stop_button.classList.remove('appearance')
        }, 300)

        // Define last message
        const lastChild = chat_box.lastElementChild

        // Check if the message is already sent
        if (lastChild && lastChild.classList.contains('user-message')) {

            // IF LAST MESSAGE ALREADY WAS FROM USER
            return;

        } else {

            // Use function  to display message
            createMessage('user', input.value)

            // Get array of coockies
            const cookies = document.cookie.split(';');
            let cucId = '';

            // Find CUC-ID cookie
            cookies.forEach(i => {
                if (i.includes('CUC-ID')) {
                    cucId = i.split('=')[1]
                }
            })

            // Send event that message sent to server with all the data
            createMessage('gpt', '')
            socket.emit('message_sent', { value: input.value, id: cucId, lang: lang });

            // Clear input
            input.value = ''
        }
    }
}

// Works when button "Restart Conversation" works
function handleRestart(e) {

    // Prevent default actions of button
    e.preventDefault()

    // Get array of coockies
    const cookies = document.cookie.split(';');
    let cucId = '';

    // Find CUC-ID cookie
    cookies.forEach(i => {
        if (i.includes('CUC-ID')) {
            cucId = i.split('=')[1]
        }
    })

    // Delete conversation
    socket.emit('restart_conversation', { id: cucId, lang: lang })

    // Get rid of conversation cookie by expiring it
    document.cookie = "CUC-ID" + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Reload page
    location.reload();
}

// Function to display errors
function displayError(error) {

    // Display error in console
    console.error('Additional Error data: ', error)

    // Display error
    error_box.textContent = error.display

    // Add appearance animation
    if (!error_box.classList.contains('opacity')) error_box.classList.add('opacity')

    // Remove display: none
    if (error_box.classList.contains('none')) error_box.classList.remove('none')

    // Remove appearance animation after it played
    setTimeout(() => error_box.classList.contains('opacity') ? error_box.classList.remove('opacity') : null, 300);

    // Hide error after 15 seconds passed
    setTimeout(() => {

        // Add disappearance animation
        if (!error_box.classList.contains('opacity-reverse')) error_box.classList.add('opacity-reverse')

        setTimeout(() => {

            // Remove disappearance animation
            if (error_box.classList.contains('opacity-reverse')) error_box.classList.remove('opacity-reverse')

            // Add display: none
            if (!error_box.classList.contains('none')) error_box.classList.add('none')

            // Remove error text
            error_box.textContent = ''

        }, 300)
    }, 15000)
}

// Stops generating response of GPT
function handleStop(e) {

    // Prevent default actions of button
    e.preventDefault()

    // Triggers event on the backend to stop generating
    socket.emit('stop_generating', { sendMessage: sendMessage, lang: lang })
}

// Replace html entities with valid keys
function decodeEntities(encodedString) {
    const element = document.createElement("div");
    element.innerHTML = encodedString;
    return element.textContent;
}


// When chunk of response received
socket.on('chunk', data => {

    // Display error if it exists
    if (data && data.error) return;

    // Get chunk of data
    const { content } = data;

    // Add new chunk to GPT response
    streamingMessage(content)
})

// When gpt responded
socket.on('fully_received', (data) => {

    // Display error if it exists
    if (data && data.error) return;

    // User can send message after gpt answered
    sendMessage = true;

    let gptMessages = document.querySelectorAll('.section-gpt-message-text');

    // Parse last message into Markdown (MD) format
    if (gptMessages.length > 0) {
        let sectionGptMessageText = gptMessages[gptMessages.length - 1];
        sectionGptMessageText.innerHTML = marked.parse(last_gpt_message)
    }


    let codeMessages = document.querySelectorAll('code')

    for (let i = 0; codeMessages.length > i; i++) {

        // Add code highlighting to all code elements that aren't highlighted yet
        if (!codeMessages[i].classList.contains('hljs') && codeMessages[i].getAttribute('class')) {
            let code = hljs.highlightAuto(
                decodeEntities(codeMessages[i].innerHTML)
            );

            // Add classes, include code into container
            codeMessages[i].classList.add('hljs');
            codeMessages[i].classList.add('xml');
            codeMessages[i].innerHTML = code.value;
            codeMessages[i].addEventListener('click', handleCopy)

        } else if (!codeMessages[i].classList.contains('hljs')) {
            codeMessages[i].addEventListener('click', handleCopy)
        }

    }

    // Clean last message up, it's completed
    last_gpt_message = '';

    // Show "Stop Generating" button
    stop_button.classList.add('disappearance')

    // Remove all animations after they completed
    setTimeout(() => {
        stop_button.classList.remove('disappearance')
        stop_button.classList.toggle('none')
    }, 300)
})

// Handle caught error
socket.on('err', (error) => {
    displayError(error)
})

// Add event listeners
form.addEventListener('submit', handleSubmit)
restart_button.addEventListener('click', handleRestart)
stop_button.addEventListener('click', handleStop)