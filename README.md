# ChatGPT-Assistant

### Description
This repository lets you to use ChatGPT on your website, telegram or in discord. Script contains config to easily setup the script!

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
