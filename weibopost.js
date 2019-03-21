let querystring = require('querystring');
let axios = require('axios');
/**
 * 
 * @param {string} text 
 * @param {string} pic_ids 
 * @param {string} cookie 
 */
async function weibopost(text, pic_ids = '', cookie) { //发送微博内容（支持带图片）
    return new Promise(async (resolve, reject) => {
        if (cookie === '') {
            reject('Error: Cookie not set!');
        }
        let post_data = querystring.stringify({
            'location': 'v6_content_home',
            'text': text,
            'appkey': '',
            'style_type': '1',
            'pic_id': pic_ids,
            'tid': '',
            'pdetail': '',
            'mid': '',
            'isReEdit': 'false',
            'rank': '0',
            'rankid': '',
            'module': 'stissue',
            'pub_source': 'main_',
            'pub_type': 'dialog',
            'isPri': '0',
            '_t': '0'
        });

        let post_options = {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
            'Connection': 'keep-alive',
            'Content-Length': Buffer.byteLength(post_data),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookie,
            'Host': 'weibo.com',
            'Origin': 'https://weibo.com',
            'Referer': 'https://weibo.com',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        };


        let {
            data
        } = await axios.post('https://weibo.com/aj/mblog/add?ajwvr=6&__rnd=' + new Date().getTime(), post_data, {
            withCredentials: true,
            headers: post_options
        })
        if (data.code == 100000) {
            console.log('\n' + text + '-----Sent!' + '---' + new Date().toLocaleString());
            resolve(data);
        } else {
            console.log('post error');
            reject('post error');
        }

    });
}

module.exports = weibopost;