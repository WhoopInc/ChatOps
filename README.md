## WhoopBot ##
### A custom Slackbot ###


### Features and Usage ###
The `chatops help` command triggers the bot to send a list of all available
commands. They are:
*   `get datadog`; `datadog claim [ID]`
*   `get github ([github_username])`
*   `what's [HTTP status code]?`
*   `jenkins ([keyword]) list`; `jenkins [job_name] -p [KEY]=[value]`
*   `chatops survey #[channel_name] [Q1] [A1] [A2]`
*   `xkcd`


### Architecture ###
The bot is launched from `index.js`, which houses the Lunch Train cron job
and the request to retrieve a WebSocket url.
|
v
`app.js` contains the event handlers for the websocket. On event, if the
event is a user-submitted message, the `handlePlugins` method inside `plugins/
index.js` is called.
|
v
For each plugin in the `plugins` directory, `handlePlugins` checks whether
the plugin is applicable to the received message, in which case it will
execute the plugin. This is done through cross-plugin consistently named
functions `isCallable(text)` and `executePlugin(channel, callback, text, user)
`.

A messagebroker is also implemented in a singleton pattern in
`messagebroker.js`. The methods that interact with the messagebroker are
accessible from any module, but are almost always invoked in app.js. The
`mb.send(message)` method is passed to the plugins as the `callback` in
`executePlugin`.


### Implementing a New Plugin ###
In order to maintain the ability to call all plugins in the same way, new
plugins must satisfy a few requirements:
*   `isCallable(text)` returns a boolean indicating whether the incoming
    string `text` satisfies the criteria to execute the function. This function is usually a RegExp test
*   `executePlugin(channel, callback, text, user)` uses the parameter
    information to perform an operation. Callback is always the
    messagebroker.send() function.
*   `helpDescription()` returns a string that will be appended to the other
    help descriptions when the `chatops help` command is called. The string
    should have the form `_[Plugin Name]_\n[Explanation of plugin including
    invocation command and constraints]`


