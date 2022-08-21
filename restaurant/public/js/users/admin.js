/* 通用 func */
const documentUtils = {
  tableTemplate: `
  <table>
    <thead></thead>
    <tbody></tbody>
  </table>
  `,

  // 讓表格添加新增按鈕
  getTableAddBtn: (newTabContent) => {
    //<input class="add-btn" type="button" value="新增">
    const addBtn = document.createElement("input");
    addBtn.classList.add("add-btn");
    addBtn.setAttribute("type", "button");
    addBtn.setAttribute("value", "新增");
    newTabContent.appendChild(addBtn);
  },

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
  getTabContent: (targetTabId, newTabContent) => {
    if (tabUtils[targetTabId].tableTitleArr) {
      newTabContent.innerHTML = documentUtils.tableTemplate;
      let titleArr = tabUtils[targetTabId].tableTitleArr;
      documentUtils.getTableTitle(newTabContent, titleArr);
    }
    tabUtils[targetTabId].getContent(newTabContent);
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
  // TODO: 確認其他表格不會被檢查機率應該就好了，還有因為改過名稱，要確認函式名稱問題
  dataCheck: (targetRow, classNameArr, dataObj) => {
    for (const className of classNameArr) {
      let altInputValue = targetRow.querySelector(
        `.${className} .alt__text`
      ).value;
      // 判斷是否有空值
      if (altInputValue === "") {
        return alert("表格欄位不可以有空白！");
      }
      dataObj[className] = altInputValue;
    }
    console.log(dataObj); //TODO:

    const percentageList = document.querySelectorAll(".percentage .alt__text");
    if (percentageList.length) {
      let percentageSum = 0;
      for (const percentage of percentageList) {
        percentageSum += Number(percentage.value);
      }
      if (percentageSum > 100) {
        // 限定不可超過 100% 即可，不然會無法改動表格
        return alert(`機率總和不可超過 100%！目前機率： ${percentageSum} %`);
      }
    }
    return true;
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
  // TODO: 各頁籤功能完成後，確認跟 user.js 的差別
  dataStore: async (target, targetTabId, classNameArr) => {
    const data = { id: target.querySelector("input.id").value };
    const dataCheckPass = documentUtils.dataCheck(target, classNameArr, data);
    if (!dataCheckPass) {
      // 如果通過 documentUtils.dataCheck 會回傳 true，反之直接 return
      return;
    }

    const targetTabContent = target.closest(`.tab-content#${targetTabId}`);
    try {
      await tabUtils[targetTabId].updateAPI(data.id, data);
      target.innerHTML = tabUtils[targetTabId].template(data);
      documentUtils.tableArrange(targetTabContent);
    } catch (err) {
      console.log(err);
    }
  },

  // 刪除表格欄位功能(只是單純刪除表格欄位，並沒有刪除資料庫的資料)
  tableRowDelete: (e, targetTabId) => {
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
      documentUtils.dataDelete(targetTabId, targetRow, id);
    }
  },

  // 刪除表格資料功能(把刪除的欄位 fetch delete 到資料庫)
  // TODO: 待資料庫建好後確認使用上有無問題
  dataDelete: async (targetTabId, targetRow, id) => {
    try {
      await tabUtils[targetTabId].deleteAPI(id);
      targetRow.parentNode.removeChild(targetRow);
    } catch (err) {
      console.log(err);
    }
  },

  // 新增表格欄位功能(只是單純新增表格欄位，還沒有新增到資料庫)
  tableRowAdd: (e, targetTabId, classNameArr) => {
    const newRow = document.createElement("tr");
    const data = { id: "0" };
    for (const className of classNameArr) {
      data[className] = "";
    }
    newRow.innerHTML = tabUtils[targetTabId].template(data);

    const targetTabTbody = e.target.parentNode.querySelector("tbody");
    targetTabTbody.appendChild(newRow);
    newRow.querySelector(".handle__store-btn").classList.add("hide");
    newRow.querySelector(".handle__add-btn").classList.remove("hide");
    newRow.querySelector(".update-btn").click();
  },

  // 新增表格資料功能(把新增的欄位 fetch add 到資料庫)
  // TODO: 待資料庫建好後確認使用上有無問題
  dataAdd: async (e, targetTabId, classNameArr) => {
    const targetRow = e.target.closest("tr");
    if (e.target.classList.contains("add__cancel-btn")) {
      targetRow.parentNode.removeChild(targetRow);
      return;
    }

    const data = {};
    const dataCheckPass = documentUtils.dataCheck(
      targetRow,
      classNameArr,
      data
    );
    if (!dataCheckPass) return;

    const targetTabContent = targetRow.closest(`.tab-content#${targetTabId}`);
    try {
      data.id = await tabUtils[targetTabId].addAPI(data);
      targetRow.innerHTML = tabUtils[targetTabId].template(data);
      documentUtils.tableArrange(targetTabContent);
    } catch (err) {
      console.log(err);
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
      const targetTabId = e.target.id;
      const targetTabContent = document.querySelector(
        `.tab-content#${targetTabId}`
      );
      const contentArea = document.querySelector(".content__area");
      if (targetTabContent) {
        // 如果已經有內容，顯示出來即可
        targetTabContent.classList.remove("hide");
      } else {
        const newTabContent = document.createElement("div");
        newTabContent.classList.add("tab-content");
        newTabContent.setAttribute("id", targetTabId);
        contentArea.appendChild(newTabContent);
        documentUtils.getTabContent(targetTabId, newTabContent);
        /* TODO:
        if (eventListenerUtils[`${targetTabId}`]) {
          eventListenerUtils[`${targetTabId}`](newTabContent);
        }
        */
      }
    }
  });

  // 頁籤內的表格按鈕功能
  document.querySelector(".content__area").addEventListener("click", (e) => {
    const targetRow = e.target.closest("tr");
    const targetTabId = e.target.closest(".tab-content").id;
    const classNameArr = tabUtils[targetTabId].classNameArr;

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
      documentUtils.tableRowDelete(e, targetTabId);
    }

    // 儲存功能 TODO: 各頁籤功能完成後，確認 dataStore() 跟 user.js 的差別
    if (e.target.classList.contains("store-btn")) {
      documentUtils.dataStore(targetRow, targetTabId, classNameArr);
    }

    // 新增功能(表格的新增按鈕，只新增欄位)
    if (e.target.classList.contains("add-btn")) {
      documentUtils.tableRowAdd(e, targetTabId, classNameArr);
    }

    // 新增功能(表格欄位的新增按鈕，新增到資料庫) TODO: 待資料庫建好後確認使用上有無問題
    if (e.target.classList.contains("handle-add")) {
      documentUtils.dataAdd(e, targetTabId, classNameArr);
    }
  });

  // 讓畫面一開始就呈現出抽獎項目的內容
  // TODO: 之後要改成用 url 來決定呈現哪個頁籤
  const lotteryTab = document.querySelector(".tab-title#lottery");
  lotteryTab.click();
});
