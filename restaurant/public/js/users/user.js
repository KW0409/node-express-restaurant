/* 通用 func */
const documentUtils = {
  tableTemplate: `
  <table>
    <thead></thead>
    <tbody></tbody>
  </table>
  `,

  // 塞入表格的標題
  getTableTitle: (newTabContent, titleArr) => {
    const thead = newTabContent.querySelector("thead");
    const theadRow = document.createElement("tr");
    for (let i = 0; i < titleArr.length; i++) {
      const tableTitle = document.createElement("th");
      tableTitle.innerText = titleArr[i];
      theadRow.appendChild(tableTitle);
    }
    thead.appendChild(theadRow);
  },

  // 編輯表格or取消編輯表格功能
  dataUpdate: (target, action) => {
    const originContents = target.querySelectorAll(".origin");
    const altInput = target.querySelectorAll(".alt");

    for (let i = 0; i < originContents.length; i++) {
      if (action === "update") {
        originContents[i].classList.add("hide");
        altInput[i].classList.remove("hide");
      } else if (action === "cancel") {
        originContents[i].classList.remove("hide");
        altInput[i].classList.add("hide");
      }
    }
  },

  // 儲存表格功能
  dataStore: async (target, defaultData, classNameArr, utils, needArrange) => {
    const data = defaultData || {
      id: target.querySelector("input.id").value,
    };

    for (const className of classNameArr) {
      data[className] = target.querySelector(`.${className} .alt__text`).value;
    }

    try {
      await utils.updateAPI(data);
      target.innerHTML = utils.template(data);
      if (needArrange) {
        const targetTabContent = target.closest(`.tab-content#${targetTab}`);
        documentUtils.tableArrange(targetTabContent);
      }
    } catch (err) {
      console.log(err);
      // TODO: 確認錯誤之後要做什麼動作
      // target.innerHTML = utils.template(data);
    }
  },
};

function encodeHTML(str) {
  // 對 number type 的值做 encodeHTML 會出錯
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;");
}

