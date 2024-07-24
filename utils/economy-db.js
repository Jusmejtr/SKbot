const { initializeApp, applicationDefault, cert, getApp } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const serviceAccount = require('../serviceAccount.json');

initializeApp({
    credential: cert(serviceAccount)
}, "second");
const app = getApp('second');
const db = getFirestore(app);

async function getDocument(coll, document) {
    const doc = db.collection(coll).doc(document);
    const document_data = await doc.get();
    if (!document_data.exists) return null;
    return document_data.data();
}
async function udpateDocument(coll, document, data) {
    const doc = db.collection(coll).doc(document);
    const res = await doc.update(data);
}

async function getMoney(user) {
    const document = await getDocument("economy", user);
    if(document == null) return null;
    if(document.money == null) return null;
    return document.money;
}

async function addMoney(user, ammount) {
    try {
        let money = await getMoney(user);
        if (money == null) return;
        let newMoney = parseInt(money) + parseInt(ammount);
        let data = {
            'money': newMoney
        }
        await udpateDocument("economy", user, data);
        return true;
    }
    catch (e) {
        console.log(e);
        return null;
    }
}

async function removeMoney(user, ammount) {
    try {
        let money = await getMoney(user);
        if (money == null) return;
        let newMoney = parseInt(money) - parseInt(ammount);
        let data = {
            'money': newMoney
        }
        await udpateDocument("economy", user, data);
        return true;
    }
    catch (e) {
        console.log(e);
        return null;
    }
}

module.exports = { addMoney, removeMoney, getMoney };