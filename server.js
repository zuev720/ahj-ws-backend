const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('@koa/cors');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const Chat = require('./components/Chat')
const chat = new Chat;


app.use(koaBody({
    urlencoded: true,
    multipart: true,
    json: true,
}));


app.use(
    cors({
        origin: '*',
        credentials: true,
        'Access-Control-Allow-Origin': true,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    })
);

app.use(router.routes());
app.use(router.allowedMethods());


router.get('/', async (ctx) => {
    ctx.response.set( {'Access-Control-Allow-Origin':'*'});
    const {method} = ctx.request.query;
    if (method === 'login') {
        const {login} = ctx.request.query;
        chat.currentUsers.push(login)
        ctx.response.body = JSON.stringify(chat.storage);
        console.log(chat.currentUsers)
        return;
    }
    ctx.response.body = 'app works!';
});

router.post('/', async (ctx) => {
    const {login} = ctx.request.body;
    const user = chat.currentUsers.find(user => user === login);
    if (user) {
        ctx.response.body = JSON.stringify({login: false, message: 'Никнейм уже занят'});
    } else {
        chat.addCurrentUser(login);
        ctx.response.body = JSON.stringify({login: true, message: login, allMessages: chat.storage});
    }
});

const WS = require('ws');
const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());
const wsServer = new WS.Server({server});

wsServer.on('connection', (ws) => {
    ws.on('message', (msg) => {
        const message = JSON.parse(msg);
        if (message.type === 'message') {
            chat.addMessage(message);
            const objResponse = {type: 'message', message: chat.lastMessage};
            Array.from(wsServer.clients)
                .filter(o => o.readyState === WS.OPEN)
                .forEach(o => o.send(JSON.stringify(objResponse)));
        }
        if (message.type === 'close') {
            const login = message.login;
            chat.currentUsers.forEach((user, index) => {
                if (user === login) chat.currentUsers.splice(index, 1);
                console.log(chat.currentUsers)
            });
            Array.from(wsServer.clients)
                .filter(o => o.readyState === WS.OPEN)
                .forEach(o => o.send(JSON.stringify({type: 'users', users: chat.currentUsers})));
        }
    });
    Array.from(wsServer.clients)
        .filter(o => o.readyState === WS.OPEN)
        .forEach(o => o.send(JSON.stringify({type: 'users', users: chat.currentUsers})));

});

server.listen(port);
