import { documentUtils, encodeHTML } from "../utils.js";

/* 會員資料的 func */ //TODO:
const dataUtils = {
  //TODO: 改成真正的 URL
  adminURL: "/admin-member",

  //TODO: 改成真正的 API
  getAPI: async () => {
    const response = await fetch(`${dataUtils.adminURL}`, {
      method: "GET",
    });

    try {
      if (!response.ok) {
        // 因為要完全連不到 Server 才會到 .catch
        // 因此要加上此判斷才能區分出 404, 500 之類的錯誤
        console.log("RESP(GET) NOT OK!");
        throw new Error(await response.text());
      }

      const dataArr = await response.json();
      return dataArr;
    } catch (err) {
      alert("會員資料獲取失敗！");
      throw err;
    }
  },

  //TODO: 改成真正的 API
  updateAPI: async (data) => {
    // 在使用者的 controller 去拿 req.session.username 來做權限管理的身份確認
    const response = await fetch(`${dataUtils.adminURL}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });

    try {
      if (!response.ok) {
        console.log("RESP(UPDATE) NOT OK!");
        throw new Error(await response.text());
      }
    } catch (err) {
      alert("會員資料更新失敗！");
      throw err;
    }
  },

  userAuthText: (userAuth) => {
    if (userAuth === 0) {
      return "一般會員";
    } else if (userAuth === 1) {
      return "vip會員";
    } else {
      return "停權會員";
    }
  },

  optionTemplate: (userAuth) => {
    if (userAuth === 0) {
      return `
        <option value="0" selected>一般會員</option>
        <option value="1">vip會員</option>
        <option value="-1">停權會員</option>`;
    } else if (userAuth === 1) {
      return `
        <option value="0">一般會員</option>
        <option value="1" selected>vip會員</option>
        <option value="-1">停權會員</option>`;
    } else {
      return `
        <option value="0">一般會員</option>
        <option value="1">vip會員</option>
        <option value="-1" selected>停權會員</option>`;
    }
  },

  setUserAuthOption: (userAuthText, selectElement) => {
    let userAuth;
    if (userAuthText === "一般會員") {
      userAuth = 0;
    } else if (userAuthText === "vip會員") {
      userAuth = 1;
    } else {
      userAuth = -1;
    }
    selectElement.innerHTML = dataUtils.optionTemplate(userAuth);
  },

  template: (data) => {
    const htmlTemplate = `
      <div class="user-data">
        帳號：<span>${encodeHTML(data.username)}</span>
      </div>
      <div class="user-data name">
        姓名：<span>${encodeHTML(data.name)}</span>
      </div>
      <div class="user-data address">
        地址：<span>${encodeHTML(data.address)}</span>
      </div>
      <div class="user-data phone">
        電話：<span>${encodeHTML(data.phone)}</span>
      </div>
      <div class="user-data email">
        信箱：<span>${encodeHTML(data.email)}</span>
      </div>
      <div class="user-data auth">
        會員等級：<span class="origin">${dataUtils.userAuthText(
          data.user_auth
        )}</span>
        <!-- TODO: -->
        <select class="alt hide alt__text">
          ${dataUtils.optionTemplate(data.user_auth)}
        </select>
      </div>

      <div class="btn__area">
        <div class="handle__update-btn origin">
          <input class="btn update-btn" type="button" value="編輯" />
        </div>

        <div class="handle__store-btn alt hide">
          <input class="btn store-btn" type="button" value="儲存" />
          <input class="btn cancel-btn" type="button" value="取消" />
        </div>
      </div>`;
    return htmlTemplate;
  },

  getContent: async (contentArea) => {
    //TODO:
    try {
      // 這邊如果 getAPI() 出錯就會跑去 catch，導致不會執行到 innerHTML 這 part
      // 且就算用 {} 來當作 dataObj，也會因為對 undefined 型態的東西做 encode 而出錯跳到 catch
      const memberData = {
        // (await dataUtils.getAPI());
        username: "user00",
        name: "user",
        address: "台灣台北",
        phone: "09123456789",
        email: "user@mail.com",
        user_auth: 0,
      };
      contentArea.innerHTML = dataUtils.template(memberData);
    } catch (err) {
      console.log(err);
      contentArea.innerHTML = `<span>error</span>`; //TODO:
    }
  },

  dataStore: async (userAuth, spanElement, memberDataArea) => {
    try {
      // TODO: 之後要讓 fetch 功能恢復正常
      // await dataUtils.updateAPI(userAuth);
      spanElement.innerText = dataUtils.userAuthText(userAuth);
      documentUtils.dataUpdate(memberDataArea, "cancel");
    } catch (err) {
      // TODO: 確認錯誤處理
      console.log("Err:", err);
    }
  },
};

/* 訂單記錄的 func */ //TODO:
const orderUtils = {
  //TODO: 改成真正的 URL
  adminURL: "/admin-lottery",

  //TODO: 改成真正的 API
  getAPI: async () => {
    const response = await fetch(`${orderUtils.adminURL}-get`, {
      method: "GET",
    });

    try {
      if (!response.ok) {
        // 因為要完全連不到 Server 才會到 .catch
        // 因此要加上此判斷才能區分出 404, 500 之類的錯誤
        console.log("RESP(GET) NOT OK!");
        throw new Error(await response.text());
      }

      const dataArr = await response.json();
      return dataArr;
    } catch (err) {
      alert("抽獎資料獲取失敗！");
      throw err;
    }
  },

  template: (data) => {
    const htmlTemplate = `
      <td class="order-num">${data.num}</td>
      <td class="created-at">${encodeHTML(data.createdAt)}</td>
      <td class="price">${data.totalPrice}</td>
      <td class="state">${encodeHTML(data.state)}</td>
      <td class="btn__area">
        <input class="link-btn" type="button" value="查看詳情" onclick="location.href='/user/order-detail/${
          data.id
        }'">
      </td>`;
    // TODO: 確認上面的 onclick 超連結寫法是否正確
    return htmlTemplate;
  },

  getContent: async (contentArea) => {
    //TODO:
    const tbody = contentArea.querySelector("tbody");
    try {
      // 這邊如果 getAPI() 出錯就會跑去 catch，導致不會執行到 innerHTML 這 part
      // 且就算用 {} 來當作 dataObj，也會因為對 undefined 型態的東西做 encode 而出錯跳到 catch
      // const orderData = await orderUtils.getAPI();
      const orderData = [
        {
          id: 1,
          num: 123321,
          item: [
            {
              image: "/css/lottery_pic/bg.png",
              dishname: "鮮嫩洋芋白丁佐莎莎",
              price: 260,
              amount: 2,
            },
          ],
          bill: {
            name: "user",
            address: "台灣台北",
            phone: "09123456789",
            email: "user@mail.com",
          },
          totalPrice: 520,
          state: "處理中",
          createdAt: "2022-08-05 14:23:51",
        },
        {
          id: 2,
          num: 456654,
          item: [
            {
              image: "/css/lottery_pic/bg.png",
              dishname: "鮮嫩洋芋白丁佐莎莎",
              price: 280,
              amount: 5,
            },
          ],
          bill: {
            name: "user",
            address: "台灣台北",
            phone: "09123456789",
            email: "user@mail.com",
          },
          totalPrice: 1400,
          state: "處理中",
          createdAt: "2022-08-15 17:41:23",
        },
      ];

      for (let i = 0; i < orderData.length; i++) {
        const tableRow = document.createElement("tr");
        tableRow.innerHTML = orderUtils.template(orderData[i]);
        tbody.appendChild(tableRow);
      }
    } catch (err) {
      console.log(err);
      contentArea.innerHTML = `<span>error</span>`; //TODO:
    }
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const memberDataArea = document.querySelector(".member-data-container");
  dataUtils.getContent(memberDataArea);

  const orderDataArea = document.querySelector(".order-data-container");
  orderUtils.getContent(orderDataArea);

  const memberBtnArea = memberDataArea.querySelector(".btn__area");
  const spanElement = document.querySelector(".user-data.auth > span.origin");
  const selectElement = document.querySelector("select");
  memberBtnArea.addEventListener("click", (e) => {
    if (e.target.classList.contains("update-btn")) {
      dataUtils.setUserAuthOption(spanElement.innerText, selectElement);
      documentUtils.dataUpdate(memberDataArea, "update");
    }

    if (e.target.classList.contains("cancel-btn")) {
      documentUtils.dataUpdate(memberDataArea, "cancel");
    }

    if (e.target.classList.contains("store-btn")) {
      let userAuth = Number(selectElement.value);
      dataUtils.dataStore(userAuth, spanElement, memberDataArea);
    }
  });
});
