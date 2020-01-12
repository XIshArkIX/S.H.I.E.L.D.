const fs = require('fs');
fs.opendir(`${__dirname}/data`, (err, dir) => {
    if (err)
        fs.mkdirSync(`${__dirname}/data`);
});

const { token } = require('./config.json');

const VK = require('vk-io');
const Enmap = require('enmap');
const banned = new Enmap({ name: 'database', dataDir: './data' });

const shield = new VK({
    token: token,
    apiVersion: '5.103',
    pollingGroupId: -190394993
});

shield.updates.on(['chat_kick_user', 'chat_invite_user', 'chat_invite_user_by_link'], async (context, next) => {
    let [user] = await shield.api.users.get({ user_ids: context.eventMemberId });

    if (context.isGroup || (/bot/miug).test(user.first_name) || (/bot/miug).test(user.last_name) || (/бот/miug).test(user.first_name) || (/бот/miug).test(user.last_name))
        return Promise.all([
            context.send('Уничтожаю подрывую деятельность!'),
            shield.api.messages.removeChatUser({
                chat_id: context.peerId,
                member_id: context.eventMemberId
            }),
            banned.pushIn('banned', `${context.peerId}`, context.eventMemberId, false)
        ]);
    
    if (banned.hasProp('banned', `${context.peerId}`, context.eventMemberId))
        return Promise.all([
            context.send('Уничтожаю подрывую деятельность!'),
            shield.api.messages.removeChatUser({
                chat_id: context.peerId,
                member_id: context.eventMemberId
            })
        ]);

    await next();
});

shield.updates.on(['message', 'new_message', 'edit_message'], async (context, next) => {
    if (context.senderId !== -185001756 && context.senderId !== -189526902 && context.senderId !== 190394993) return await next();
    let msg = context.text.trim().replace(/\n/miug, ''), [user] = await shield.api.users.get({ user_ids: context.senderId });

    if (context.isGroup)
        return Promise.all([
            context.send('Уничтожаю подрывую деятельность!') ,
            shield.api.messages.removeChatUser({
                chat_id: context.peerId,
                member_id: context.senderId
            }),
            banned.pushIn('banned', `${context.peerId}`, context.senderId, false)
        ]);
    
    if ((/bot/miug).test(user.first_name) || (/bot/miug).test(user.last_name) || (/бот/miug).test(user.first_name) || (/бот/miug).test(user.last_name))
        return Promise.all([
            context.send('Уничтожаю подрывую деятельность!'),
            shield.api.messages.removeChatUser({
                chat_id: context.peerId,
                member_id: context.senderId
            }),
            banned.pushIn('banned', `${context.peerId}`, context.senderId, false)
        ]);

    if (msg.startsWith('http') && !msg.includes('statbot.info'))
        return Promise.all([
            context.send('Уничтожаю подрывую деятельность!'),
            shield.api.messages.removeChatUser({
                chat_id: context.peerId,
                member_id: context.senderId
            }),
            banned.pushIn('banned', `${context.peerId}`, context.senderId, false)
        ]);

    await next();
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});