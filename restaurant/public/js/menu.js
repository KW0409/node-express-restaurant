// TODO: 改成正確的 API
const MENU_API = "https://api.twitch.tv/kraken";

// TODO: 改成正確的 API function
// 串接 menu API 抓取餐點資料的 function
async function getMenuDataAPI() {
  const encodeStr = encodeURIComponent(gameName);
  const response = await fetch(
    `${TWITCH_API}/streams/?game=${encodeStr}&limit=20`,
    {
      method: "GET",
      headers: new Headers({
        "Client-ID": CLIENT_ID,
        Accept: "application/vnd.twitchtv.v5+json",
      }),
    }
  );

  let obj;
  try {
    obj = await response.json();
    const data = obj.streams;

    return data;
  } catch (err) {
    alert("Stream 資料獲取異常，請在稍後重試！");
    console.log("error:", err);
  }
}

const dishCardArea = document.querySelector(".dish-card-area");
const dishCardTemplate = `
<div class="card-info">
  <div class="dish-photo">
    <img src="#preview" width="100%" height="100%">
  </div>
  <div class="dish-info">
    <span>#name</span> | <span>#price</span>
  </div>
</div>
<input class="card-btn" type="button" value="加入購物車" onclick="location.href='// TODO: 要前往的網頁連結'">`;

// 用來動態寫入所有的 dish cards 並產生隱形卡牌的 function
function appendDishCard(data) {
  for (let i = 0; i < data.length; i++) {
    const imageURL = data[i].image;
    const name = data[i].name;
    const price = `$${data[i].price}`;
    const dishCard = document.createElement("div");
    dishCard.classList.add("container", "dish-card");
    dishCard.innerHTML = dishCardTemplate
      .replace("#preview", imageURL)
      .replace("#name", name)
      .replace("#price", price);
    dishCardArea.appendChild(dishCard);
  }
  // 在 dish-card-area 的最後插入兩個隱形的卡牌，讓最後一行顯示的 dish card 永遠都會是靠左排列
  const invisibleDishCard = document.createElement("div");
  invisibleDishCard.classList.add("container", "dish-card", "none");
  for (let i = 1; i <= 2; i++) {
    const cloneCard = invisibleDishCard.cloneNode(true);
    dishCardArea.appendChild(cloneCard);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // TODO: 改成正確的 data
  // const data = await getMenuDataAPI;
  const data = [
    {
      image: "/css/lottery_pic/ticket.jpg",
      name: "輕盈高麗卷湘南",
      price: 280,
    },
    {
      image: "/css/lottery_pic/ticket.jpg",
      name: "鮮嫩洋芋白丁佐莎莎",
      price: 320,
    },
    {
      image: "/css/lottery_pic/ticket.jpg",
      name: "六彩雙茄起司沙拉",
      price: 250,
    },
    {
      image: "/css/lottery_pic/ticket.jpg",
      name: "豆芽涼拌羅勒小金磚",
      price: 350,
    },
    {
      image: "/css/lottery_pic/ticket.jpg",
      name: "輕盈高麗卷湘南",
      price: 280,
    },
    {
      image: "/css/lottery_pic/ticket.jpg",
      name: "鮮嫩洋芋白丁佐莎莎",
      price: 320,
    },
    {
      image: "/css/lottery_pic/ticket.jpg",
      name: "六彩雙茄起司沙拉",
      price: 250,
    },
  ];
  appendDishCard(data);
});
