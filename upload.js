let http = require('http');
const querystring = require('querystring')
let axios = require('axios');

let uploadUrl = 'https://picupload.service.weibo.com/interface/pic_upload.php?mime=image%2Fjpeg&data=base64&url=0&markpos=1&logo=&nick=0&marks=1&app=miniblog'; //图片上传地址
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

function getImage64(url) { //获取图片base64位信息
	return new Promise((resole, reject) => {
		http.get(url, function (res) {
			let chunks = []; //用于保存网络请求不断加载传输的缓冲数据
			let size = 0; //保存缓冲数据的总长度

			res.on('data', function (chunk) {
				chunks.push(chunk); //在进行网络请求时，会不断接收到数据(数据不是一次性获取到的)，

				//node会把接收到的数据片段逐段的保存在缓冲区（Buffer），

				//这些数据片段会形成一个个缓冲对象（即Buffer对象），

				//而Buffer数据的拼接并不能像字符串那样拼接（因为一个中文字符占三个字节），

				//如果一个数据片段携带着一个中文的两个字节，下一个数据片段携带着最后一个字节，

				//直接字符串拼接会导致乱码，为避免乱码，所以将得到缓冲数据推入到chunks数组中，

				//利用下面的node.js内置的Buffer.concat()方法进行拼接


				size += chunk.length; //累加缓冲数据的长度
			});

			res.on('end', function (err) {
				let data = Buffer.concat(chunks, size); //Buffer.concat将chunks数组中的缓冲数据拼接起来，返回一个新的Buffer对象赋值给data

				let base64Img = data.toString('base64'); //将Buffer对象转换为字符串并以base64编码格式显示
				resole(base64Img);
			});

		});
	});
}

async function uploadImg(imgUrl, cookie) {
	let base64Img = await getImage64(imgUrl);
	
	try {
	
		let upImgResp = await axios.post(uploadUrl, querystring.stringify({
			b64_data: base64Img
		}), {
			withCredentials: true,
			headers: {
				'Host': 'picupload.weibo.com',
				'Origin': 'https://weibo.com',
				"Cookie": cookie,
				'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:41.0) Gecko/20100101 Firefox/41.0',
			}
		})

	} catch (error) {
		console.error(error);
	}
		let {
			data
		} = JSON.parse(upImgResp.data.replace(/([\s\S]*)<\/script>/g, ''));
		let imgPid = data['pics']['pic_1']['pid'];
		if (imgPid) {
			return imgPid;
		} else {
			throw 'no img url';
		}
	

}

module.exports = uploadImg;
