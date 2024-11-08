require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(DISCORD_TOKEN);

app.use(bodyParser.json());

app.post('/azure-webhook', (req, res) => {
    const payload = req.body;

    if (payload.eventType === 'git.push') {
        const commitMessages = payload.resource.commits.map(commit => commit.message).join('\n');
        const message = `Push detected:\n${commitMessages}`;

        const channel = client.channels.cache.get(CHANNEL_ID);
        if (channel) {
            channel.send(message);
        }
    }

    if (payload.eventType === 'git.pullrequest.created') {
        const prTitle = payload.resource.title;
        const prUrl = payload.resource.url;
        const message = `New Pull Request Created:\nTitle: ${prTitle}\nURL: ${prUrl}`;

        const channel = client.channels.cache.get(CHANNEL_ID);
        if (channel) {
            channel.send(message);
        }
    }

    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
