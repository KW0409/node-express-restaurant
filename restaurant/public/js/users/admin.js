import { documentUtils, encodeHTML } from "../utils.js";

// TODO: api func 都完成後可以看能不能把共同的項目抽出來重組
const tabUtils = {
  /* 抽獎項目的 func */
  lottery: {
    adminURL: "/admin-lottery",

    getAPI: async () => {
      const response = await fetch(`${tabUtils.lottery.adminURL}-get`, {
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

    updateAPI: async (id, data) => {
      const response = await fetch(
        `${tabUtils.lottery.adminURL}-update/${id}`,
        {
          method: "POST",
          body: JSON.stringify(data),
          headers: new Headers({
            "Content-Type": "application/json",
          }),
        }
      );

      try {
        if (!response.ok) {
          console.log("RESP(UPDATE) NOT OK!");
          throw new Error(await response.text());
        }
      } catch (err) {
        alert("抽獎資料儲存失敗！");
        throw err;
      }
    },

    deleteAPI: async (id) => {
      const response = await fetch(
        `${tabUtils.lottery.adminURL}-delete/${id}`,
        {
          method: "GET",
        }
      );

      try {
        if (!response.ok) {
          console.log("RESP(DELETE) NOT OK!");
          throw new Error(await response.text());
        }
      } catch (err) {
        alert("抽獎資料刪除失敗");
        throw err;
      }
    },

    addAPI: async (data) => {
      const response = await fetch(`${tabUtils.lottery.adminURL}-add`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      });

      try {
        if (!response.ok) {
          console.log("RESP(ADD) NOT OK!");
          throw new Error(await response.text());
        }
        const lastId = await response.json();
        return lastId;
      } catch (err) {
        alert("抽獎資料新增失敗！");
        throw err;
      }
    },

    tableTitleArr: [
      "順序",
      "獎項",
      "獎品名稱",
      "說明",
      "圖片",
      "名額",
      "機率",
      "修改",
    ],

    classNameArr: [
      "sequence",
      "rank",
      "prize",
      "description",
      "image",
      "amount",
      "percentage",
    ],

    template: (data) => {
      const template = `
        <input type="hidden" class="id" value=${data.id}></input>
        <td class="sequence origin">${data.sequence}</td>
        <td class="rank origin">${encodeHTML(data.rank)}</td>
        <td class="prize origin">${encodeHTML(data.prize)}</td>
        <td class="description origin">
          <div>${encodeHTML(data.description)}</div>
        </td>
        <td class="image origin">
          <img class="image" src=${encodeHTML(data.image)}>
        </td>
        <td class="amount origin">${data.amount} 位</td>
        <td class="percentage origin">${data.percentage}%</td>
        <td class="btn__area origin">
          <div class="first__check-btn">
            <input class="btn update-btn" type="button" value="編輯">
            <input class="btn delete-btn delete__first-btn" type="button" value="刪除">
          </div>
  
          <div class="double__check-btn hide">
            <input class="btn delete-btn delete__check-btn" type="button" value="確認">
            <input class="btn delete-btn delete__cancel-btn" type="button" value="取消">
          </div>
        </td>
  
        <td class="sequence alt hide">
          <input class="alt__text" type="number" min="1" value=${data.sequence}>
        </td>
        <td class="rank alt hide">
          <input class="alt__text" type="text" value=${encodeHTML(data.rank)}>
        </td>
        <td class="prize alt hide">
          <textarea class="alt__text" rows="1">${encodeHTML(
            data.prize
          )}</textarea>
        </td>
        <td class="description alt hide">
          <textarea class="alt__text" rows="3">${encodeHTML(
            data.description
          )}</textarea>
        </td>
        <td class="image alt hide">
          <textarea class="alt__text" rows="1">${encodeHTML(
            data.image
          )}</textarea>
        </td>
        <td class="amount alt hide">
          <input class="alt__text" type="number" min="1" value=${data.amount}>位
        </td>
        <td class="percentage alt hide">
          <input class="alt__text" type="number" min="1" max="100" value=${
            data.percentage
          }>%
        </td>
        <td class="btn__area alt hide">
          <div class="handle__store-btn">
            <input class="btn store-btn" type="button" value="儲存">
            <input class="btn cancel-btn" type="button" value="取消">
          </div>
  
          <div class="handle__add-btn hide">
            <input class="btn handle-add add__check-btn" type="button" value="新增">
            <input class="btn handle-add add__cancel-btn" type="button" value="取消">
          </div>
        </td>`;
      return template;
    },

    getContent: async (newTabContent) => {
      documentUtils.getTableAddBtn(newTabContent);
      const tbody = newTabContent.querySelector("tbody");
      try {
        const dataArr = await tabUtils.lottery.getAPI();
        for (let i = 0; i < dataArr.length; i++) {
          const tableRow = document.createElement("tr");
          tableRow.innerHTML = tabUtils.lottery.template(dataArr[i]);
          tbody.appendChild(tableRow);
        }
        // 新增完成後再將表格排序
        documentUtils.tableArrange(newTabContent);
      } catch (err) {
        console.log(err);
      }
    },
  },

  /* 常見問題的 func */
  // TODO:
  faq: {
    adminURL: "/admin-faq",

    getAPI: async () => {
      const response = await fetch(`${tabUtils.faq.adminURL}-get`, {
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

    updateAPI: async (id, data) => {
      const response = await fetch(`${tabUtils.faq.adminURL}-update/${id}`, {
        method: "POST",
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
        alert("抽獎資料儲存失敗！");
        throw err;
      }
    },

    deleteAPI: async (id) => {
      const response = await fetch(`${tabUtils.faq.adminURL}-delete/${id}`, {
        method: "GET",
      });

      try {
        if (!response.ok) {
          console.log("RESP(DELETE) NOT OK!");
          throw new Error(await response.text());
        }
      } catch (err) {
        alert("抽獎資料刪除失敗");
        throw err;
      }
    },

    addAPI: async (data) => {
      const response = await fetch(`${tabUtils.faq.adminURL}-add`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      });

      try {
        if (!response.ok) {
          console.log("RESP(ADD) NOT OK!");
          throw new Error(await response.text());
        }
        const lastId = await response.json();
        return lastId;
      } catch (err) {
        alert("抽獎資料新增失敗！");
        throw err;
      }
    },

    tableTitleArr: ["順序", "標題", "內容", "修改"],

    classNameArr: ["sequence", "heading", "content"],

    template: (data) => {
      const template = `
        <input type="hidden" class="id" value=${data.id}></input>
        <td class="sequence origin">${data.sequence}</td>
        <td class="heading origin">
          <div>${encodeHTML(data.heading)}</div>
        </td>
        <td class="content origin">
          <div>${encodeHTML(data.content)}</div>
        </td>
        <td class="btn__area origin">
          <div class="first__check-btn">
            <input class="btn update-btn" type="button" value="編輯">
            <input class="btn delete-btn delete__first-btn" type="button" value="刪除">
          </div>
  
          <div class="double__check-btn hide">
            <input class="btn delete-btn delete__check-btn" type="button" value="確認">
            <input class="btn delete-btn delete__cancel-btn" type="button" value="取消">
          </div>
        </td>
        
        <td class="sequence alt hide">
          <input class="alt__text" type="number" min="1" value=${data.sequence}>
        </td>
        <td class="heading alt hide">
          <textarea class="alt__text" rows="1">${encodeHTML(
            data.heading
          )}</textarea>
        </td>
        <td class="content alt hide">
          <textarea class="alt__text" rows="3">${encodeHTML(
            data.content
          )}</textarea>
        </td>
        <td class="btn__area alt hide">
          <div class="handle__store-btn">
            <input class="btn store-btn" type="button" value="儲存">
            <input class="btn cancel-btn" type="button" value="取消">
          </div>
  
          <div class="handle__add-btn hide">
            <input class="btn handle-add add__check-btn" type="button" value="新增">
            <input class="btn handle-add add__cancel-btn" type="button" value="取消">
          </div>
        </td>`;
      return template;
    },

    getContent: async (newTabContent) => {
      documentUtils.getTableAddBtn(newTabContent);
      const tbody = newTabContent.querySelector("tbody");
      try {
        // 這邊如果 getAPI() 出錯就會跑去 catch，導致不會執行到 innerHTML 這 part
        // 且就算用 {} 來當作 dataObj，也會因為對 undefined 型態的東西做 encode 而出錯跳到 catch
        // const dataArr = await tabUtils.faq.getAPI();
        const dataArr = [
          {
            id: 1,
            sequence: 1,
            heading: "如何辦理退換貨？",
            content: `
            收到商品後如果有瑕疵或是缺件寄錯商品請於七天內提出，超過七天一律不受理。
            很抱歉讓您收到有問題的商品，如您的商品有問題，為加速處理流程，您可以拍照上傳至信箱，並留下您的問題說明，客服人員將會盡力幫您幫處理。`,
          },
        ];
        for (let i = 0; i < dataArr.length; i++) {
          const tableRow = document.createElement("tr");
          tableRow.innerHTML = tabUtils.faq.template(dataArr[i]);
          tbody.appendChild(tableRow);
        }
        // 新增完成後再將表格排序
        documentUtils.tableArrange(newTabContent);
      } catch (err) {
        console.log(err);
      }
    },
  },

  /* 菜單上傳的 func */
  // TODO:
  menu: {
    adminURL: "/admin-menu",

    getAPI: async () => {
      const response = await fetch(`${tabUtils.menu.adminURL}-get`, {
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

    updateAPI: async (id, data) => {
      const response = await fetch(`${tabUtils.menu.adminURL}-update/${id}`, {
        method: "POST",
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
        alert("抽獎資料儲存失敗！");
        throw err;
      }
    },

    deleteAPI: async (id) => {
      const response = await fetch(`${tabUtils.menu.adminURL}-delete/${id}`, {
        method: "GET",
      });

      try {
        if (!response.ok) {
          console.log("RESP(DELETE) NOT OK!");
          throw new Error(await response.text());
        }
      } catch (err) {
        alert("抽獎資料刪除失敗");
        throw err;
      }
    },

    addAPI: async (data) => {
      const response = await fetch(`${tabUtils.menu.adminURL}-add`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      });

      try {
        if (!response.ok) {
          console.log("RESP(ADD) NOT OK!");
          throw new Error(await response.text());
        }
        const lastId = await response.json();
        return lastId;
      } catch (err) {
        alert("抽獎資料新增失敗！");
        throw err;
      }
    },

    tableTitleArr: ["順序", "菜品名稱", "說明", "圖片", "價格", "狀態", "修改"],

    classNameArr: [
      "sequence",
      "dishname",
      "description",
      "image",
      "price",
      "state",
    ],

    optionTemplate: (state) => {
      if (state === "供應中") {
        return `
        <option selected>供應中</option>
        <option>停售中</option>`;
      } else {
        return `
        <option>供應中</option>
        <option selected>停售中</option>`;
      }
    },

    template: (data) => {
      const template = `
        <input type="hidden" class="id" value=${data.id}></input>
        <td class="sequence origin">${data.sequence}</td>
        <td class="dishname origin">${encodeHTML(data.name)}</td>
        <td class="description dish-description origin">
          <div>${encodeHTML(data.description)}</div>
        </td>
        <td class="image origin">
          <img class="image" src=${encodeHTML(data.image)}>
        </td>
        <td class="price dish-price origin">NT.${data.price}</td>
        <td class="state origin">${data.state}</td>
        <td class="btn__area origin">
          <div class="first__check-btn">
            <input class="btn update-btn" type="button" value="編輯">
            <input class="btn delete-btn delete__first-btn" type="button" value="刪除">
          </div>
  
          <div class="double__check-btn hide">
            <input class="btn delete-btn delete__check-btn" type="button" value="確認">
            <input class="btn delete-btn delete__cancel-btn" type="button" value="取消">
          </div>
        </td>
        
        <td class="sequence alt hide">
          <input class="alt__text" type="number" min="1" value=${data.sequence}>
        </td>
        <td class="dishname alt hide">
          <textarea class="alt__text" rows="1">${encodeHTML(
            data.name
          )}</textarea>
        </td>
        <td class="description alt hide">
          <textarea class="alt__text" rows="3">${encodeHTML(
            data.description
          )}</textarea>
        </td>
        <td class="image alt hide">
          <textarea class="alt__text" rows="1">${encodeHTML(
            data.image
          )}</textarea>
        </td>
        <td class="price alt hide">
          <input class="alt__text" type="number" min="1" value=${data.price}>
        </td>
        <td class="state alt hide">
          <select class="alt__text">
            ${tabUtils.menu.optionTemplate(data.state)}
          </select>
        </td>
        <td class="btn__area alt hide">
          <div class="handle__store-btn">
            <input class="btn store-btn" type="button" value="儲存">
            <input class="btn cancel-btn" type="button" value="取消">
          </div>
  
          <div class="handle__add-btn hide">
            <input class="btn handle-add add__check-btn" type="button" value="新增">
            <input class="btn handle-add add__cancel-btn" type="button" value="取消">
          </div>
        </td>`;
      return template;
    },

    getContent: async (newTabContent) => {
      documentUtils.getTableAddBtn(newTabContent);
      const tbody = newTabContent.querySelector("tbody");
      try {
        // 這邊如果 getAPI() 出錯就會跑去 catch，導致不會執行到 innerHTML 這 part
        // 且就算用 {} 來當作 dataObj，也會因為對 undefined 型態的東西做 encode 而出錯跳到 catch
        // const dataArr = await tabUtils.menu.getAPI();
        const dataArr = [
          {
            id: 1,
            sequence: 1,
            name: "鮮燉洋芋白丁佐莎莎",
            description: `
            收到商品後如果有瑕疵或是缺件寄錯商品請於七天內提出，超過七天一律不受理。
            很抱歉讓您收到有問題的商品，如您的商品有問題，為加速處理流程，您可以拍照上傳至信箱，並留下您的問題說明，客服人員將會盡力幫您幫處理。`,
            image: "/css/lottery_pic/bg.png",
            price: 200,
            state: "供應中",
          },
        ];
        for (let i = 0; i < dataArr.length; i++) {
          const tableRow = document.createElement("tr");
          tableRow.innerHTML = tabUtils.menu.template(dataArr[i]);
          tbody.appendChild(tableRow);
        }
        // 新增完成後再將表格排序
        documentUtils.tableArrange(newTabContent);
      } catch (err) {
        console.log(err);
      }
    },
  },

  /* 會員管理的 func */
  // TODO:
  member: {
    adminURL: "/admin-member",

    getAPI: async () => {
      const response = await fetch(`${tabUtils.member.adminURL}-get`, {
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

    tableTitleArr: [
      "姓名",
      "帳號",
      "Email",
      "訂購次數",
      "消費總額",
      "狀態",
      "管理",
    ],

    template: (data) => {
      let userState = data.user_auth ? "一般會員" : "停權會員";
      const template = `
        <input type="hidden" class="id" value=${data.id}></input>
        <td class="name">${encodeHTML(data.name)}</td>
        <td class="username">
          <div>${encodeHTML(data.username)}</div>
        </td>
        <td class="email">
          <div>${encodeHTML(data.email)}</div>
        </td>
        <td class="total-order">${data.order.totalNum}</td>
        <td class="total-spend">NT$.${data.order.totalSpend}</td>
        <td class="state">${userState}</td>
        <td class="btn__area">
          <input class="link-btn" type="button" value="查看詳情" onclick="location.href='/admin/member-detail'">
        </td>`;
      // TODO: 確認上面的 onclick 超連結寫法是否正確
      return template;
    },

    getContent: async (newTabContent) => {
      const tbody = newTabContent.querySelector("tbody");
      try {
        // 這邊如果 getAPI() 出錯就會跑去 catch，導致不會執行到 innerHTML 這 part
        // 且就算用 {} 來當作 dataObj，也會因為對 undefined 型態的東西做 encode 而出錯跳到 catch
        // const dataArr = await tabUtils.menu.getAPI();
        const dataArr = [
          {
            id: 1,
            name: "user",
            username: "user00",
            email: "user@mail.com",
            user_auth: 0,
            order: {
              totalNum: 20,
              totalSpend: 5000,
            },
          },
        ];
        for (let i = 0; i < dataArr.length; i++) {
          const tableRow = document.createElement("tr");
          tableRow.innerHTML = tabUtils.member.template(dataArr[i]);
          tbody.appendChild(tableRow);
        }
      } catch (err) {
        console.log(err);
      }
    },
  },

  /* 訂單列表的 func */
  // TODO:
  order: {
    adminURL: "/admin-order",

    getAPI: async () => {
      const response = await fetch(`${tabUtils.order.adminURL}-get`, {
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

    tableTitleArr: [
      "訂單狀態",
      "訂單編號",
      "訂單日期",
      "訂購人",
      "金額",
      "管理",
    ],

    template: (data) => {
      const template = `
        <input type="hidden" class="id" value=${data.id}></input>
        <td class="state">${encodeHTML(data.state)}</td>
        <td class="order-num">${data.num}</td>
        <td class="created-at">${encodeHTML(data.createdAt)}</td>
        <td class="orderer">${encodeHTML(data.user.name)}</td>
        <td class="price">NT$.${data.price}</td>
        <td class="btn__area">
          <input class="link-btn" type="button" value="查看詳情" onclick="location.href='/admin/order-detail'">
        </td>`;
      // TODO: 確認上面的 onclick 超連結寫法是否正確
      return template;
    },

    getContent: async (newTabContent) => {
      const tbody = newTabContent.querySelector("tbody");
      try {
        // 這邊如果 getAPI() 出錯就會跑去 catch，導致不會執行到 innerHTML 這 part
        // 且就算用 {} 來當作 dataObj，也會因為對 undefined 型態的東西做 encode 而出錯跳到 catch
        // const dataArr = await tabUtils.menu.getAPI();
        const dataArr = [
          {
            id: 1,
            state: "處理中",
            num: 12321,
            createdAt: "2022-08-05 14:23:51",
            price: 520,
            user: {
              name: "user",
            },
          },
        ];
        for (let i = 0; i < dataArr.length; i++) {
          const tableRow = document.createElement("tr");
          tableRow.innerHTML = tabUtils.order.template(dataArr[i]);
          tbody.appendChild(tableRow);
        }
      } catch (err) {
        console.log(err);
      }
    },
  },
};

// TODO: 看 user.js 是否也要改成這樣的寫法
document.addEventListener("DOMContentLoaded", () => {
  // 點擊 tab 頁籤改變樣式和顯示相應的內容
  document.querySelector(".tab__list").addEventListener("click", (e) => {
    if (e.target.classList.contains("tab-title")) {
      // 改變 tab-title 的樣式
      const tabTitle = document.querySelectorAll(".tab-title");
      for (let i = 0; i < tabTitle.length; i++) {
        if (tabTitle[i].classList.contains("active")) {
          tabTitle[i].classList.remove("active");
        }
      }
      e.target.classList.add("active");

      // 先隱藏 tab-content 的所有內容
      const tabContents = document.querySelectorAll(".tab-content");
      for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.add("hide");
      }

      // 再按照選擇的頁籤動態新增 tab-content 的內容
      const targetTabContentId = e.target.id.split("-")[0];
      const targetTabContent = document.querySelector(
        `.tab-content#${targetTabContentId}`
      );
      const contentArea = document.querySelector(".content__area");
      if (targetTabContent) {
        // 如果已經有內容，顯示出來即可
        targetTabContent.classList.remove("hide");
      } else {
        const newTabContent = document.createElement("div");
        newTabContent.classList.add("tab-content");
        newTabContent.setAttribute("id", targetTabContentId);
        contentArea.appendChild(newTabContent);
        documentUtils.getTabContent(
          tabUtils[targetTabContentId],
          newTabContent
        );
      }
    }
  });
  // 讓畫面一開始就呈現出抽獎項目的內容
  // TODO: 之後要改成用 url 來決定呈現哪個頁籤
  const lotteryTab = document.querySelector(".tab-title#lottery-tab");
  lotteryTab.click();

  // 頁籤內的表格按鈕功能
  document.querySelector(".content__area").addEventListener("click", (e) => {
    const targetRow = e.target.closest("tr");
    const targetTabContentId = e.target.closest(".tab-content").id;
    const targetTabUtils = tabUtils[targetTabContentId];
    const classNameArr = tabUtils[targetTabContentId].classNameArr;

    // 編輯功能
    if (e.target.classList.contains("update-btn")) {
      documentUtils.dataUpdate(targetRow, "update");
    }

    // 取消編輯功能
    if (e.target.classList.contains("cancel-btn")) {
      documentUtils.dataUpdate(targetRow, "cancel");
    }

    // 刪除功能 TODO: 資料庫建好後確認 dataDelete() 有無問題
    if (e.target.classList.contains("delete-btn")) {
      documentUtils.tableRowDelete(e, targetTabUtils);
    }

    // 儲存功能 TODO: 各頁籤功能完成後，確認跟 dataStoreUser() 的差別
    if (e.target.classList.contains("store-btn")) {
      documentUtils.dataStoreAdmin(
        targetRow,
        targetTabContentId,
        targetTabUtils,
        classNameArr
      );
    }

    // 新增功能(表格的新增按鈕，只新增欄位)
    if (e.target.classList.contains("add-btn")) {
      documentUtils.tableRowAdd(e, targetTabUtils, classNameArr);
    }

    // 新增功能(表格欄位的新增按鈕，新增到資料庫) TODO: 待資料庫建好後確認使用上有無問題
    if (e.target.classList.contains("handle-add")) {
      documentUtils.dataAdd(
        e,
        targetTabContentId,
        targetTabUtils,
        classNameArr
      );
    }
  });
});
