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