/* 會員資料的 func */ //TODO:
const dataUtils = {
  adminURL: "/admin-lottery",

  getAPI: async () => {
    const response = await fetch(`${dataUtils.adminURL}-get`, {
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

  updateAPI: async (data) => {
    // 在使用者的 controller 去拿 req.session.username 來做權限管理的身份確認
    const response = await fetch(`${dataUtils.adminURL}-update`, {
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

  template: (data) => {
    const htmlTemplate = `
      <div class="data__wrapper">
        <div class="user-data">帳號：
          <span>${encodeHTML(data.username)}</span>
        </div>
        <div class="user-data name">姓名：
          <span class="origin">${encodeHTML(data.name)}</span>
          <input class="alt hide alt__text" type="text" value=${encodeHTML(
            data.name
          )}>
        </div>
        <div class="user-data address">地址：
          <span class="origin">${encodeHTML(data.address)}</span>
          <input class="alt hide alt__text" type="text" value=${encodeHTML(
            data.address
          )}>
        </div>
        <div class="user-data phone">電話：
          <span class="origin">${encodeHTML(data.phone)}</span>
          <input class="alt hide alt__text" type="tel" value=${encodeHTML(
            data.phone
          )}>
        </div>
        <div class="user-data email">信箱：
          <span class="origin">${encodeHTML(data.email)}</span>
          <input class="alt hide alt__text" type="email" value=${encodeHTML(
            data.email
          )}>
        </div>
        
        <div class="btn__area">
          <div class="handle__update-btn origin">
            <input class="btn update-btn" type="button" value="編輯">
          </div>

          <div class="handle__store-btn alt hide">
            <input class="btn store-btn" type="button" value="儲存">
            <input class="btn cancel-btn" type="button" value="取消">
          </div>
        </div>
      </div>`;
    return htmlTemplate;
  },

  getContent: async (newTabContent) => {
    //TODO:
    try {
      // 這邊如果 getAPI() 出錯就會跑去 catch，導致不會執行到 innerHTML 這 part
      // 且就算用 {} 來當作 dataObj，也會因為對 undefined 型態的東西做 encode 而出錯跳到 catch
      const dataObj = {
        // (await dataUtils.getAPI());
        username: "user00",
        name: "user",
        address: "台灣台北",
        phone: "09123456789",
        email: "user@mail.com",
      };
      newTabContent.innerHTML = dataUtils.template(dataObj);
    } catch (err) {
      console.log(err);
      newTabContent.innerHTML = `<span>error</span>`; //TODO:
    }
  },
};

/* 訂單記錄的 func */ //TODO:
const orderUtils = {
  adminURL: "/admin-lottery",

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
      <input type="hidden" class="id" value=${data.id}></input>
      <td class="order-num">${data.num}</td>
      <td class="created-at">${encodeHTML(data.createdAt)}</td>
      <td class="price">${encodeHTML(data.price)}</td>
      <td class="state">${encodeHTML(data.state)}</td>
      <td class="btn__area">
        <input class="link-btn" type="button" value="查看詳情" onclick="location.href='/user/order-detail'">
      </td>`;
    // TODO: 確認上面的 onclick 超連結寫法是否正確
    return htmlTemplate;
  },

  getContent: async (newTabContent) => {
    const titleArr = ["訂單編號", "訂單日期", "金額", "狀態", "管理"];
    documentUtils.getTableTitle(newTabContent, titleArr);

    const tbody = newTabContent.querySelector("tbody");
    try {
      //TODO:
      // 這邊如果 getAPI() 出錯就會跑去 catch，導致不會執行到 innerHTML 這 part
      // 且就算用 {} 來當作 dataObj，也會因為對 undefined 型態的東西做 encode 而出錯跳到 catch
      // const dataArr = await orderUtils.getAPI();
      const dataArr = [
        {
          // (await orderUtils.getAPI());
          id: 1,
          createdAt: "2022-08-05 14:23:51",
          num: 123321,
          price: "$520",
          state: "處理中",
        },
      ];
      for (let i = 0; i < dataArr.length; i++) {
        const tableRow = document.createElement("tr");
        tableRow.innerHTML = orderUtils.template(dataArr[i]);
        tbody.appendChild(tableRow);
      }
    } catch (err) {
      console.log(err);
      newTabContent.innerHTML = `<span>error</span>`; //TODO:
    }
  },
};

document.addEventListener("DOMContentLoaded", () => {
  // 點擊 tab 頁籤改變樣式和顯示相應的內容
  document.querySelector(".tab__area").addEventListener("click", (e) => {
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
      const targetTab = e.target.id;
      const targetTabContent = document.querySelector(
        `.tab-content#${targetTab}content`
      );
      const contentArea = document.querySelector(".content__area");
      if (targetTabContent) {
        // 如果已經有內容，顯示出來即可
        targetTabContent.classList.remove("hide");
      } else {
        const newTabContent = document.createElement("div");
        newTabContent.classList.add("tab-content");
        newTabContent.setAttribute("id", `${targetTab}content`);
        contentArea.appendChild(newTabContent);
        if (targetTab === "order") {
          newTabContent.innerHTML = documentUtils.tableTemplate;
          orderUtils.getContent(newTabContent);
        } else {
          dataUtils.getContent(newTabContent);
          eventListenerUtils[`${targetTab}`](newTabContent);
        }
      }
    }
  });

  // 讓畫面一開始就呈現出會員資料的內容
  const dataTab = document.querySelector(".tab-title#data");
  dataTab.click();
});

/* 各個表格的 func */
const eventListenerUtils = {
  /* 會員資料項目的功能 */
  data: (tabContentArea) => {
    tabContentArea.addEventListener("click", (e) => {
      const targetTabContent = e.target.closest(".tab-content");

      // 編輯功能
      if (e.target.classList.contains("update-btn")) {
        documentUtils.dataUpdate(targetTabContent, "update");
      }

      // 取消編輯功能
      if (e.target.classList.contains("cancel-btn")) {
        documentUtils.dataUpdate(targetTabContent, "cancel");
      }

      // 儲存功能
      let classNameArr = ["name", "address", "phone", "email"];
      if (e.target.classList.contains("store-btn")) {
        // TODO: 這邊只是暫時這樣寫，以免在下面 dataUtils.template(data) 出錯
        const data = { username: "user00" };
        documentUtils.dataStore(
          targetTabContent,
          data,
          classNameArr,
          dataUtils,
          false
        );

        /*
        dataUtils
          .updateAPI(data)
          .then(() => {
            targetTabContent.innerHTML = dataUtils.template(data);
          })
          .catch((err) => {
            // TODO: 這邊只是暫時這樣寫，之後要改成 try/catch，並加上比較好的錯誤處理
            console.log(err);
            targetTabContent.innerHTML = dataUtils.template(data);
          });
        */
      }
    });
  },
};
