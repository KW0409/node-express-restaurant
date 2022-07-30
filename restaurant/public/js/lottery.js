const body = document.querySelector(".bg__pic-wrapper.lottery");
const apiURL = "/lottery-prize-api";
const errorMsg1 = "系統不穩定，請再試一次";
const errorMsg2 = "系統真不穩定，請聯繫本公司的客服反應！";

async function lotteryAPI() {
  const response = await fetch(apiURL, {
    method: "GET",
  });

  try {
    if (!response.ok) {
      console.log("RESP(PRIZE API) NOT OK!");
      throw new Error(await response.text());
    }

    const prizeData = await response.json();
    return prizeData;
  } catch (err) {
    alert(errorMsg2);
    throw err;
  }
}

function showPrize(prizeData, h1Class) {
  body.innerHTML = `
  <img src=${prizeData.image} class="lottery__pic">
  <div class="prize-area">
    <h1 class=${h1Class}>${prizeData.description}</h1>
    <div class="lottery-btn redirect-btn" onclick="javascript:window.location.reload()">回抽獎頁面</div>
  </div>
  `;
}

body.addEventListener("click", async (e) => {
  if (e.target.classList.contains("get__prize-btn")) {
    try {
      const prizeData = await lotteryAPI();
      switch (prizeData.rank) {
        case "OPEN獎": {
          // 假的獎項
          alert(errorMsg1);
          console.log(prizeData.description);
          break;
        }
        case "頭獎": {
          // 需要改變文字顏色的獎項
          const h1Class = "black";
          showPrize(prizeData, h1Class);
          break;
        }
        default: {
          // 其他的所有獎項
          showPrize(prizeData);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
});
