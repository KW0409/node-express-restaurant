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

  // 塞入表格的內容
  getTabContent: (targetTab, newTabContent) => {
    if (targetTab === "order") {
      const titleArr = ["訂單編號", "訂單日期", "金額", "狀態", "管理"];
      documentUtils.getTableTitle(newTabContent, titleArr);
      orderUtils.getContent(newTabContent);
    }
  },

  // 表格自動排序功能
  tableArrange: (targetTabContent) => {
    const tbody = targetTabContent.querySelector("tbody");
    const trNodeList = targetTabContent.querySelectorAll("tbody tr");
    const trArrList = [];
    for (let i = 0; i < trNodeList.length; i++) {
      // selectorAll 抓到的 trNodeList 不是真正的 arr，因此要先變成一個真正的 arr 才能操作
      trArrList.push(trNodeList[i]);
    }

    const newArrDOM = [];
    const { length } = trArrList;
    for (let i = 0; i < length; i++) {
      let minNum = Number(
        trArrList[0].querySelector(".sequence.origin").innerText
      );
      let minNumIndex = 0;
      for (let j = 1; j < trArrList.length; j++) {
        const currentNum = Number(
          trArrList[j].querySelector(".sequence.origin").innerText
        );
        if (currentNum < minNum) {
          minNum = currentNum;
          minNumIndex = j;
        }
      }
      newArrDOM.push(trArrList[minNumIndex]);
      trArrList.splice(minNumIndex, 1);
    }

    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }
    for (let i = 0; i < newArrDOM.length; i++) {
      tbody.appendChild(newArrDOM[i]);
    }
  },

  // 檢查表格欄位值(是否有空值＆機率總和)功能
  tableCheckData: (targetRow, classNameArr, dataObj) => {
    for (const className of classNameArr) {
      // 先判斷有無空白欄位
      if (targetRow.querySelector(`.${className} .alt__text`).value === "") {
        alert("表格欄位不可以有空白！");
        return;
      }
      dataObj[className] = targetRow.querySelector(
        `.${className} .alt__text`
      ).value;
    }

    const percentageList = document.querySelectorAll(".percentage .alt__text");
    let percentageSum = 0;
    for (const percentage of percentageList) {
      percentageSum += Number(percentage.value);
    }
    if (percentageSum > 100) {
      // 不需再限定不可低於 100%，不然會造成無法改動表格
      return alert(`
      機率總和不可超過 100%！目前機率： ${percentageSum} %
      建議立刻報名幼幼班數學，加強輔導！`);
    }
    return true;
  },

  // 編輯表格功能
  tableUpdate: (e) => {
    const targetRow = e.target.closest("tr");
    const targetContents = targetRow.querySelectorAll(".origin");
    const targetAlt = targetRow.querySelectorAll(".alt");

    for (let i = 0; i < targetContents.length; i++) {
      targetContents[i].classList.add("hide");
      targetAlt[i].classList.remove("hide");
    }
  },

  // 取消編輯表格功能
  tableCancel: (e) => {
    const targetRow = e.target.closest("tr");
    const targetContents = targetRow.querySelectorAll(".origin");
    const targetAlt = targetRow.querySelectorAll(".alt");
    for (let i = 0; i < targetContents.length; i++) {
      targetContents[i].classList.remove("hide");
      targetAlt[i].classList.add("hide");
    }
  },

  // 儲存表格功能
  tableStore: async (e, targetTab, classNameArr) => {
    const targetRow = e.target.closest("tr");
    const data = { id: targetRow.querySelector("input.id").value };
    const dataCheckPass = documentUtils.tableCheckData(
      targetRow,
      classNameArr,
      data
    );
    if (!dataCheckPass) {
      // 如果通過 documentUtils.tableCheckData 會回傳 true，反之回傳 undefined
      return;
    }

    const targetTabContent = targetRow.closest(`.tab-content#${targetTab}`);
    if (targetTab === "lottery") {
      try {
        await lotteryUtils.updateAPI(data.id, data);
        targetRow.innerHTML = lotteryUtils.template(data);
        documentUtils.tableArrange(targetTabContent);
      } catch (err) {
        console.log(err);
      }
    }
  },

  // 刪除表格欄位功能(只是單純刪除表格欄位，並沒有刪除資料庫的資料)
  tableDeleteRow: (e, targetTab) => {
    const targetRow = e.target.closest("tr");
    const firstCheckBtn = targetRow.querySelector(".first__check-btn");
    const doubleCheckBtn = targetRow.querySelector(".double__check-btn");
    if (e.target.classList.contains("delete__first-btn")) {
      firstCheckBtn.classList.add("hide");
      doubleCheckBtn.classList.remove("hide");
    } else if (e.target.classList.contains("delete__cancel-btn")) {
      firstCheckBtn.classList.remove("hide");
      doubleCheckBtn.classList.add("hide");
    } else if (e.target.classList.contains("delete__check-btn")) {
      const id = targetRow.querySelector("input.id").value;
      documentUtils.tableDeleteData(targetTab, targetRow, id);
    }
  },

  // 刪除表格資料功能(把刪除的欄位 fetch delete 到資料庫)
  tableDeleteData: async (targetTab, targetRow, id) => {
    if (targetTab === "lottery") {
      try {
        await lotteryUtils.deleteAPI(id);
        targetRow.parentNode.removeChild(targetRow);
      } catch (err) {
        console.log(err);
      }
    }
  },

  // 新增表格欄位功能(只是單純新增表格欄位，還沒有新增到資料庫)
  tableAddRow: (e, targetTab, classNameArr) => {
    const newRow = document.createElement("tr");
    const data = { id: "0" };
    for (const className of classNameArr) {
      data[className] = "";
    }

    if (targetTab === "lottery") {
      newRow.innerHTML = lotteryUtils.template(data);
    }
    const targetTabTbody = e.target.parentNode.querySelector("tbody");
    targetTabTbody.appendChild(newRow);
    newRow.querySelector(".handle__store-btn").classList.add("hide");
    newRow.querySelector(".handle__add-btn").classList.remove("hide");
    newRow.querySelector(".update-btn").click();
  },

  // 新增表格資料功能(把新增的欄位 fetch add 到資料庫)
  tableAddData: async (e, targetTab, classNameArr) => {
    const targetRow = e.target.closest("tr");
    if (e.target.classList.contains("add__cancel-btn")) {
      targetRow.parentNode.removeChild(targetRow);
      return;
    }

    const data = {};
    const dataCheckPass = documentUtils.tableCheckData(
      targetRow,
      classNameArr,
      data
    );
    if (!dataCheckPass) {
      // 如果通過 documentUtils.tableCheckData 會回傳 true，反之回傳 undefined
      return;
    }

    const targetTabContent = targetRow.closest(`.tab-content#${targetTab}`);
    if (targetTab === "lottery") {
      try {
        data.id = await lotteryUtils.addAPI(data);
        targetRow.innerHTML = lotteryUtils.template(data);
        documentUtils.tableArrange(targetTabContent);
      } catch (err) {
        console.log(err);
      }
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

  deleteAPI: async (id) => {
    const response = await fetch(`${lotteryUtils.adminURL}-delete/${id}`, {
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
    const response = await fetch(`${lotteryUtils.adminURL}-add`, {
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

  updateAPI: async (id, data) => {
    const response = await fetch(`${lotteryUtils.adminURL}-update/${id}`, {
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
    const response = await fetch(`${lotteryUtils.adminURL}-delete/${id}`, {
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
    const response = await fetch(`${lotteryUtils.adminURL}-add`, {
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
    //TODO:
    const tbody = newTabContent.querySelector("tbody");
    try {
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
  const contentArea = document.querySelector(".order-data-container");
  orderUtils.getContent(contentArea);
});
