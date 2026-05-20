import { EventEmitter } from 'events'
export const notificationEmitter = new EventEmitter()
import { sendLog } from '../logs.ts'

notificationEmitter.on('User:create', (payload) => {
    sendLog({ action: "User:create", username: payload.data.username, status: "SUCCESS" });
});