# ChatGPT-Assistant

### About
This repository lets you to use ChatGPT on your website, telegram or in discord. Script contains config to easily setup the script!

### Notation
If you are interested in collaboration, message here:
Telegram: @Nikita1264
Discord: fley0609

## How to Start

Application is made on NodeJS so to use the script, you need to download it from official website [here](https://nodejs.org/en).

1. To start you need an account of [OpenAI](https://openai.com/) website, (If you're from Russia, you can rent a number here: [5sim](https://5sim.net))
2. Then you will need to get and API key [here](https://platform.openai.com/account/api-keys).
3. Find ".env" file in the root directory and for the field "OPENAI_API_KEY" paste your API Key:
```env
OPENAI_API_KEY = <PASTE YOUR OPENAI API KEY HERE>
```
4. This step is for users, want to use script on Discord. You need to get TOKEN from your bot and paste it to ".env" like this:
```env
DISCORD_TOKEN = <YOUR TOKEN>
```
5. Then, open console in the directory of the script. To do this, use:
```shell
cd C:/path/to/directory
```
6. When you're in the folder, use this command to install all dependencies:
```shell
npm install
```
7. This step is also optional. You can setup the script the way you want in the "config.js" file and change styles for the web-interface here "config.styles.js"
8. After all the steps, to start the application, always use command:
```shell
node index.js
```
9. To Stop the application, you need yo use "ctrl + C" keys.

# A little Documentation
This is a little documentation to basics of using this script. 

## Config.js
Config has a lot of values to fill, most of them can stay untouched but for better experience I recommend to setup most important values:

### 1. Locations
   This property defines locations where it's going to work, it's recommended to disable (false) locations, where GPT won't be or not used at a moment, otherwise it might cause troubles.
   If you enable chatGPT in console, other locations won't work as they can't work together because other locations require logs to be displayed in console
```js
    // Locations where GPT will work
    locations: {
        // In console
        console: false,

        // With API, lets you access chat in browser or add it to your existing website
        api: true,

        // Discord bot
        discord: true,

        // Telegram bot
        telegram: false,
    }
```

### 2. GPT Version
  By default it's "gpt-3.5-turbo" which is chatGPT 3.5. To use other version of chatGPT, you need to use the special names. You can find them in OpenAI documentation. There might appear new or disappear old versions so in the future default version might not work anymore!
```js
    // Version of chatGPT
    gpt_version: "gpt-3.5-turbo",
```

### 3. Names
  There are names of chatGPT and User, that can be displayed in various of places and if you planning on making the bot with your own name - set your names up here, if not, do not touch it. Default name of chatGPT will be used.
  Short version of name will be used in the places where it's full name won't fit, recommended not to make morethan 4 symbols in the short name.
```js
    // Name for user
    user_name: "", // Default Value is "User"

    // Short name for user to use it on profile picture (example)
    short_user_name: "", // Default Value is "User"

    // Name for chatGPT
    gpt_name: "", // Default Value is "ChatGPT <version>"

    // Short name for chatGPT to use it on profile picture (example)
    short_gpt_name: "", // Default Value is "GPT"
```

### 4. Tokens
  Tokens define amount of words chatGPT can use per message. 1 Token isn't 1 word but it's about it (Something like 1 Token = 1.5 Word). Also tokens worth a lot of money so if you don't want your users to make poems - set the limit.
  Also, each version of chatGPT (3, 3.5, 4) have their maximum limit and chatGPT won't answer more than their limit so there's no reason to setup more than 100.000 tokens per message yet.
```js
    // Max amount of tokens per message
    max_tokens: 120,
```

### 5. Instructions
   Probably the most important setting for enterprice project. It's the place where you tell chatGPT what he has to do and what he needs to say.
   Example:
```js
    instructions: [
        "You're the helpful bot, that helps people to fix their bugs in the code.",
        "The only language you're helping with is Python. You deny any request to fix the code in any other language. In fact you have to deny any request unrelated to helping with fixing bugs in your code",
        "Your name is Jerry, your age is 25, you pretend not to be a bot but the real person.",
    ],
```
Just paste your own instructions to chatGPT. It's not limited by 3 instructions. In fact you're able to add infinite amount of instructions to it, just use comma between each instruction and each instuction has to be instide of quotes!

### 6. Contact Email
  This is the email that might be displayed in error messages. We're really recommending you to setup your own email to let your users message you when they caught an error.
```js
    // Support email, might be displayed in errors
    contact_email: "borisov.nikita.off@gmail.com",
```

## Interface
After setting up the config.js we're moving to interface. This section is for users want to use chatGPT on their websites. When application is online and API is on locations (config.js), you can access the interface (if you're doing it locally) with this link: "http://localhost:3000/chat/interface?lang=en". If you want to implement it to your website, you this html code:

### React:
```html
<iframe src="http://localhost:3000/chat/interface?lang=en" width="600px" height="900px" style={{borderRadius: '8px', border: 'none'}}></iframe>
```
### Vanila HTML
```html
<iframe src="http://localhost:3000/chat/interface?lang=en" width="600px" height="900px" style="border-radius: 8px; border: none"></iframe>
```

There's width and height defined in pixels, you can setup your own. In "style" attribute we define some basic styles, you can also remove the attribute if you don't want basic styles to be applied

 ## Config.styles.js
This file is also only for interface. This file configures styles for the interface, colors, shadows and else. All the values are used in the way it's used in CSS. If you don't know CSS. You can use google to find out what values to use in what places.
Most of the information about this config is pointed right in the comments in the file.

## Config.language.js
This file is for localization. There's already 2 languages. Russian (ru) and English (en). You can add your own languages like Spanish or Hindi.
You can also correct the existing translations if you believe they're wrong!

### How to Add own language
This file has it's structure:

(This is just an illustration!)
```
file
|
-- en
|   |
|   -- interface
|   |   |
|   |   -- values
|   |   -- values
|   |   -- values
|   |
|   -- errors
|       |
|       -- values
|       -- values
|       -- values
|
-- ru
    |
    -- interface
    |   |
    |   -- values
    |   -- values
    |   -- values
    |
    -- errors
        |
        -- values
        -- values
        -- values


```
The first "ru" and "en" are the titles, you can add your own set with translations and own name like "ja".
The structure of the insides has to be the same all the time, if it's not the same, it might cause troubles in the future.
You can just copy the way already existing "ru" or "en" structure. It's not recommended to try to type all the structure by hand, just copy it!

### More about structure
1. "en" is the name of the language, it might be anything you want, it has no restriction but to stick to one style, recommended to use 2 letter code of your country.
1. "interface" contains all translations related to interface like names of buttons.
2. "error" contains all translations of errors.

### How do I translate my interface?
If you read about interface, you might remember the link used to display interface, there's a defined parameter "lang=en".
```
http://localhost:3000/chat/interface?lang=en
```
Instead of typing "en", you can use any name that exists in 'config.language.js' ("en" and "ru" by default).
When you change it in the link, it has to start working right after you reload the page!

# FAQ

Q: Do interface supports code displaying?

A: Yes, it's displaying the code.
<hr/>

Q: Do I pay for chatGPT?

A: You do pay for tokens. Than more advanced model you're using, than more expensive the cost per 1000 tokens!
<hr/>

Q: Can I use it for enterprice projects?

A: Your freedom to do whatever you want with this script but the creators of this script aren't responsible for anything you do with it!
<hr/>

Q: I found out the bug / error / crash. What do I do?

A: Definetely message the creator. You can contact him with information in "Notation" section
<hr/>

If there any other questions left, you can ask us! Use telegram or discord. I left that in "Notations" section for you




