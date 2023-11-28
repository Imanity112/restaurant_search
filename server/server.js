const express = require("express");
const app = express();
const PORT = 4000;
const cors = require("cors");
require("dotenv").config();


app.use(cors({
    origin: "http://127.0.0.1:5500",
}))

// 静的なファイルをホストする

app.get("/", (req, res) => {
    res.send("hello");
});

app.get("/restaurant/:id", async (req, res) => {
    const { id } = req.params;
    const key = process.env.APP_API_KEY; // APIキー
    const url = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${key}&id=${id}&format=json`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const restaurant = data.results.shop[0];

        if (restaurant) {
            const html = `
            <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #e4e4e4;
            }
            .box {
                position: relative;
                top: -140;
            }
            h1 {
                color: #333;
                max-width: 60%;
                left: 35px;
                position: relative; 
                top: -40;
            }
            p {
                color: #666;
                width: 60%;
                border-bottom: solid 2px #e4e4e4;
            }
            p#barrier_free {
                position: relative; 
                top: 10;
                left: 35px;
            }
            
            p#parking {
                position: relative; 
                top: 20;
                left: 35px;
            }
            
            p#non_smoking {
                position: relative; 
                top: 30;
                left: 35px;
            }
            p#address {
                position: relative; 
                top:-30;
                left: 35px;
            }
            p#station{
                position: relative; 
                top: -20;
                left: 35px;
            }
            p#open {
                top: 0;
                position: relative; 
                left: 35px;
            }
            p#link {
                position: relative; 
                top: 30;
                left: 35px;
            }
            img {
                position: absolute; 
                transform: translate(280%,15%);
                position: relative;
            }
            #details {
                background-color: #fff;
                width: 80%;
                height: 85%;
                transform: translate(12%,10%);
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

            }
            </style>
            <div id=details>
            <img src="${restaurant.photo.pc.l}" alt="${restaurant.name}" width="25%" height="30%">
            <div class=box>
            <h1>${restaurant.name}</h1>
                <p id=address>住所: ${restaurant.address}</p>
                <p id=station>最寄駅: ${restaurant.station_name}</p>
                <p id=open>営業時間: ${restaurant.open}</p>
                <p id="barrier_free">バリアフリー: ${restaurant.barrier_free}</p>
                <p id="parking">駐車場: ${restaurant.parking}</p>
                <p id="non_smoking">禁煙席: ${restaurant.non_smoking}</p>
                <a href=${restaurant.urls.pc}> <p id=link>リンク: ${restaurant.urls.pc}</p> </a>
            </div>
                </div>

            `;

            //telがそもそも対応してないから電話番号表示はできない

            res.send(html);
        } else {
            res.status(404).send('Restaurant not found');
        }
    } catch (error) {
        console.error('Error fetching restaurant data: ', error.message);
    }
});

app.get("/data", async (req, res) => {
    const { lat, lng, range, start } = req.query;
    const key = process.env.APP_API_KEY;
    const url = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${key}&lat=${lat}&lng=${lng}&range=${range}&start=${start}&count=100&format=json`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        res.json(data); // APIから取得したデータをそのままレスポンスとして返す
    } catch (error) {
        console.error('Error fetching restaurant data: ', error.message);
    }
});

app.listen(PORT, () => console.log("server is running"));