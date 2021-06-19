module.exports = class Chat {
    constructor() {
        this.storage = [];
        this.currentUsers = [];
        this.lastMessage = null;
    }

    addCurrentUser(login) {
        this.currentUsers.push(login);
    }

    addMessage(message) {
        this.lastMessage = {
            login: message.login,
            time: this.getTime(),
            message: message.message
        };
        this.storage.push(this.lastMessage);
    }

    getTime() {
        const now = new Date();
        const day = (now.getDate() < 10) ? '0' + now.getDate() : now.getDate();
        const month = ((now.getMonth() + 1) < 10) ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
        const hour = (now.getHours() < 10) ? '0' + now.getHours() : now.getHours();
        const minute = (now.getMinutes() < 10) ? '0' + now.getMinutes() : now.getMinutes();
        const year = now.getFullYear().toString().slice(2);
        return `${hour}:${minute} ${day}.${month}.${year}`;
    }
}
