let schedule = require('node-schedule');
let fs = require('fs');
let weiboPost = require('./weibopost');
let login = require('./login');
let uploadImg = require('./upload');
let j = '';
const config = {
	username: '', //微博账号名
	password: '', //微博密码
}

loginTo();

function loginTo() {
	login(config.username, config.password).then(async () => {
		let rule = null;
		rule = new schedule.RecurrenceRule();
		rule.minute = [01, 11, 21, 31, 41, 51];
		try {
			let cookie = await getCookie();
			getContent(cookie);
		} catch (error) {
			console.log(error);
		}

		j = schedule.scheduleJob(rule, async () => { //定时任务
			try {
				let cookie = await getCookie();
				getContent(cookie);
			} catch (error) {
				console.log(error);
			}

		});
	})
}

function getCookie() {//获取本地cookie
	return new Promise((resolve, reject) => {
		fs.readFile('cookie.txt', 'utf8', (err, data) => {
			if (err) {
				reject('获取本地cookie.txt失败' + err);
			} else {
				let cookie = JSON.parse(data);
				let str = '';
				cookie.forEach((res) => {
					str = str + res.name + "=" + res.value + '; ';
				})
				resolve(str);
			}
		});

	});
}

function getContent(cookie) {
	//发送的内容可自行使用第三方api获取或使用爬虫爬取。
	let content = '今人不见古时月，今月曾经照古人。';
	let imgUrl = ['http://g.hiphotos.baidu.com/image/pic/item/8b13632762d0f7032fd8c1c506fa513d2697c545.jpg', 'http://f.hiphotos.baidu.com/image/pic/item/09fa513d269759ee50caedcabcfb43166d22df1d.jpg', 'http://g.hiphotos.baidu.com/image/pic/item/4034970a304e251f236a22eba986c9177f3e5300.jpg'];
	let promiseArray = [];
	imgUrl.forEach((item) => {
		promiseArray.push(uploadImg(item, cookie));
	});
	Promise.all(promiseArray).then(async (data) => {
		let arrPic = data.join('|');
		try {
			await weiboPost(content, arrPic, cookie);

		} catch (error) {
			console.log('suc', error);
			j && j.cancel();
			loginTo(); //发送微博失败后重新登录
		}

	}).catch(async (e) => {
		//这里获取图片pid失败了也发微博，发送无图片的微博
		try {
			await weiboPost(content, '', cookie);
		} catch (error) {
			console.log('fail', error);
			j && j.cancel();
			loginTo(); //发送微博失败后重新登录
		}
	});

}