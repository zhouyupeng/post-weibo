let fs = require('fs');
let readline = require('readline');
let puppeteer = require('puppeteer');


function readSyncByRl(tips) {
    tips = tips || '> ';
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(tips, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function login(username, password) {
    const browser = await puppeteer.launch({
        // headless: false,
        slowMo: 250,
        executablePath: ''
    });
    const page = (await browser.pages())[0];
    await page.setViewport({
        width: 1280,
        height: 800
    });

    await page.goto("https://weibo.com/");
    await page.waitForNavigation();
    await page.type("#loginname", username);
    await page.type("#pl_login_form > div > div:nth-child(3) > div.info_list.password > div > input", password);
    await page.click("#pl_login_form > div > div:nth-child(3) > div:nth-child(6)");
    await page.waitForNavigation().then(result => {
        return new Promise((resolve) => {
            page.cookies().then(async cookie => {
                fs.createWriteStream("cookie.txt").write(JSON.stringify(cookie), "UTF8");//存储cookie
                await browser.close();//关闭打开的浏览器
                resolve(cookie);
            });
        })
    }).catch(e => {
        page.screenshot({
            path: 'code.png',
            type: 'png',
            x: 800,
            y: 200,
            width: 100,
            height: 100
        });
        return new Promise((resolve, reject) => {
            readSyncByRl("请输入验证码").then(async (code) => {
                await page.type("#pl_login_form > div > div:nth-child(3) > div.info_list.verify.clearfix > div > input", code);
                await page.click("#pl_login_form > div > div:nth-child(3) > div:nth-child(6)");
                await page.waitForNavigation();
                page.cookies().then(async cookie => {
                    fs.createWriteStream("cookie.txt").write(JSON.stringify(cookie), "UTF8");
                    await browser.close();
                    resolve(cookie);
                });

            })
        })
    })
}
module.exports = login;