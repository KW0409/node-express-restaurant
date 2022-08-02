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
      const titleArr = ["訂單編號", "訂單金額", "訂單狀態", "管理"];
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

/* 會員資料的 func */
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
      <div class="wrapper">
        <div>帳號：<span>${encodeHTML(data.username)}</span></div>
        <div>姓名：<span>${encodeHTML(data.name)}</span></div>
        <div>地址：<span>${encodeHTML(data.address)}</span></div>
        <div>電話：<span>${encodeHTML(data.phone)}</span></div>
        <div>信箱：<span>${encodeHTML(data.email)}</span></div>
        
        <div class="handle__add-btn hide">
          <input class="btn handle-add add__check-btn" type="button" value="編輯">
        </div>
      </div>
      `;
    return htmlTemplate;
  },

  getContent: async (newTabContent) => {
    try {
      // 這邊如果 getAPI() 出錯就會跑去 catch，導致不會執行到 innerHTML 這 part
      // 且就算用 {} 來當作 dataObj，也會因為對 undefined 型態的東西做 encode 而出錯跳到 catch
      const dataObj = {
        username: "",
        name: "",
        address: "",
        phone: "",
        email: "",
      }; // (await dataUtils.getAPI());
      newTabContent.innerHTML = dataUtils.template(dataObj);
    } catch (err) {
      console.log(err);
      newTabContent.innerHTML = `<span>error</span>`; //TODO:
    }
  },
};

/* 訂單記錄的 func */
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
    return htmlTemplate;
  },

  getContent: async (newTabContent) => {
    const tbody = newTabContent.querySelector("tbody");
    try {
      const dataArr = await orderUtils.getAPI();
      for (let i = 0; i < dataArr.length; i++) {
        const tableRow = document.createElement("tr");
        tableRow.innerHTML = orderUtils.template(dataArr[i]);
        tbody.appendChild(tableRow);
      }
      // 新增完成後再將表格排序
      documentUtils.tableArrange(newTabContent);
    } catch (err) {
      console.log(err);
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
        `.tab-content#${targetTab}content` // TODO: 兩者的關係在這
      );
      const contentArea = document.querySelector(".content__area");
      if (targetTabContent) {
        // 如果已經有內容，顯示出來即可
        targetTabContent.classList.remove("hide");
      } else {
        const newTabContent = document.createElement("div");
        newTabContent.classList.add("tab-content");
        newTabContent.setAttribute("id", `${targetTab}content`); // TODO: 兩者的關係在這
        if (targetTab === "order") {
          newTabContent.innerHTML = documentUtils.tableTemplate;
          contentArea.appendChild(newTabContent);
          documentUtils.getTabContent(targetTab, newTabContent);
        } else {
          contentArea.appendChild(newTabContent);
          dataUtils.getContent(newTabContent);
        }
        eventListenerUtils[`${targetTab}`](newTabContent);
      }
    }
  });

  // 讓畫面一開始就呈現出抽獎項目的內容
  // 必須放在 tab__area 的 eventListener 之後才有用
  const dataTab = document.querySelector(".tab-title#data");
  dataTab.click();
});

/* 各個表格的 func */
const eventListenerUtils = {
  /* 會員資料項目的功能 */
  data: (tabContentArea) => {
    tabContentArea.addEventListener("click", (e) => {
      // 編輯功能
      if (e.target.classList.contains("update-btn")) {
        documentUtils.tableUpdate(e);
      }

      // 取消編輯功能
      if (e.target.classList.contains("cancel-btn")) {
        documentUtils.tableCancel(e);
      }

      // 刪除功能
      if (e.target.classList.contains("delete-btn")) {
        documentUtils.tableDeleteRow(e, "lottery");
      }

      const classNameArr = [
        "sequence",
        "rank",
        "prize",
        "description",
        "image",
        "amount",
        "percentage",
      ];
      // 儲存功能
      if (e.target.classList.contains("store-btn")) {
        documentUtils.tableStore(e, "lottery", classNameArr);
      }

      // 新增功能(只新增欄位)
      if (e.target.classList.contains("add-btn")) {
        documentUtils.tableAddRow(e, "lottery", classNameArr);
      }

      // 新增功能(新增到資料庫)
      if (e.target.classList.contains("handle-add")) {
        documentUtils.tableAddData(e, "lottery", classNameArr);
      }
    });
  },

  /* 訂單記錄的功能(coming soon....) */
  order: (tabContentArea) => {
    tabContentArea.addEventListener("click", (e) => {
      // 編輯功能
      if (e.target.classList.contains("update-btn")) {
        documentUtils.tableUpdate(e);
      }

      // 取消編輯功能
      if (e.target.classList.contains("cancel-btn")) {
        documentUtils.tableCancel(e);
      }

      // 刪除功能
      if (e.target.classList.contains("delete-btn")) {
        documentUtils.tableDeleteRow(e, "lottery");
      }

      const classNameArr = [
        "sequence",
        "rank",
        "prize",
        "description",
        "image",
        "amount",
        "percentage",
      ];
      // 儲存功能
      if (e.target.classList.contains("store-btn")) {
        documentUtils.tableStore(e, "lottery", classNameArr);
      }

      // 新增功能(只新增欄位)
      if (e.target.classList.contains("add-btn")) {
        documentUtils.tableAddRow(e, "lottery", classNameArr);
      }

      // 新增功能(新增到資料庫)
      if (e.target.classList.contains("handle-add")) {
        documentUtils.tableAddData(e, "lottery", classNameArr);
      }
    });
  },
};
